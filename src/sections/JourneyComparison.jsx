import { scaleLinear } from "d3";
import { useMemo, useRef, useState } from "react";
import { journeyOptions, flightComparison } from "../data/journeyComparison";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./JourneyComparison.module.css";

const width = 1000;
const height = 350;
const margin = { left: 56, right: 56 };
const trackY = 208;
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
  const multiple = selected.total / flightComparison.fijiPerPerson;

  useFrame((frame) => {
    const el = ref.current;
    if (!el) return;
    if (frame.reduced) {
      setProgress(1);
      return;
    }

    const rect = el.getBoundingClientRect();
    const start = window.innerHeight * 0.95;
    const end = window.innerHeight * 0.1;
    const raw = (start - rect.top) / (start - end);

    setProgress((current) => {
      const next = clamp(raw, 0, 1);
      return Math.abs(current - next) > 0.002 ? next : current;
    });
  });

  const trailReveal = clamp(progress / 0.55, 0, 1);
  const totalNoteOpacity = clamp((progress - 0.42) / 0.16, 0, 1);
  const fijiOpacity = clamp((progress - 0.55) / 0.2, 0, 1);
  const bracketOpacity = clamp((progress - 0.72) / 0.16, 0, 1);
  const bigStatOpacity = clamp((progress - 0.8) / 0.2, 0, 1);

  const trailWidth = chart.trailFullWidth * trailReveal;
  const planeX = chart.trackX0 + trailWidth;
  const totalNoteX = Math.min(planeX + 14, width - margin.right - 118);

  return (
    <figure className={styles.figure} ref={ref}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`A return journey from ${selected.label} to Nadi emits about ${selected.total.toFixed(
          1,
        )} tonnes CO₂e — around ${multiple.toFixed(
          1,
        )} times Fiji's ${flightComparison.fijiPerPerson.toFixed(
          2,
        )} tonne annual per-person CO₂ footprint`}
      >
        <defs>
          <clipPath id="jc-pill">
            <rect
              x={chart.trackX0}
              y={trackY - 9}
              width={chart.trailFullWidth}
              height="18"
              rx="9"
            />
          </clipPath>
          <clipPath id="jc-reveal">
            <rect x={chart.trackX0} y="0" width={trailWidth} height={height} />
          </clipPath>
          <linearGradient id="jc-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className={styles.chartHeader}>
          <text x={margin.left} y="34">
            One return journey to Nadi
          </text>
          <text x={margin.left} y="54">
            {selected.label}
            {selected.note ? ` ${selected.note}` : ""} ·{" "}
            {selected.returnKm.toLocaleString("en-US")} passenger-km
          </text>
        </g>

        <g className={styles.legend}>
          {selected.segments.map((segment, i) => (
            <g
              key={segment.key}
              transform={`translate(${chart.trackX0 + i * 232} 100)`}
            >
              <rect
                className={segmentClassNames[segment.key]}
                width="10"
                height="10"
                rx="2"
              />
              <text x="18" y="9">
                {segment.label} · {segment.value.toFixed(1)}t
              </text>
            </g>
          ))}
        </g>

        <line
          className={styles.baseline}
          x1={chart.trackX0}
          x2={width - margin.right}
          y1={trackY}
          y2={trackY}
        />

        <g className={styles.ticks}>
          {chart.ticks.map((tick) => (
            <g key={tick.value} transform={`translate(${tick.x} ${trackY})`}>
              <line y1="0" y2="8" />
              <text y="24">{tick.value}t</text>
            </g>
          ))}
        </g>

        <g clipPath="url(#jc-pill)">
          <g clipPath="url(#jc-reveal)">
            {chart.segments.map((segment) => (
              <rect
                key={segment.key}
                className={segmentClassNames[segment.key]}
                x={segment.x0}
                y={trackY - 9}
                width={segment.x1 - segment.x0}
                height="18"
              />
            ))}
            <rect
              x={chart.trackX0}
              y={trackY - 9}
              width={chart.trailFullWidth}
              height="9"
              fill="url(#jc-sheen)"
            />
          </g>
        </g>

        <g
          className={styles.plane}
          transform={`translate(${planeX - 26} ${trackY}) rotate(-6)`}
        >
          <line x1="0" y1="0" x2="20" y2="0" />
          <path d="M18,-5 L32,0 L18,5 Z" />
        </g>

        <g
          className={styles.totalNote}
          opacity={totalNoteOpacity}
          transform={`translate(${totalNoteX} ${trackY - 34})`}
        >
          <text x="0" y="0">
            {selected.total.toFixed(1)}t CO₂e
          </text>
          <text x="0" y="15">
            return flight, total
          </text>
        </g>

        <g
          className={styles.fijiMarker}
          opacity={fijiOpacity}
          transform={`translate(${chart.fijiX} ${trackY})`}
        >
          <line y1="-26" y2="-9" />
          <circle cy="-9" r="3.5" />
          <text y="-48" textAnchor="middle">
            Fiji, per person
          </text>
          <text y="-34" textAnchor="middle" className={styles.fijiValue}>
            {flightComparison.fijiPerPerson.toFixed(2)}t / yr
          </text>
        </g>

        <g
          className={styles.bracket}
          opacity={bracketOpacity}
          transform={`translate(0 ${trackY + 64})`}
        >
          <line x1={chart.fijiX} x2={chart.fijiX} y1="-6" y2="6" />
          <line x1={chart.totalX} x2={chart.totalX} y1="-6" y2="6" />
          <line x1={chart.fijiX} x2={chart.totalX} y1="0" y2="0" />
        </g>

        <g
          className={styles.bigStat}
          opacity={bigStatOpacity}
          transform={`translate(${(chart.fijiX + chart.totalX) / 2} ${
            trackY + 104
          })`}
        >
          <text textAnchor="middle" className={styles.bigNumber}>
            {multiple.toFixed(1)}×
          </text>
          <text textAnchor="middle" className={styles.bigCaption} y="22">
            Fiji's whole annual footprint, per person
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        Source note: {selected.routeLabel} return distance estimated at{" "}
        {selected.returnKm.toLocaleString("en-US")} passenger-km using
        great-circle airport distances. Emissions use UK government 2025
        long-haul economy factors, including aviation's non-CO₂ effects.
      </figcaption>
    </figure>
  );
}

function buildChart(selected) {
  const trackX0 = margin.left + 34;
  const trackX1 = width - margin.right;
  const x = scaleLinear()
    .domain([0, maxFlightTotal])
    .nice()
    .range([trackX0, trackX1]);

  let cursor = trackX0;
  const segments = selected.segments.map((segment) => {
    const segmentWidth = x(segment.value) - trackX0;
    const built = { ...segment, x0: cursor, x1: cursor + segmentWidth };
    cursor += segmentWidth;
    return built;
  });

  return {
    x,
    trackX0,
    trackX1,
    ticks: x.ticks(6).map((value) => ({ value, x: x(value) })),
    segments,
    totalX: x(selected.total),
    fijiX: x(flightComparison.fijiPerPerson),
    trailFullWidth: x(selected.total) - trackX0,
  };
}
