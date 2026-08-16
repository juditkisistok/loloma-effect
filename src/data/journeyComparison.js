import { geoDistance } from "d3";

const earthRadiusKm = 6371;

export const flightComparison = {
  fijiPerPerson: 1.5561111,
  ukLongHaulEconomyFactors: {
    directCo2: 0.06826,
    withoutRf: 0.06926,
    withRf: 0.11704,
    fuelSupply: 0.02461,
  },
};

const airports = {
  LHR: { lon: -0.4543, lat: 51.47 },
  SYD: { lon: 151.1753, lat: -33.9399 },
  LAX: { lon: -118.4085, lat: 33.9416 },
  HND: { lon: 139.7798, lat: 35.5494 },
  SIN: { lon: 103.9915, lat: 1.3644 },
  NAN: { lon: 177.4434, lat: -17.7554 },
};

const rawRouteOptions = [
  {
    id: "london",
    label: "London",
    route: ["LHR", "SYD", "NAN"],
    note: "via Sydney",
  },
  {
    id: "los-angeles",
    label: "Los Angeles",
    route: ["LAX", "NAN"],
  },
  {
    id: "tokyo",
    label: "Tokyo",
    route: ["HND", "NAN"],
  },
  {
    id: "singapore",
    label: "Singapore",
    route: ["SIN", "NAN"],
  },
];

export const journeyOptions = rawRouteOptions
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
