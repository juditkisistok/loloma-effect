import { readFileSync } from "node:fs";
import { csvParse, geoDistance } from "d3";
import { coastalShoreline } from "../src/data/coastalShoreline.js";
import { fijiBoundary } from "../src/data/fijiBoundary.js";
import { lolomaHour } from "../src/data/lolomaHour.js";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sourceTourism = read("data/tourism-arrivals.csv");
const bundledTourism = read("src/data/tourism-arrivals.csv");
assert(sourceTourism === bundledTourism, "Tourism CSV copies differ.");

const tourism = csvParse(bundledTourism, (row) => ({
  year: Number(row.year),
  arrivals: Number(row.arrivals),
  preliminary: row.is_preliminary === "TRUE",
  geography: row.geo_code,
  unit: row.unit,
}));
assert(tourism.length === 31, "Tourism series must contain 1995–2025.");
assert(new Set(tourism.map((row) => row.year)).size === 31, "Tourism years are not unique.");
assert(tourism.every((row, index) => row.year === 1995 + index), "Tourism years are not continuous.");
assert(tourism.every((row) => row.geography === "FJ" && row.unit === "N"), "Tourism scope changed.");
for (const [year, arrivals, preliminary] of [
  [1995, 318000, false],
  [2006, 549000, false],
  [2024, 982938, false],
  [2025, 986367, true],
]) {
  const row = tourism.find((candidate) => candidate.year === year);
  assert(row?.arrivals === arrivals, `Unexpected ${year} tourism total.`);
  assert(row?.preliminary === preliminary, `Unexpected ${year} provisional status.`);
}

assert(JSON.stringify(coastalShoreline.years) === JSON.stringify([1999, 2007, 2015, 2023]), "Shoreline years changed.");
assert(coastalShoreline.rates.length === 1, "Expected one selected shoreline rate.");
assert(coastalShoreline.rateSelection.displayIslandName === "Tivua Island", "Displayed shoreline site identity changed.");
const rate = coastalShoreline.rates[0];
assert(rate.rate === 0.378 && rate.se === 0.096 && rate.sig === 0.001, "Selected shoreline rate changed; review the narrative.");
assert(coastalShoreline.rateSelection.eligiblePointCount === 2095, "Eligible shoreline rate pool changed.");
const rateContext = coastalShoreline.rateContext;
const visibleRateCount = rateContext.bins.reduce((sum, bin) => sum + bin.count, 0);
assert(rateContext.pointCount === 3838, "Good-certainty shoreline context pool changed.");
assert(rateContext.significantPointCount === 2095, "Significant shoreline context count changed.");
assert(
  visibleRateCount + rateContext.clippedLow + rateContext.clippedHigh === rateContext.pointCount,
  "Shoreline histogram does not reconcile to its source pool.",
);
assert(rateContext.median === 0.222, "Shoreline context median changed.");
assert(rateContext.selectedPercentile === 68.8, "Selected shoreline percentile changed.");

const shorelineIsClosed = (coordinates) => {
  const first = coordinates[0];
  const last = coordinates.at(-1);
  return first[0] === last[0] && first[1] === last[1];
};
const shorelineCentroid = (coordinates) => {
  const points = shorelineIsClosed(coordinates)
    ? coordinates.slice(0, -1)
    : coordinates;
  return points
    .reduce(
      (sum, [longitude, latitude]) => [
        sum[0] + longitude,
        sum[1] + latitude,
      ],
      [0, 0],
    )
    .map((value) => value / points.length);
};
const shorelineDistance = (a, b) => {
  const latitude = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  return Math.hypot((a[0] - b[0]) * Math.cos(latitude), a[1] - b[1]);
};
const closedShorelinesByYear = Object.fromEntries(
  coastalShoreline.years.map((year) => [
    year,
    coastalShoreline.shorelines
      .filter(
        (shoreline) =>
          shoreline.year === year && shorelineIsClosed(shoreline.coordinates),
      )
      .map((shoreline) => shorelineCentroid(shoreline.coordinates)),
  ]),
);
assert(
  closedShorelinesByYear[1999].length === 1,
  "The 1999 extract no longer has exactly one closed good-certainty outline.",
);
const tivuaCentroid = closedShorelinesByYear[1999][0];
assert(
  coastalShoreline.years.every(
    (year) =>
      closedShorelinesByYear[year].filter(
        (candidate) => shorelineDistance(candidate, tivuaCentroid) <= 0.002,
      ).length === 1,
  ),
  "Tivua is no longer the sole four-year closed-outline match in the extract.",
);

assert(fijiBoundary.completed.length === 6, "Completed-relocation count changed.");
assert(fijiBoundary.completed.filter((row) => row.relocationType.toLowerCase().startsWith("full")).length === 2, "Full-relocation count changed.");
assert(fijiBoundary.completed.filter((row) => row.relocationType.toLowerCase().startsWith("partial")).length === 4, "Partial-relocation count changed.");
assert(fijiBoundary.surveyed.length === 17, "Mapped adaptation-survey count changed.");

assert(lolomaHour.yearOne.hours === 17407, "Loloma Hour total changed.");
assert(lolomaHour.launch.firstYearTargetHours === 5000, "Loloma Hour target changed.");
assert((lolomaHour.yearOne.hours / lolomaHour.launch.firstYearTargetHours).toFixed(1) === "3.5", "Loloma Hour target multiple changed.");

const factors = Object.fromEntries(
  csvParse(read("src/data/flight-emissions-factors.csv"), (row) => [row.id, Number(row.value)]),
);
const airports = Object.fromEntries(
  csvParse(read("src/data/journey-airports.csv"), (row) => [
    row.code,
    { latitude: Number(row.latitude), longitude: Number(row.longitude) },
  ]),
);
const routes = csvParse(read("src/data/journey-routes.csv"));
const expectedRoutes = {
  london: [40378, 5.7195],
  "los-angeles": [17783, 2.5190],
  tokyo: [14265, 2.0206],
  singapore: [16612, 2.3531],
};
for (const route of routes) {
  const codes = route.route_codes.split("|");
  const oneWayKm = codes.slice(0, -1).reduce((sum, code, index) => {
    const from = airports[code];
    const to = airports[codes[index + 1]];
    return sum + geoDistance(
      [from.longitude, from.latitude],
      [to.longitude, to.latitude],
    ) * 6371;
  }, 0);
  const returnKm = Math.round(oneWayKm * 2);
  const total = returnKm * (
    factors.uk_long_haul_economy_with_rf +
    factors.uk_long_haul_economy_wtt
  ) / 1000;
  const expected = expectedRoutes[route.id];
  assert(returnKm === expected[0], `${route.id} distance changed.`);
  assert(Math.abs(total - expected[1]) < 0.0001, `${route.id} flight estimate changed.`);
}

console.log("Data audit passed: tourism, shoreline, relocation, flight and Loloma claims are internally consistent.");
