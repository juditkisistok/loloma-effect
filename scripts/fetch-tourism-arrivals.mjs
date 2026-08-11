import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { csvFormat, csvParse } from "d3";

const apiUrl =
  "https://stats-sdmx-disseminate.pacificdata.org/rest/data/SPC,DF_CLIMATE_CHANGE,1.0/A.TRSM_ARR.FJ?dimensionAtObservation=AllDimensions&format=csv";

const explorerUrl =
  "https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.TRSM_ARR.&pd=,&to[TIME_PERIOD]=false";

const csvPath = fileURLToPath(
  new URL("../public/data/tourism-arrivals.csv", import.meta.url),
);
const rawCsvPath = fileURLToPath(
  new URL("../public/data/tourism-arrivals-spc-raw.csv", import.meta.url),
);
const metadataPath = fileURLToPath(
  new URL("../public/data/tourism-arrivals.metadata.json", import.meta.url),
);

const sourceSpc = {
  id: "spc-climate-change",
  name: "Pacific Data Hub .Stat",
  url: explorerUrl,
  apiUrl,
  note: "SPC DF_CLIMATE_CHANGE annual tourism arrivals indicator TRSM_ARR.",
};

const sourceStatsFiji2025 = {
  id: "fiji-stats-preliminary-2025",
  name: "Fiji Bureau of Statistics provisional visitor arrivals",
  url: "https://www.statsfiji.gov.fj/provisional-visitor-arrivals-december-2025/",
  publishedDate: "2026-01-18",
  note: "Provisional 2025 annual visitor arrivals, not yet present in the SPC extract.",
};

const supplementalRows = [
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
      row.CLIMATE_CHANGE_INDICATORS === "TRSM_ARR" &&
      Number.isFinite(Number(row.TIME_PERIOD)) &&
      Number.isFinite(Number(row.OBS_VALUE)),
  );
  const fijiRows = validRows.filter((row) => row.GEO_PICT === "FJ");

  if (fijiRows.length === 0) {
    throw new Error("Pacific Data Hub response did not include Fiji arrivals.");
  }

  const fijiYears = fijiRows.map((row) => Number(row.TIME_PERIOD));
  const cleanRows = [
    ...fijiRows.map((row) => ({
      year: Number(row.TIME_PERIOD),
      arrivals: Number(row.OBS_VALUE),
      geo_code: row.GEO_PICT,
      geography: "Fiji",
      unit: row.UNIT_MEASURE,
      source_id: sourceSpc.id,
      is_preliminary: "FALSE",
      note: "",
    })),
    ...supplementalRows,
  ].sort((a, b) => a.year - b.year);

  const latestFiji = cleanRows.reduce((latest, row) =>
    Number(row.year) > Number(latest.year) ? row : latest,
  );

  const metadata = {
    title: "Tourism Arrivals",
    fetchedAt: new Date().toISOString(),
    rawSource: sourceSpc,
    sources: [sourceSpc, sourceStatsFiji2025],
    rows: cleanRows.length,
    rawRows: validRows.length,
    geographies: [...new Set(validRows.map((row) => row.GEO_PICT))],
    fiji: {
      geoCode: "FJ",
      years: [Math.min(...fijiYears), latestFiji.year],
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
  await writeFile(csvPath, `${csvFormat(cleanRows)}\n`);
  await writeFile(rawCsvPath, csvText);
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
