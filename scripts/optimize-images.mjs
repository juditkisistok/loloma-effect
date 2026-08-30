import { mkdir, stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(projectRoot, "source-assets/images");
const publicAssetsDir = resolve(projectRoot, "public/assets");

const cutouts = [
  ["blue-cleanup-bucket.png", "blue-cleanup-bucket.webp", 384],
  ["brain-coral.png", "brain-coral.webp", 360],
  ["branching-coral-a.png", "branching-coral-a.webp", 640],
  ["branching-coral-lavender.png", "branching-coral-lavender.webp", 600],
  ["coastal-tree-cluster.png", "coastal-tree-cluster.webp", 384],
  ["mature-mangrove.png", "mature-mangrove.webp", 384],
  ["palm-tree.png", "palm-tree.webp", 384],
  ["soft-coral-pink.png", "soft-coral-pink.webp", 560],
  ["table-coral-transparent.png", "table-coral-transparent.webp", 768],
];

await mkdir(publicAssetsDir, { recursive: true });

for (const [sourceName, outputName, width] of cutouts) {
  await sharp(resolve(sourceDir, sourceName))
    .resize({ width, withoutEnlargement: true, fit: "inside" })
    .webp({
      quality: 82,
      alphaQuality: 90,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(resolve(publicAssetsDir, outputName));
}

await sharp(resolve(sourceDir, "og-image-source.png"))
  .resize({ width: 1200, withoutEnlargement: true })
  .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:2:0" })
  .toFile(resolve(publicAssetsDir, "og-image.jpg"));

await sharp(resolve(sourceDir, "favicon-source.png"))
  .resize({ width: 128, height: 128, fit: "contain" })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(resolve(projectRoot, "public/favicon.png"));

const generatedFiles = [
  ...cutouts.map(([, outputName]) => resolve(publicAssetsDir, outputName)),
  resolve(publicAssetsDir, "og-image.jpg"),
  resolve(projectRoot, "public/favicon.png"),
];
const generatedBytes = (
  await Promise.all(generatedFiles.map(async (file) => (await stat(file)).size))
).reduce((total, size) => total + size, 0);

console.log(
  `Optimized ${generatedFiles.length} images (${formatBytes(generatedBytes)} total).`,
);
for (const file of generatedFiles) {
  const { size } = await stat(file);
  console.log(`  ${basename(file)} ${formatBytes(size)}`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}
