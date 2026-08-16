import { scaleLinear } from "d3";
import { useMemo, useRef, useState } from "react";
import { journeyOptions, flightComparison } from "../data/journeyComparison";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./JourneyComparison.module.css";

const width = 1000;
const height = 386;
const margin = { top: 78, right: 44, bottom: 58, left: 44 };
const maxFlightTotal = Math.max(...journeyOptions.map((route) => route.total));

const segmentClassNames = {
  direct: styles.segmentDirect,
  supply: styles.segmentSupply,
  warming: styles.segmentWarming,
};

export function JourneyComparison({ selectedId = "london" }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const selected =
    journeyOptions.find((route) => route.id === selectedId) ?? journeyOptions[0];
  const chart = useMemo(() => buildChart(selected), [selected]);

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
        aria-label={`A return journey from ${selected.label} to Nadi emits about ${selected.total.toFixed(1)} tonnes CO₂e, compared with Fiji's 1.56 tonnes territorial CO₂ emissions per person`}
      >
        <g className={styles.chartHeader}>
          <text x={margin.left + 20} y={margin.top - 35}>
            One return journey to Nadi
          </text>
          <text x={margin.left + 20} y={margin.top - 15}>
            {selected.label}
            {selected.note ? ` ${selected.note}` : ""} ·{" "}
            {selected.returnKm.toLocaleString("en-US")} passenger-km
          </text>
        </g>

        <line
          className={styles.plotRule}
          x1={margin.left}
          x2={margin.left}
          y1={margin.top - 58}
          y2={height - margin.bottom + 10}
        />

        <g className={styles.rowLabel}>
          <text x={margin.left + 20} y={chart.flightY - 19}>
            Return flight
          </text>
          <text x={margin.left + 20} y={chart.flightY + 43}>
            {selected.total.toFixed(1)} t CO₂e
          </text>
        </g>

        <g className={styles.rowLabel}>
          <text x={margin.left + 20} y={chart.fijiY - 19}>
            Fiji per person
          </text>
          <text x={margin.left + 20} y={chart.fijiY + 39}>
            {flightComparison.fijiPerPerson.toFixed(2)} t CO₂
          </text>
        </g>

        <g transform={`translate(${chart.barX} ${chart.flightY})`}>
          {chart.flightSegments.map((segment) => (
            <g key={segment.key}>
              <rect
                className={segmentClassNames[segment.key]}
                x={segment.x}
                y="-14"
                width={segment.width * progress}
                height="28"
              />
              <text
                className={styles.segmentLabel}
                x={segment.x + segment.width / 2}
                y="34"
                opacity={progress > segment.showAt && segment.width > 70 ? 1 : 0}
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
          transform={`translate(${Math.min(
            chart.barX + chart.flightWidth - 168,
            width - margin.right - 168,
          )} ${chart.flightY - 74})`}
        >
          <rect width="168" height="42" />
          <text x="12" y="17">
            about {(selected.total / flightComparison.fijiPerPerson).toFixed(1)}x
          </text>
          <text x="12" y="32">
            Fiji's annual CO₂ per person
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        Source note: estimates use UK government 2025 long-haul economy factors
        as a common per-kilometre proxy. Route distances are great-circle
        approximations; London is shown via Sydney to reflect a practical routing.
      </figcaption>
    </figure>
  );
}

function buildChart(selected) {
  const barX = 260;
  const barWidth = width - margin.right - barX;
  const flightY = 156;
  const fijiY = 274;
  const x = scaleLinear()
    .domain([0, Math.ceil(maxFlightTotal * 1.05)])
    .range([0, barWidth]);

  let cursor = 0;
  const flightSegments = selected.segments.map((segment) => {
    const segmentWidth = x(segment.value);
    const built = {
      ...segment,
      x: cursor,
      width: segmentWidth,
      showAt: (cursor + segmentWidth * 0.7) / x(maxFlightTotal),
    };
    cursor += segmentWidth;
    return built;
  });

  return {
    barX,
    flightY,
    fijiY,
    flightWidth: x(selected.total),
    fijiWidth: x(flightComparison.fijiPerPerson),
    flightSegments,
  };
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}
