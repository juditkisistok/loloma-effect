import { scaleLinear } from "d3";
import { useMemo } from "react";
import { journeyOptions, flightComparison } from "../data/journeyComparison";
import styles from "./JourneyComparison.module.css";

const width = 1000;
const height = 244;
const margin = { left: 58, right: 210 };
const flightY = 104;
const benchmarkY = 207;
const flightBarHeight = 30;
const benchmarkBarHeight = 16;
const maxFlightTotal = Math.max(...journeyOptions.map((route) => route.total));
const segmentClassNames = {
  direct: styles.segmentDirect,
  supply: styles.segmentSupply,
  warming: styles.segmentWarming,
};

export function JourneyComparison({ selectedId = "london" }) {
  const selected =
    journeyOptions.find((route) => route.id === selectedId) ?? journeyOptions[0];
  const chart = useMemo(() => buildChart(selected), [selected]);
  const multiple = selected.total / flightComparison.fijiPerPerson;

  return (
    <figure className={styles.figure}>
      <div className={styles.scrollWrap}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`A return journey from ${selected.label} to Nadi has an estimated climate impact of ${selected.total.toFixed(
            1,
          )} tonnes CO₂e — around ${multiple.toFixed(
            1,
          )} times Fiji's ${flightComparison.fijiPerPerson.toFixed(
            2,
          )} tonnes of territorial CO₂ per person in 2024. The measures are not directly equivalent because the flight estimate includes non-CO₂ effects.`}
        >
          <defs>
            <clipPath id="jc-flight-pill">
              <rect
                x={chart.trackX0}
                y={flightY}
                width={chart.flightWidth}
                height={flightBarHeight}
                rx={flightBarHeight / 2}
              />
            </clipPath>
          </defs>

          <g className={styles.chartHeader}>
            <text x={margin.left} y="31">
              One return journey to Nadi
            </text>
            <text x={margin.left} y="52">
              {selected.label}
              {selected.note ? ` ${selected.note}` : ""} ·{" "}
              {selected.returnKm.toLocaleString("en-US")} passenger-km
            </text>
          </g>

          <g className={styles.rowLabel}>
            <text x={chart.trackX0} y={flightY - 13}>
              FLIGHT CLIMATE IMPACT
            </text>
            <text
              className={styles.rowValue}
              x={chart.totalX}
              y={flightY - 13}
              textAnchor="end"
            >
              {selected.total.toFixed(1)} t CO₂e
            </text>
          </g>

          <line
            className={styles.guide}
            x1={chart.trackX0}
            x2={chart.trackX1}
            y1={flightY + flightBarHeight / 2}
            y2={flightY + flightBarHeight / 2}
          />

          <g clipPath="url(#jc-flight-pill)">
            {chart.segments.map((segment) => (
              <rect
                key={segment.key}
                className={segmentClassNames[segment.key]}
                x={segment.x0}
                y={flightY}
                width={segment.x1 - segment.x0}
                height={flightBarHeight}
              />
            ))}
          </g>

          <g className={styles.segmentLabels}>
            {selected.segments.map((segment, index) => (
              <g
                key={segment.key}
                transform={`translate(${chart.trackX0 + index * 170} ${
                  flightY + 49
                })`}
              >
                <rect
                  className={segmentClassNames[segment.key]}
                  width="9"
                  height="9"
                  rx="2"
                />
                <text x="16" y="8">
                  {segment.label} · {segment.value.toFixed(1)} t
                </text>
              </g>
            ))}
          </g>

          <line
            className={styles.guide}
            x1={chart.trackX0}
            x2={chart.trackX1}
            y1={benchmarkY + benchmarkBarHeight / 2}
            y2={benchmarkY + benchmarkBarHeight / 2}
          />

          <g className={styles.rowLabel}>
            <text x={chart.trackX0} y={benchmarkY - 13}>
              FIJI BENCHMARK · {flightComparison.fijiPerPerson.toFixed(2)} T CO₂
              / PERSON / YEAR
            </text>
          </g>

          <rect
            className={styles.benchmarkBar}
            x={chart.trackX0}
            y={benchmarkY}
            width={chart.benchmarkWidth}
            height={benchmarkBarHeight}
            rx={benchmarkBarHeight / 2}
          />

          <line className={styles.statDivider} x1="824" x2="824" y1="80" y2="235" />

          <g className={styles.bigStat} transform="translate(858 104)">
            <text className={styles.statKicker}>SCALE OF THE GAP</text>
            <text className={styles.bigNumber} y="58">
              {multiple.toFixed(1)}×
            </text>
            <text className={styles.bigCaption} y="86">
              Fiji's annual
            </text>
            <text className={styles.bigCaption} y="104">
              territorial CO₂
            </text>
            <text className={styles.bigCaption} y="122">
              per person
            </text>
          </g>
        </svg>
      </div>
      <p className={styles.scrollHint}>Scroll for full chart →</p>
      <figcaption className={styles.caption}>
        Flight estimate: {selected.routeLabel}; {selected.returnKm.toLocaleString("en-US")} passenger-km;
        UK government 2025 long-haul economy factors, including non-CO₂ effects.
        Fiji benchmark: territorial CO₂ per person in 2024. Scale comparison
        only; accounting boundaries differ.
      </figcaption>
    </figure>
  );
}

function buildChart(selected) {
  const trackX0 = margin.left;
  const trackX1 = width - margin.right;
  const x = scaleLinear()
    .domain([0, maxFlightTotal])
    .range([trackX0, trackX1]);

  let cursor = trackX0;
  const segments = selected.segments.map((segment) => {
    const segmentWidth = x(segment.value) - trackX0;
    const built = { ...segment, x0: cursor, x1: cursor + segmentWidth };
    cursor += segmentWidth;
    return built;
  });

  const totalX = x(selected.total);

  return {
    x,
    trackX0,
    trackX1,
    segments,
    totalX,
    flightWidth: totalX - trackX0,
    benchmarkWidth: x(flightComparison.fijiPerPerson) - trackX0,
  };
}
