import { extent, format, line, max, pointer, scaleLinear } from "d3";
import { useMemo, useRef, useState } from "react";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./ArrivalsChart.module.css";

const width = 1000;
const height = 392;
const margin = { top: 82, right: 44, bottom: 36, left: 44 };
const labelInset = 64;
const storyEndYear = 2025;
const formatWhole = format(",");

export function ArrivalsChart({ rows = [] }) {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const chart = useMemo(() => buildChart(rows), [rows]);
  const drawProgress = chart.points.length ? progress : 0;
  const latestNoteProgress = clamp((drawProgress - 0.9) / 0.08, 0, 1);

  useFrame((frame) => {
    const el = ref.current;
    if (!el) return;
    if (frame.reduced) {
      setProgress(1);
      return;
    }

    const rect = el.getBoundingClientRect();
    const start = window.innerHeight * 0.68;
    const end = window.innerHeight * 0.24;
    const raw = (start - rect.top) / (start - end);
    const pageBottom =
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 2;
    const next = pageBottom ? 1 : easeOutCubic(clamp(raw, 0, 1));

    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  function handlePointerMove(event) {
    if (chart.points.length === 0) return;

    const [px] = pointer(event, event.currentTarget);
    const nearest = chart.points.reduce((best, point) => {
      const distance = Math.abs(chart.x(point.year) - px);
      return !best || distance < best.distance ? { point, distance } : best;
    }, null);

    setHovered(nearest?.point ?? null);
  }

  return (
    <figure className={styles.figure} ref={ref}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Annual visitor arrivals to Fiji from 1995 to 2025"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
      >
        <defs>
          <pattern
            id="arrivals-hatch"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-28)"
          >
            <line x1="0" y1="0" x2="0" y2="10" />
          </pattern>
          <linearGradient id="arrivals-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f877c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f877c" stopOpacity="0.02" />
          </linearGradient>
          <filter
            id="arrivals-line-glow"
            x="-8%"
            y="-30%"
            width="116%"
            height="160%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.05 0 0 0 0 0.53 0 0 0 0 0.49 0 0 0 0.45 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="arrivals-reveal">
            <rect
              x={margin.left}
              y="0"
              width={(width - margin.left - margin.right) * drawProgress}
              height={height}
            />
          </clipPath>
        </defs>

        <rect
          className={styles.plotSurface}
          x={margin.left}
          y="20"
          width={width - margin.left - margin.right}
          height={height - 20 - margin.bottom}
        />
        <line
          className={styles.plotRule}
          x1={margin.left}
          x2={margin.left}
          y1="20"
          y2={height - margin.bottom}
        />

        <g className={styles.chartHeader}>
          <text x={labelInset} y={margin.top - 34}>
            Visitor arrivals to Fiji
            <tspan dx="12">Annual arrivals, 1995-2025</tspan>
          </text>
        </g>

        {chart.interruption && (
          <g
            className={styles.interruption}
            opacity={drawProgress > chart.interruption.startProgress ? 1 : 0}
          >
            <rect
              x={chart.interruption.x}
              y={margin.top}
              width={chart.interruption.width}
              height={height - margin.top - margin.bottom}
            />
            <rect
              className={styles.hatch}
              x={chart.interruption.x}
              y={margin.top}
              width={chart.interruption.width}
              height={height - margin.top - margin.bottom}
            />
          </g>
        )}

        <g clipPath="url(#arrivals-reveal)">
          <path className={styles.area} d={chart.areaPath} />
          <path className={styles.line} d={chart.linePath} pathLength="1" />
          {chart.interruption?.linePath && (
            <path
              className={styles.interruptionLine}
              d={chart.interruption.linePath}
            />
          )}
        </g>

        <g className={styles.storyLabels}>
          {chart.storyLabels.map((label) => (
            <text
              key={label.text}
              x={label.x ?? chart.x(label.year)}
              y={height - 24}
              textAnchor={label.anchor}
            >
              {label.text}
            </text>
          ))}
        </g>

        {chart.latest && (
          <g
            className={styles.latestNote}
            opacity={latestNoteProgress}
            transform={`translate(0 ${(1 - latestNoteProgress) * 8})`}
          >
            <circle
              className={styles.latestDot}
              cx={chart.x(chart.latest.year)}
              cy={chart.y(chart.latest.arrivals)}
              r="5"
            />
            <g
              transform={`translate(${chart.x(chart.latest.year) - 68} ${
                chart.y(chart.latest.arrivals) - 64
              })`}
            >
              <rect width="136" height="50" />
              <text x="14" y="20">
                {formatWhole(chart.latest.arrivals)}
              </text>
              <text x="14" y="38">
                2025 preliminary
              </text>
            </g>
          </g>
        )}

        {hovered && (
          <g
            className={styles.hover}
            transform={`translate(${chart.x(hovered.year)} ${chart.y(
              hovered.arrivals,
            )})`}
          >
            <line y1="0" y2={height - margin.bottom - chart.y(hovered.arrivals)} />
            <circle r="7" />
            <g
              transform={`translate(${
                chart.x(hovered.year) > width - 260 ? -164 : 16
              } -58)`}
            >
              <rect width="148" height="48" rx="0" />
              <text x="12" y="20">
                {hovered.year}
              </text>
              <text x="12" y="37">
                {formatWhole(hovered.arrivals)} arrivals
              </text>
            </g>
          </g>
        )}

        <rect
          className={styles.hitArea}
          x={margin.left}
          y={margin.top}
          width={width - margin.left - margin.right}
          height={height - margin.top - margin.bottom}
        />
      </svg>
      <figcaption className={styles.caption}>
        Source: Pacific Data Hub / SPC DF_CLIMATE_CHANGE, TRSM_ARR. 2025 is a
        preliminary supplemental point from Fiji Bureau of Statistics.
      </figcaption>
    </figure>
  );
}

function buildChart(rows) {
  const fallback = {
    x: () => margin.left,
    y: () => height - margin.bottom,
    points: [],
    storyLabels: [],
    linePath: "",
    areaPath: "",
    interruption: null,
    latest: null,
  };

  if (rows.length === 0) return fallback;

  const yearExtent = extent(rows, (row) => row.year);
  const arrivalMax = max(rows, (row) => row.arrivals) ?? 0;
  const x = scaleLinear()
    .domain(yearExtent)
    .range([margin.left, width - margin.right]);
  const y = scaleLinear()
    .domain([0, Math.ceil(arrivalMax / 200000) * 200000])
    .range([height - margin.bottom, margin.top])
    .nice();

  const drawLine = line()
    .x((row) => x(row.year))
    .y((row) => y(row.arrivals));

  const linePath = drawLine(rows) ?? "";
  const areaPath = `${linePath}L${x(rows.at(-1).year)},${y(0)}L${x(
    rows[0].year,
  )},${y(0)}Z`;

  const points = rows.map((row) => ({
    ...row,
    progress: (x(row.year) - margin.left) / (width - margin.left - margin.right),
  }));
  const interruptionStart = rows.find((row) => row.year === 2020);
  const interruptionEnd = rows.find((row) => row.year === 2021);
  const interruption =
    interruptionStart && interruptionEnd
      ? {
          x: x(2019.5),
          width: x(2021.5) - x(2019.5),
          labelX: (x(2019.5) + x(2021.5)) / 2,
          startProgress:
            (x(2020) - margin.left) / (width - margin.left - margin.right),
          linePath:
            drawLine(rows.filter((row) => row.year >= 2019 && row.year <= 2022)) ??
            "",
        }
      : null;

  return {
    x,
    y,
    points,
    storyLabels: [
      { year: yearExtent[0], text: `${yearExtent[0]}`, anchor: "middle" },
      {
        year: 2020.5,
        x: interruption ? interruption.labelX : x(2020.5),
        text: "2020-21",
        anchor: "middle",
      },
      { year: storyEndYear, text: `${storyEndYear}`, anchor: "middle" },
    ],
    linePath,
    areaPath,
    interruption,
    latest: rows.find((row) => row.year === storyEndYear) ?? rows.at(-1),
  };
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}
