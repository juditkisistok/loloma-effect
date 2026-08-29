import { extent, format, line, max, pointer, scaleLinear } from "d3";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
import styles from "./ArrivalsChart.module.css";

const maxWidth = 1000;
const height = 392;
const margin = { top: 82, right: 24, bottom: 38, left: 58 };
const storyEndYear = 2025;
const formatWhole = format(",");

export function ArrivalsChart({ rows = [] }) {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [width, setWidth] = useState(maxWidth);
  const chart = useMemo(() => buildChart(rows, width), [rows, width]);
  const drawProgress = chart.points.length ? progress : 0;
  const interruptionProgress = chart.interruption
    ? clamp((drawProgress - chart.interruption.startProgress) / 0.08, 0, 1)
    : 0;
  const latestNoteProgress = clamp((drawProgress - 0.975) / 0.025, 0, 1);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const updateWidth = (nextWidth) => {
      const boundedWidth = Math.min(maxWidth, Math.max(300, Math.round(nextWidth)));
      setWidth((current) => (current === boundedWidth ? current : boundedWidth));
    };
    updateWidth(wrap.clientWidth);

    const observer = new ResizeObserver((entries) => {
      updateWidth(entries[0]?.contentRect.width ?? wrap.clientWidth);
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useFrame((frame) => {
    const el = ref.current;
    if (!el) return;
    if (frame.reduced) {
      setProgress(1);
      return;
    }

    const next = stickyFigureProgress(el, {
      desktopTop: 0.18,
      mobileTop: 0.06,
      hold: 0.18,
    });

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

    const next = nearest?.point;
    if (next?.year === storyEndYear) {
      setHovered(null);
      return;
    }

    setHovered(next && next.progress <= drawProgress + 0.015 ? next : null);
  }

  return (
    <figure className={styles.figure} ref={ref}>
      <div className={styles.sticky}>
        <div className={styles.scrollWrap} ref={wrapRef}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Annual visitor-arrivals series for Fiji from 1995 to 2025. Pacific Data Hub observations through 2024 are supplemented with a Fiji Bureau of Statistics value for 2025. Arrivals rise from 318,000 in 1995, collapse during the COVID-19 interruption in 2020 and 2021, and recover to 986,367 in 2025."
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
            <stop offset="0%" stopColor="#0f877c" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#0f877c" stopOpacity="0.01" />
          </linearGradient>
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
          <text x={margin.left + 14} y={margin.top - 34}>
            {width < 360
              ? "Fiji visitors · 1995–2025"
              : "Visitor arrivals to Fiji, 1995–2025"}
          </text>
        </g>

        <g className={styles.yAxis}>
          {chart.yTicks.map((tick) => (
            <g key={tick} transform={`translate(0 ${chart.y(tick)})`}>
              <line x1={margin.left} x2={width - margin.right} />
              <text x={margin.left - 10} y="4" textAnchor="end">
                {formatAxisValue(tick)}
              </text>
            </g>
          ))}
        </g>

        {chart.interruption && (
          <g
            className={styles.interruption}
            opacity={interruptionProgress}
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
            <text
              className={styles.interruptionLabel}
              x="0"
              y="0"
              textAnchor="end"
              transform={`translate(${
                chart.interruption.x + 14
              } ${margin.top + 12}) rotate(-90)`}
            >
              COVID-19
            </text>
          </g>
        )}

        <g clipPath="url(#arrivals-reveal)">
          <path className={styles.area} d={chart.areaPath} />
        </g>
        <path
          className={styles.line}
          d={chart.linePath}
          pathLength="1"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1 - drawProgress,
          }}
        />
        {chart.interruption?.linePath && (
          <path
            className={styles.interruptionLine}
            d={chart.interruption.linePath}
            clipPath="url(#arrivals-reveal)"
          />
        )}

        <g className={styles.dataPoints} clipPath="url(#arrivals-reveal)">
          {chart.points.map((point) => (
           <circle
             key={point.year}
              className={styles.dataDot}
             cx={chart.x(point.year)}
             cy={chart.y(point.arrivals)}
              r="2.2"
              tabIndex={point.progress <= drawProgress + 0.015 ? 0 : -1}
              aria-label={`${point.year}: ${formatWhole(point.arrivals)} visitor arrivals${
                point.isPreliminary ? ", provisional" : ""
              }${
                point.source?.id !== "spc-tourism-arrivals"
                  ? ", sourced from the Fiji Bureau of Statistics"
                  : ""
              }`}
              onFocus={() => setHovered(point)}
              onBlur={() => setHovered(null)}
              onPointerDown={() => setHovered(point)}
            />
          ))}
        </g>

        <g className={styles.storyLabels}>
          {chart.storyLabels.map((label) => (
            <text
              key={label.text}
              x={label.x ?? chart.x(label.year)}
              y={height - 16}
              textAnchor={label.anchor}
            >
              {label.text}
            </text>
          ))}
        </g>

        {chart.latest && (
          <>
            <circle
              className={styles.latestDot}
              cx={chart.x(chart.latest.year)}
              cy={chart.y(chart.latest.arrivals)}
              r="4"
              opacity={latestNoteProgress}
            />
            <g
              className={styles.latestNote}
              opacity={latestNoteProgress}
              transform={`translate(${width - margin.right - 160} ${
                chart.y(chart.latest.arrivals) - 70 + (1 - latestNoteProgress) * 8
              })`}
            >
              <rect width="160" height="52" />
              <text x="15" y="20">
                {formatWhole(chart.latest.arrivals)}
              </text>
              <text x="15" y="39">
                {chart.latest.isPreliminary ? "2025 (PROVISIONAL)" : "2025"}
              </text>
            </g>
          </>
        )}

        {hovered && (
          <g
            className={styles.hover}
            transform={`translate(${chart.x(hovered.year)} ${chart.y(
              hovered.arrivals,
            )})`}
          >
            <circle r="4.5" />
            <g
              transform={`translate(${
                chart.x(hovered.year) > width - 206 ? -178 : 14
              } -56)`}
            >
              <rect width="164" height="48" rx="2" />
              <rect className={styles.hoverAccent} width="4" height="48" rx="2" />
              <text className={styles.hoverValue} x="14" y="20">
                {formatWhole(hovered.arrivals)}
              </text>
              <text className={styles.hoverMeta} x="14" y="37">
                {hovered.previousYear
                  ? `${hovered.year} · ${formatChange(
                      hovered.changePct,
                    )} vs ${hovered.previousYear}`
                  : `${hovered.year} · series start`}
              </text>
            </g>
          </g>
        )}

        <path
          className={styles.hitPath}
          d={chart.linePath}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onPointerLeave={() => setHovered(null)}
        />
      </svg>
        </div>
        <figcaption className={styles.caption}>
          Source:{" "}
          <a
            href="https://pacificdata.org/data/dataset/tourism-arrivals-df-tourism-arrivals"
            target="_blank"
            rel="noreferrer"
          >
            Pacific Data Hub / SPC Tourism Arrivals
          </a>{" "}(
          <span
            className={styles.sourceTerm}
            tabIndex="0"
            aria-label="TOUR series: overnight visitors only; same-day excursionists excluded"
          >
            TOUR series
            <span className={styles.sourceTip} role="tooltip">
              Overnight visitors only; same-day excursionists excluded
            </span>
          </span>
          ), supplemented with the provisional 2025 total from the{" "}
          <a
            href="https://www.statsfiji.gov.fj/statistics/social-statistics/tourism-and-migration-statistics/"
            target="_blank"
            rel="noreferrer"
          >
            Fiji Bureau of Statistics
          </a>.
        </figcaption>
      </div>
    </figure>
  );
}

function buildChart(rows, width) {
  const fallback = {
    x: () => margin.left,
    y: () => height - margin.bottom,
    points: [],
    yTicks: [],
    storyLabels: [],
    linePath: "",
    areaPath: "",
    interruption: null,
    latest: null,
  };

  if (rows.length === 0) return fallback;

  const yearExtent = extent(rows, (row) => row.year);
  const arrivalMax = max(rows, (row) => row.arrivals) ?? 0;
  const yMax = Math.ceil(arrivalMax / 200000) * 200000;
  const x = scaleLinear()
    .domain(yearExtent)
    .range([margin.left, width - margin.right]);
  const y = scaleLinear()
    .domain([0, yMax])
    .range([height - margin.bottom, margin.top])
    .nice();

  const drawLine = line()
    .x((row) => x(row.year))
    .y((row) => y(row.arrivals));

  const linePath = drawLine(rows) ?? "";
  const areaPath = `${linePath}L${x(rows.at(-1).year)},${y(0)}L${x(
    rows[0].year,
  )},${y(0)}Z`;

  const points = rows.map((row, index) => {
    const previous = rows[index - 1];
    return {
      ...row,
      previousYear: previous?.year ?? null,
      changePct: previous
        ? ((row.arrivals - previous.arrivals) / previous.arrivals) * 100
        : null,
      progress:
        (x(row.year) - margin.left) / (width - margin.left - margin.right),
    };
  });
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
    yTicks: [0, yMax / 3, (yMax * 2) / 3, yMax],
    storyLabels: (width < 600
      ? [yearExtent[0], 2005, 2020, storyEndYear]
      : [yearExtent[0], 2000, 2005, 2010, 2015, 2020, storyEndYear]
    ).map((year) => {
      if (year === yearExtent[0]) {
        return {
          year,
          x: x(year) + 6,
          text: `${year}`,
          anchor: "start",
        };
      }
      if (year === storyEndYear) {
        return { year, x: x(year), text: `${year}`, anchor: "end" };
      }
      return { year, text: `${year}`, anchor: "middle" };
    }),
    linePath,
    areaPath,
    interruption,
    latest: rows.find((row) => row.year === storyEndYear) ?? rows.at(-1),
  };
}

function formatAxisValue(value) {
  if (value === 0) return "0";
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}m`;
  }
  return `${Math.round(value / 1000)}k`;
}

function formatChange(value) {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) < 0.05) return "0.0%";
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}%`;
}
