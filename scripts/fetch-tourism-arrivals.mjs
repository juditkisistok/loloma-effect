import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { csvFormat, csvParse } from "d3";

const apiUrl =
  "https://stats-sdmx-disseminate.pacificdata.org/rest/data/SPC,DF_TOURISM_ARRIVALS,1.0/A.FJ.?dimensionAtObservation=AllDimensions&format=csv";

const explorerUrl =
  "https://stats.pacificdata.org/vis?locale=en&dataflow[datasourceId]=SPC2&dataflow[agencyId]=SPC&dataflow[dataflowId]=DF_TOURISM_ARRIVALS&dataflow[version]=1.0";

const csvPath = fileURLToPath(
  new URL("../public/data/tourism-arrivals.csv", import.meta.url),
);
const bundledCsvPath = fileURLToPath(
  new URL("../src/data/tourism-arrivals.csv", import.meta.url),
);
const rawCsvPath = fileURLToPath(
  new URL("../public/data/tourism-arrivals-spc-raw.csv", import.meta.url),
);
const metadataPath = fileURLToPath(
  new URL("../public/data/tourism-arrivals.metadata.json", import.meta.url),
);

const sourceSpc = {
  id: "spc-tourism-arrivals",
  name: "Pacific Data Hub .Stat",
  url: explorerUrl,
  apiUrl,
  note: "SPC DF_TOURISM_ARRIVALS annual visitor-arrivals series (VISITOR_DURATION_CAT = TOUR).",
};

const sourceStatsFiji2025 = {
  id: "fiji-stats-preliminary-2025",
  name: "Fiji Bureau of Statistics provisional visitor arrivals",
  url: "https://www.statsfiji.gov.fj/provisional-visitor-arrivals-december-2025/",
  publishedDate: "2026-01-18",
  note: "Provisional 2025 annual visitor arrivals, not yet present in the SPC extract.",
};

const sourceStatsFiji2024 = {
  id: "fiji-stats-provisional-2024",
  name: "Fiji Bureau of Statistics provisional visitor arrivals",
  url: "https://www.statsfiji.gov.fj/provisional-visitor-arrivals-2024/",
  publishedDate: "2025-01-16",
  note: "Provisional 2024 annual visitor arrivals; used in place of an inconsistent value in the SPC extract.",
};

const sourceStatsFijiSupplemental = {
  id: "fiji-stats-supplemental",
  name: "Fiji Bureau of Statistics visitor-arrivals table",
  url: "https://www.statsfiji.gov.fj/statistics/social-statistics/tourism-and-migration-statistics/",
  note: "Official Fiji visitor-arrivals table used for the exact 2006 national total.",
};

const supplementalRows = [
  {
    year: 2006,
    arrivals: 548589,
    geo_code: "FJ",
    geography: "Fiji",
    unit: "N",
    source_id: sourceStatsFijiSupplemental.id,
    is_preliminary: "FALSE",
    note: "Exact national total from Fiji Bureau of Statistics; replaces the rounded 549,000 value in the Pacific Data Hub dataset.",
  },
  {
    year: 2024,
    arrivals: 982938,
    geo_code: "FJ",
    geography: "Fiji",
    unit: "N",
    source_id: sourceStatsFiji2024.id,
    is_preliminary: "TRUE",
    note: "Provisional national total published January 16 2025; replaces the Pacific Data Hub extract's inconsistent 928,938 value.",
  },
  {
    year: 2025,
    arrivals: 986367,
    geo_code: "FJ",
    geography: "Fiji",
    unit: "N",
    source_id: sourceStatsFiji2025.id,
    is_preliminary: "TRUE",
    note: "Provisional annual visitor arrivals published January 18 2026.",
  },
];

async function main() {
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "text/csv, application/vnd.sdmx.data+csv;version=2.1",
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    throw new Error(`Pacific Data Hub request failed: ${response.status}`);
  }

  const csvText = await response.text();
  const rows = csvParse(csvText);
  const validRows = rows.filter(
    (row) =>
      row.FREQ === "A" &&
      row.GEO_PICT === "FJ" &&
      row.VISITOR_DURATION_CAT === "TOUR" &&
      Number.isFinite(Number(row.TIME_PERIOD)) &&
      Number.isFinite(Number(row.OBS_VALUE)),
  );
  const fijiRows = validRows;

  if (fijiRows.length === 0) {
    throw new Error("Pacific Data Hub response did not include Fiji arrivals.");
  }

  const spcRows = fijiRows.map((row) => ({
    year: Number(row.TIME_PERIOD),
    arrivals: Number(row.OBS_VALUE),
    geo_code: "FJ",
    geography: "Fiji",
    unit: "N",
    source_id: sourceSpc.id,
    is_preliminary: "FALSE",
    note: "",
  }));
  const cleanByYear = new Map(spcRows.map((row) => [row.year, row]));
  for (const row of supplementalRows) cleanByYear.set(row.year, row);
  const cleanRows = [...cleanByYear.values()].sort((a, b) => a.year - b.year);
  const cleanYears = cleanRows.map((row) => row.year);

  const expectedSupplemental = new Map([
    [2006, 548589],
    [2024, 982938],
    [2025, 986367],
  ]);
  for (const [year, expected] of expectedSupplemental) {
    if (cleanByYear.get(year)?.arrivals !== expected) {
      throw new Error(`Expected ${year} visitor arrivals to equal ${expected}.`);
    }
  }

  const latestFiji = cleanRows.reduce((latest, row) =>
    Number(row.year) > Number(latest.year) ? row : latest,
  );

  const metadata = {
    title: "Tourism Arrivals",
    fetchedAt: new Date().toISOString(),
    rawSource: sourceSpc,
    sources: [
      sourceSpc,
      sourceStatsFijiSupplemental,
      sourceStatsFiji2024,
      sourceStatsFiji2025,
    ],
    rows: cleanRows.length,
    rawRows: validRows.length,
    geographies: ["FJ"],
    fiji: {
      geoCode: "FJ",
      years: [Math.min(...cleanYears), latestFiji.year],
      latest: {
        year: latestFiji.year,
        arrivals: latestFiji.arrivals,
        unit: latestFiji.unit,
        sourceId: latestFiji.source_id,
        isPreliminary: latestFiji.is_preliminary === "TRUE",
      },
    },
  };

  await mkdir(dirname(csvPath), { recursive: true });
  await mkdir(dirname(bundledCsvPath), { recursive: true });
  const cleanCsvText = `${csvFormat(cleanRows)}\n`;
  await writeFile(csvPath, cleanCsvText);
  await writeFile(bundledCsvPath, cleanCsvText);
  await writeFile(rawCsvPath, `${csvText.replace(/\r\n/g, "\n").trimEnd()}\n`);
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

  console.log(
    `Wrote ${cleanRows.length} cleaned Fiji tourism-arrival observations to ${csvPath}`,
  );
  console.log(
    `Preserved ${validRows.length} raw SPC observations at ${rawCsvPath}`,
  );
  console.log(
    `Fiji latest: ${metadata.fiji.latest.year} ${metadata.fiji.latest.arrivals.toLocaleString("en-US")} arrivals`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
