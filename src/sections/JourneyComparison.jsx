import { scaleLinear } from "d3";
import { useMemo, useRef, useState } from "react";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./JourneyComparison.module.css";

const width = 1000;
const height = 360;
const margin = { top: 72, right: 44, bottom: 58, left: 44 };

const comparison = {
  routeDistanceKm: 40378,
  fijiPerPerson: 1.5561111,
  ukLongHaulEconomyFactors: {
    directCo2: 0.06826,
    withoutRf: 0.06926,
    withRf: 0.11704,
    fuelSupply: 0.02461,
  },
};

const tonnes = (factor) => (comparison.routeDistanceKm * factor) / 1000;
const directCo2 = tonnes(comparison.ukLongHaulEconomyFactors.directCo2);
const fuelSupplyAndTrace =
  tonnes(comparison.ukLongHaulEconomyFactors.fuelSupply) +
  tonnes(
    comparison.ukLongHaulEconomyFactors.withoutRf -
      comparison.ukLongHaulEconomyFactors.directCo2,
  );
const addedWarming = tonnes(
  comparison.ukLongHaulEconomyFactors.withRf -
    comparison.ukLongHaulEconomyFactors.withoutRf,
);
const flightTotal = directCo2 + fuelSupplyAndTrace + addedWarming;

const segments = [
  {
    key: "direct",
    label: "Direct CO₂",
    value: directCo2,
    className: styles.segmentDirect,
  },
  {
    key: "supply",
    label: "Fuel supply",
    value: fuelSupplyAndTrace,
    className: styles.segmentSupply,
  },
  {
    key: "warming",
    label: "Non-CO₂ effects",
    value: addedWarming,
    className: styles.segmentWarming,
  },
];

export function JourneyComparison() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const chart = useMemo(() => buildChart(), []);

  useFrame((frame) => {
    const el = ref.current;
    if (!el) return;
    if (frame.reduced) {
      setProgress(1);
      return;
    }

    const rect = el.getBoundingClientRect();
    const start = window.innerHeight * 0.72;
    const end = window.innerHeight * 0.22;
    const raw = (start - rect.top) / (start - end);

    setProgress((current) => {
      const next = easeOutCubic(clamp(raw, 0, 1));
      return Math.abs(current - next) > 0.002 ? next : current;
    });
  });

  return (
    <figure className={styles.figure} ref={ref}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="A London to Nadi return flight emits about 5.7 tonnes CO₂e, compared with Fiji's 1.56 tonnes territorial CO₂ emissions per person"
      >
        <g className={styles.chartHeader}>
          <text x={margin.left + 20} y={margin.top - 30}>
            One return journey, London to Nadi
          </text>
        </g>

        <line
          className={styles.plotRule}
          x1={margin.left}
          x2={margin.left}
          y1={margin.top - 54}
          y2={height - margin.bottom + 10}
        />

        <g className={styles.rowLabel}>
          <text x={margin.left + 20} y={chart.flightY - 19}>
            Return flight
          </text>
          <text x={margin.left + 20} y={chart.flightY + 43}>
            {flightTotal.toFixed(1)} t CO₂e
          </text>
        </g>

        <g className={styles.rowLabel}>
          <text x={margin.left + 20} y={chart.fijiY - 19}>
            Fiji per person
          </text>
          <text x={margin.left + 20} y={chart.fijiY + 39}>
            {comparison.fijiPerPerson.toFixed(2)} t CO₂
          </text>
        </g>

        <g transform={`translate(${chart.barX} ${chart.flightY})`}>
          {chart.flightSegments.map((segment) => (
            <g key={segment.key}>
              <rect
                className={segment.className}
                x={segment.x}
                y="-14"
                width={segment.width * progress}
                height="28"
              />
              <text
                className={styles.segmentLabel}
                x={segment.x + segment.width / 2}
                y="34"
                opacity={progress > segment.showAt ? 1 : 0}
              >
                {segment.label} {segment.value.toFixed(1)}t
              </text>
            </g>
          ))}
        </g>

        <g transform={`translate(${chart.barX} ${chart.fijiY})`}>
          <rect
            className={styles.fijiBar}
            x="0"
            y="-10"
            width={chart.fijiWidth * progress}
            height="20"
          />
        </g>

        <g
          className={styles.callout}
          opacity={progress > 0.92 ? 1 : 0}
          transform={`translate(${chart.barX + chart.flightWidth - 168} ${
            chart.flightY - 70
          })`}
        >
          <rect width="168" height="42" />
          <text x="12" y="17">
            about {Math.round(flightTotal / comparison.fijiPerPerson)}x
          </text>
          <text x="12" y="32">
            Fiji's annual CO₂ per person
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        Source note: flight estimate uses UK government 2025 long-haul economy
        factors and an approximate London-Sydney-Nadi return routing of{" "}
        {comparison.routeDistanceKm.toLocaleString("en-US")} passenger-km,
        including aviation's non-CO₂ effects.
      </figcaption>
    </figure>
  );
}

function buildChart() {
  const barX = 260;
  const barWidth = width - margin.right - barX;
  const flightY = 148;
  const fijiY = 258;
  const x = scaleLinear().domain([0, 6]).range([0, barWidth]);

  let cursor = 0;
  const flightSegments = segments.map((segment) => {
    const segmentWidth = x(segment.value);
    const built = {
      ...segment,
      x: cursor,
      width: segmentWidth,
      showAt: (cursor + segmentWidth * 0.7) / x(6),
    };
    cursor += segmentWidth;
    return built;
  });

  return {
    barX,
    flightY,
    fijiY,
    flightWidth: x(flightTotal),
    fijiWidth: x(comparison.fijiPerPerson),
    flightSegments,
  };
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}
