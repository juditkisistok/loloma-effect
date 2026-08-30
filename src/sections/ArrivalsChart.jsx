import { extent, format, line, max, pointer, scaleLinear } from "d3";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
import visualizationStyles from "../styles/visualization.module.css";
import styles from "./ArrivalsChart.module.css";

const maxWidth = 1400;
const height = 392;
const desktopMargin = { top: 82, right: 24, bottom: 38, left: 58 };
const storyEndYear = 2025;
const formatWhole = format(",");

export function ArrivalsChart({ rows = [] }) {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [width, setWidth] = useState(maxWidth);
  const chart = useMemo(() => buildChart(rows, width), [rows, width]);
  const compact = width < 600;
  const drawProgress = chart.points.length ? progress : 0;
  const interruptionProgress = chart.interruption
    ? clamp((drawProgress - chart.interruption.startProgress) / 0.08, 0, 1)
    : 0;
  const latestNoteProgress = clamp(
    (drawProgress - (compact ? 0.91 : 0.965)) / (compact ? 0.07 : 0.035),
    0,
    1,
  );

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

  useEffect(() => {
    const clearTouchSelection = () => setHovered(null);
    window.addEventListener("scroll", clearTouchSelection, { passive: true });
    return () => window.removeEventListener("scroll", clearTouchSelection);
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
      mobileTop: 0.18,
      hold: window.innerWidth <= 900 ? 0.3 : 0.18,
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

  function handleChartKeyDown(event) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End", "Escape"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    if (event.key === "Escape") {
      setHovered(null);
      return;
    }

    const visible = chart.points.filter(
      (point) => point.progress <= drawProgress + 0.015,
    );
    if (!visible.length) return;

    const currentIndex = Math.max(
      0,
      visible.findIndex((point) => point.year === hovered?.year),
    );
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? visible.length - 1
          : event.key === "ArrowLeft"
            ? Math.max(0, currentIndex - 1)
            : Math.min(visible.length - 1, currentIndex + 1);
    setHovered(visible[nextIndex]);
  }

  const latestNoteWidth = compact ? 142 : 160;
  const latestNoteHeight = compact ? 50 : 52;
  const latestNoteX = width - chart.margin.right - latestNoteWidth;
  const latestNoteY = compact
    ? 49
    : chart.y(chart.latest?.arrivals ?? 0) - 70;

  return (
    <figure id="arrivals-chart" className={styles.figure} ref={ref}>
      <div className={styles.sticky}>
        <header className={`${visualizationStyles.figureHeader} ${styles.header}`}>
          <h3>Visitor arrivals to Fiji</h3>
          <p>Annual overnight visitors · 1995–2025</p>
        </header>
        <div className={styles.scrollWrap} ref={wrapRef}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        tabIndex="0"
        aria-label="Interactive annual visitor-arrivals chart for Fiji from 1995 to 2025. Use left and right arrow keys to explore years. Arrivals rise from 318,000 in 1995, collapse during the COVID-19 interruption in 2020 and 2021, and recover to 986,367 in 2025."
        onKeyDown={handleChartKeyDown}
        onFocus={() => {
          if (hovered) return;
          const visible = chart.points.filter(
            (point) => point.progress <= drawProgress + 0.015,
          );
          setHovered(
            visible.findLast((point) => point.year !== storyEndYear) ??
              visible.at(-1) ??
              null,
          );
        }}
        onBlur={() => setHovered(null)}
        onPointerLeave={() => setHovered(null)}
        onPointerCancel={() => setHovered(null)}
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
              x={chart.margin.left}
              y="0"
              width={(width - chart.margin.left - chart.margin.right) * drawProgress}
              height={height}
            />
          </clipPath>
        </defs>

        <rect
          className={styles.plotSurface}
          x={chart.margin.left}
          y="20"
          width={width - chart.margin.left - chart.margin.right}
          height={height - 20 - chart.margin.bottom}
        />
        <line
          className={styles.plotRule}
          x1={chart.margin.left}
          x2={chart.margin.left}
          y1="20"
          y2={height - chart.margin.bottom}
        />

        <g className={styles.yAxis}>
          {chart.yTicks.map((tick) => (
            <g key={tick} transform={`translate(0 ${chart.y(tick)})`}>
              <line x1={chart.margin.left} x2={width - chart.margin.right} />
              <text x={chart.margin.left - 9} y="4" textAnchor="end">
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
              y={chart.margin.top}
              width={chart.interruption.width}
              height={height - chart.margin.top - chart.margin.bottom}
            />
            <rect
              className={styles.hatch}
              x={chart.interruption.x}
              y={chart.margin.top}
              width={chart.interruption.width}
              height={height - chart.margin.top - chart.margin.bottom}
            />
            <text
              className={styles.interruptionLabel}
              x="0"
              y="0"
              textAnchor="end"
              transform={`translate(${
                chart.interruption.x + (compact ? 12 : 14)
              } ${chart.margin.top + 12}) rotate(-90)`}
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
              aria-hidden="true"
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
              opacity={hovered?.year === storyEndYear ? 0 : latestNoteProgress}
              transform={`translate(${latestNoteX} ${
                latestNoteY + (1 - latestNoteProgress) * 8
              })`}
            >
              <rect width={latestNoteWidth} height={latestNoteHeight} />
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
          onPointerCancel={() => setHovered(null)}
        />
      </svg>
          <span className={styles.srOnly} aria-live="polite">
            {hovered
              ? `${hovered.year}: ${formatWhole(hovered.arrivals)} visitor arrivals${hovered.isPreliminary ? ", provisional" : ""}.`
              : ""}
          </span>
        </div>
        <figcaption className={styles.caption}>
          <span className={styles.sourceDesktop}>
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
            ) through 2023, with 2024 and provisional 2025 values from the{" "}
            <a
              href="https://www.statsfiji.gov.fj/statistics/social-statistics/tourism-and-migration-statistics/"
              target="_blank"
              rel="noreferrer"
            >
              Fiji Bureau of Statistics
            </a>.
          </span>
          <span className={styles.sourceMobile}>
            Source:{" "}
            <a
              href="https://pacificdata.org/data/dataset/tourism-arrivals-df-tourism-arrivals"
              target="_blank"
              rel="noreferrer"
            >
              SPC Tourism Arrivals
            </a>{" "}
            through 2023;{" "}
            <a
              href="https://www.statsfiji.gov.fj/statistics/social-statistics/tourism-and-migration-statistics/"
              target="_blank"
              rel="noreferrer"
            >
              Fiji Bureau of Statistics
            </a>{" "}
            for 2024 and provisional 2025.
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

function buildChart(rows, width) {
  const margin =
    width < 600
      ? { top: 112, right: 18, bottom: 42, left: 46 }
      : desktopMargin;
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
    margin,
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
      if (width < 600 && year === 2020) {
        return { year, x: x(year) - 5, text: `${year}`, anchor: "end" };
      }
      return { year, text: `${year}`, anchor: "middle" };
    }),
    linePath,
    areaPath,
    interruption,
    latest: rows.find((row) => row.year === storyEndYear) ?? rows.at(-1),
    margin,
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
