import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../", import.meta.url)));
const publicDir = resolve(projectRoot, "public");
const publicAssetsDir = resolve(publicDir, "assets");
const sourceText = [
  await readFile(resolve(projectRoot, "index.html"), "utf8"),
  ...(await readTextFiles(resolve(projectRoot, "src"))),
].join("\n");

const publicFiles = await listFiles(publicDir);
const deployedBytes = (
  await Promise.all(publicFiles.map(async (file) => (await stat(file)).size))
).reduce((total, size) => total + size, 0);

assert(
  deployedBytes <= 2 * 1024 ** 2,
  `Public assets exceed the 2 MB deployment budget (${formatBytes(deployedBytes)}).`,
);
assert(
  !publicFiles.some((file) => file.endsWith(".DS_Store")),
  "A .DS_Store file would be copied into the deployment.",
);

const imageFiles = (await listFiles(publicAssetsDir)).filter((file) =>
  /\.(avif|gif|jpe?g|png|webp)$/i.test(file),
);
const unusedImages = imageFiles.filter(
  (file) => !sourceText.includes(relative(publicAssetsDir, file)),
);
assert(
  unusedImages.length === 0,
  `Unreferenced public images: ${unusedImages.map((file) => relative(projectRoot, file)).join(", ")}`,
);

console.log(
  `Asset audit passed: ${imageFiles.length + 1} deployed images, ${formatBytes(deployedBytes)} public payload.`,
);

async function readTextFiles(directory) {
  const files = await listFiles(directory);
  return Promise.all(
    files
      .filter((file) => [".css", ".js", ".jsx"].includes(extname(file)))
      .map((file) => readFile(file, "utf8")),
  );
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );
  return nested.flat();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function formatBytes(bytes) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}
