import { csvParse, geoDistance } from "d3";
import airportsCsv from "./journey-airports.csv?raw";
import factorsCsv from "./flight-emissions-factors.csv?raw";
import routesCsv from "./journey-routes.csv?raw";

const earthRadiusKm = 6371;

const factorRows = csvParse(factorsCsv, (row) => ({
  id: row.id,
  label: row.label,
  value: Number(row.value_kg_co2e_per_passenger_km),
  sourceTitle: row.source_title,
  sourceUrl: row.source_url,
}));
const factors = Object.fromEntries(factorRows.map((row) => [row.id, row]));

const airports = Object.fromEntries(
  csvParse(airportsCsv, (row) => [
    row.code,
    {
      label: row.label,
      lat: Number(row.latitude),
      lon: Number(row.longitude),
    },
  ]),
);

export const flightComparison = {
  fijiPerPerson: factors.fiji_per_person_2024.value,
  sources: {
    fiji: factors.fiji_per_person_2024,
    flight: factors.uk_long_haul_economy_with_rf,
  },
  ukLongHaulEconomyFactors: {
    directCo2: factors.uk_long_haul_economy_direct_co2.value,
    withoutRf: factors.uk_long_haul_economy_without_rf.value,
    withRf: factors.uk_long_haul_economy_with_rf.value,
    fuelSupply: factors.uk_long_haul_economy_wtt.value,
  },
};

export const journeyOptions = csvParse(routesCsv, (row) => ({
  id: row.id,
  label: row.label,
  route: row.route_codes.split("|"),
  note: row.route_note,
}))
  .map(buildJourney)
  .filter((route) => route.total > flightComparison.fijiPerPerson);

function buildJourney(option) {
  const oneWayKm = option.route.reduce((total, code, index, route) => {
    if (index === route.length - 1) return total;
    return total + distanceKm(airports[code], airports[route[index + 1]]);
  }, 0);
  const returnKm = Math.round(oneWayKm * 2);
  const directCo2 = tonnes(
    returnKm,
    flightComparison.ukLongHaulEconomyFactors.directCo2,
  );
  const fuelSupplyAndTrace =
    tonnes(returnKm, flightComparison.ukLongHaulEconomyFactors.fuelSupply) +
    tonnes(
      returnKm,
      flightComparison.ukLongHaulEconomyFactors.withoutRf -
        flightComparison.ukLongHaulEconomyFactors.directCo2,
    );
  const addedWarming = tonnes(
    returnKm,
    flightComparison.ukLongHaulEconomyFactors.withRf -
      flightComparison.ukLongHaulEconomyFactors.withoutRf,
  );

  return {
    ...option,
    routeLabel: option.route.map((code) => airports[code].label).join(" → "),
    returnKm,
    segments: [
      {
        key: "direct",
        label: "Direct CO₂",
        value: directCo2,
      },
      {
        key: "supply",
        label: "Fuel supply",
        value: fuelSupplyAndTrace,
      },
      {
        key: "warming",
        label: "Non-CO₂ effects",
        value: addedWarming,
      },
    ],
    total: directCo2 + fuelSupplyAndTrace + addedWarming,
  };
}

function distanceKm(a, b) {
  return geoDistance([a.lon, a.lat], [b.lon, b.lat]) * earthRadiusKm;
}

function tonnes(km, factor) {
  return (km * factor) / 1000;
}
