import { ascending, csv, extent, max } from "d3";

export const tourismArrivalsCsvUrl = "/data/tourism-arrivals.csv";

export const tourismArrivalSources = {
  spcClimateChange: {
    id: "spc-climate-change",
    name: "Pacific Data Hub .Stat",
    url: "https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.TRSM_ARR.&pd=,&to[TIME_PERIOD]=false",
  },
  fijiStatsPreliminary2025: {
    id: "fiji-stats-preliminary-2025",
    name: "Fiji Bureau of Statistics provisional visitor arrivals",
    url: "https://www.statsfiji.gov.fj/provisional-visitor-arrivals-december-2025/",
  },
};

export async function loadTourismArrivals(url = tourismArrivalsCsvUrl) {
  const rows = await csv(url, parseTourismArrivalRow);
  return sortTourismArrivals(rows.filter(isValidTourismArrival));
}

export function fijiTourismArrivals(rows) {
  return rows.filter((row) => row.geoCode === "FJ");
}

export function summarizeTourismArrivals(rows, geoCode = "FJ") {
  const series = rows
    .filter((row) => row.geoCode === geoCode)
    .sort((a, b) => ascending(a.year, b.year));
  const latest = series.at(-1) ?? null;

  return {
    geoCode,
    series,
    yearExtent: extent(series, (row) => row.year),
    maxArrivals: max(series, (row) => row.arrivals) ?? 0,
    latest,
  };
}

function parseTourismArrivalRow(row) {
  return {
    indicator: "TRSM_ARR",
    geoCode: row.geo_code,
    geography: row.geography,
    year: Number(row.year),
    arrivals: Number(row.arrivals),
    unit: row.unit || null,
    note: row.note || null,
    isPreliminary: row.is_preliminary === "TRUE",
    source:
      tourismArrivalSources[row.source_id] ?? {
        id: row.source_id,
        name: row.source_id,
        url: null,
      },
  };
}

function isValidTourismArrival(row) {
  return (
    row.indicator === "TRSM_ARR" &&
    Number.isFinite(row.year) &&
    Number.isFinite(row.arrivals)
  );
}

function sortTourismArrivals(rows) {
  return rows.sort(
    (a, b) =>
      ascending(a.geoCode, b.geoCode) ||
      ascending(a.year, b.year) ||
      ascending(a.source.id, b.source.id),
  );
}
