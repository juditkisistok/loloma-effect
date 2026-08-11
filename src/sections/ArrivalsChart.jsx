import { extent, format, line, max, scaleLinear } from "d3";
import { useMemo } from "react";
import styles from "./ArrivalsChart.module.css";

const width = 1180;
const height = 520;
const margin = { top: 38, right: 70, bottom: 54, left: 74 };
const storyEndYear = 2025;
const formatWhole = format(",");

export function ArrivalsChart({ rows = [] }) {
  const chart = useMemo(() => buildChart(rows), [rows]);

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Annual visitor arrivals to Fiji from 1999 to 2025"
      >
        <g>
          {chart.yTicks.map((tick) => (
            <g key={tick} className={styles.grid}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={chart.y(tick)}
                y2={chart.y(tick)}
              />
              <text x={margin.left - 14} y={chart.y(tick)} dy="0.32em">
                {formatArrivals(tick)}
              </text>
            </g>
          ))}
        </g>

        <path className={styles.area} d={chart.areaPath} />
        <path className={styles.line} d={chart.linePath} />

        {chart.points.map((point) => (
          <circle
            key={point.year}
            className={
              point.year === 2020 || point.year === storyEndYear
                ? styles.pointMajor
                : styles.point
            }
            cx={chart.x(point.year)}
            cy={chart.y(point.arrivals)}
            r={point.year === storyEndYear ? 5.5 : 3.5}
          />
        ))}

        <g className={styles.axis}>
          {chart.xTicks.map((tick) => (
            <text key={tick} x={chart.x(tick)} y={height - 18}>
              {tick}
            </text>
          ))}
        </g>

        {chart.covid && (
          <g className={styles.annotation}>
            <line
              x1={chart.x(chart.covid.year)}
              x2={chart.x(chart.covid.year)}
              y1={margin.top}
              y2={height - margin.bottom}
            />
            <text
              x={chart.x(chart.covid.year) + 12}
              y={chart.y(chart.covid.arrivals) - 18}
            >
              2020 interruption
            </text>
          </g>
        )}

        {chart.latest && (
          <g className={styles.latest}>
            <text
              x={chart.x(chart.latest.year) - 6}
              y={chart.y(chart.latest.arrivals) - 28}
              textAnchor="end"
            >
              {formatWhole(chart.latest.arrivals)}
            </text>
            <text
              x={chart.x(chart.latest.year) - 6}
              y={chart.y(chart.latest.arrivals) - 9}
              textAnchor="end"
            >
              {storyEndYear}
            </text>
          </g>
        )}
      </svg>
      <figcaption className={styles.caption}>
        Source: Fiji Bureau of Statistics, visitor arrivals from Embarkation
        and Disembarkation Cards, Department of Immigration.
      </figcaption>
    </figure>
  );
}

function buildChart(rows) {
  const fallback = {
    x: () => margin.left,
    y: () => height - margin.bottom,
    points: [],
    xTicks: [],
    yTicks: [],
    linePath: "",
    areaPath: "",
    covid: null,
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

  return {
    x,
    y,
    points: rows,
    xTicks: [2000, 2005, 2010, 2015, 2020, 2025],
    yTicks: y.ticks(5),
    linePath,
    areaPath,
    covid: rows.find((row) => row.year === 2020) ?? null,
    latest: rows.find((row) => row.year === storyEndYear) ?? rows.at(-1),
  };
}

function formatArrivals(value) {
  if (value === 0) return "0";
  return `${format(".1s")(value).replace("G", "B")}`;
}
