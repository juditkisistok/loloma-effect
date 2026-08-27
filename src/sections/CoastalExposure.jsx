import { curveCatmullRomClosed, interpolateRgb, line } from "d3";
import { useMemo, useRef, useState } from "react";
import { coastalShoreline } from "../data/coastalShoreline";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./CoastalExposure.module.css";

const width = 1000;
const height = 425;
const plot = { x0: 54, y0: 26, x1: 690, y1: 412 };
const years = coastalShoreline.years;
const islandCenter = [177.347, -17.6141];
const yearColors = ["#149f94", "#2f9188", "#d88970", "#ff7668"];

function colorForYear(t) {
  const position = clamp(t, 0, 1) * (yearColors.length - 1);
  const index = Math.min(yearColors.length - 2, Math.floor(position));
  return interpolateRgb(yearColors[index], yearColors[index + 1])(
    position - index,
  );
}

export function CoastalExposure() {
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
    const stickyRatio = window.innerWidth <= 760 ? 0.06 : 0.12;
    const stickyTop = Math.max(18, window.innerHeight * stickyRatio);
    const stickyHeight = el.firstElementChild?.offsetHeight ?? 0;
    const travel = Math.max(el.offsetHeight - stickyHeight - stickyTop, 1);
    const next = clamp((stickyTop - rect.top) / travel, 0, 1);

    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  const yearPosition = progress * (years.length - 1);
  const segmentIndex = Math.min(
    years.length - 2,
    Math.floor(yearPosition),
  );
  const segmentProgress = yearPosition - segmentIndex;
  const activeIndex = Math.min(
    years.length - 1,
    Math.round(yearPosition),
  );
  const activeYear = years[activeIndex];
  const activeT = yearPosition / (years.length - 1);
  const currentPath = chart.pathBuilder(
    interpolatePoints(
      chart.samples[segmentIndex],
      chart.samples[segmentIndex + 1],
      segmentProgress,
    ),
  );
  const currentColor = colorForYear(activeT);

  return (
    <figure className={styles.figure} ref={ref}>
      <div className={styles.sticky}>
        <div className={styles.scrollWrap}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Four satellite observations show how the edge of a small island off Lautoka changed between 1999 and 2023. The nearest observation year is ${activeYear}. A nearby measuring line shows that this section of shore built outward by an average ${chart.hotspot.rate.toFixed(1)} metres per year.`}
          >
            <defs>
              <linearGradient id="coast-year-ramp" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#149f94" />
                <stop offset="33%" stopColor="#2f9188" />
                <stop offset="67%" stopColor="#d88970" />
                <stop offset="100%" stopColor="#ff7668" />
              </linearGradient>
              <clipPath id="shore-paper-clip">
                <rect
                  x={plot.x0}
                  y={plot.y0}
                  width={plot.x1 - plot.x0}
                  height={plot.y1 - plot.y0}
                />
              </clipPath>
              <clipPath id="year-value-clip">
                <rect x="730" y="34" width="154" height="58" />
              </clipPath>
            </defs>

            <g className={styles.kicker}>
              <text x="70" y="63">
                ONE SMALL ISLAND · FOUR SATELLITE SNAPSHOTS
              </text>
              <text x="70" y="82">
                SCROLL: THE THICK LINE MOVES BETWEEN FOUR MEASURED EDGES
              </text>
            </g>

            <g className={styles.yearKey}>
              <g clipPath="url(#year-value-clip)">
                <text
                  className={styles.yearValue}
                  x="874"
                  y={74 - segmentProgress * 50}
                  textAnchor="end"
                >
                  {years[segmentIndex]}
                </text>
                <text
                  className={styles.yearValue}
                  x="874"
                  y={124 - segmentProgress * 50}
                  textAnchor="end"
                >
                  {years[segmentIndex + 1]}
                </text>
              </g>
              <rect x="724" y="92" width="150" height="8" />
              <rect
                className={styles.yearNeedle}
                x={724 + activeT * 150 - 1}
                y="88"
                width="2"
                height="16"
              />
              <text x="724" y="121">
                1999
              </text>
              <text x="850" y="121">
                2023
              </text>
            </g>

            <g clipPath="url(#shore-paper-clip)">
              <path className={styles.reefShadow} d={currentPath} />
              <path className={styles.landWash} d={currentPath} />

              <g className={styles.contours}>
                {chart.contours.map((contour, index) => (
                  <path
                    key={contour.year}
                    d={contour.path}
                    opacity={clamp(yearPosition - index + 0.2, 0, 0.3)}
                    style={{ stroke: contour.color }}
                  />
                ))}
              </g>

              <path
                className={styles.currentShore}
                d={currentPath}
                style={{ stroke: currentColor }}
              />
            </g>

            <g className={styles.coords}>
              <text x={plot.x0 + 16} y={plot.y1 - 10}>
                177.346°E
              </text>
              <text x={plot.x1 - 16} y={plot.y1 - 10} textAnchor="end">
                177.348°E
              </text>
            </g>

            <g className={styles.factRail}>
              <text x="724" y="186" className={styles.factKicker}>
                NEARBY SHORELINE CHANGE
              </text>
              <text x="724" y="236" className={styles.factValueTeal}>
                +{chart.hotspot.rate.toFixed(1)} m/yr
              </text>
              <text x="724" y="264" className={styles.factDetail}>
                land grew outward, on average
              </text>
              <text x="724" y="286" className={styles.factDetail}>
                uncertainty: ±{chart.hotspot.se.toFixed(1)} m/yr
              </text>
            </g>
          </svg>
        </div>
        <p className={styles.mobileYear} aria-hidden="true">
          {activeYear}
        </p>
        <p className={styles.scrollHint}>Scroll for full graphic →</p>
        <figcaption className={styles.caption}>
          Four thin lines show the island’s measured edges in 1999, 2007, 2015
          and 2023. The thick line is animation; its in-between positions are
          not extra data. At the nearby measuring line, the shore built outward
          by an average 2.4 metres a year. Elsewhere, Fiji’s shorelines may move
          in the opposite direction. Source: {" "}
          <a
            href={coastalShoreline.source.url}
            target="_blank"
            rel="noreferrer"
          >
            Digital Earth Pacific / Pacific Data Hub Annual Shorelines
          </a>{" "}
          (Landsat, 30 m), an official Pacific Dataviz Challenge 2026 dataset.
          Lines are smoothed between recorded vertices for display.
        </figcaption>
      </div>
    </figure>
  );
}

function buildChart() {
  const observations = years.map((year) => {
    const shoreline = coastalShoreline.shorelines
      .filter(
        (candidate) =>
          candidate.year === year && isClosed(candidate.coordinates),
      )
      .map((candidate) => ({
        ...candidate,
        distance: coordinateDistance(
          centroid(candidate.coordinates),
          islandCenter,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    return { year, coordinates: withoutClosingPoint(shoreline.coordinates) };
  });
  const projection = buildProjection(
    observations.flatMap((item) => item.coordinates),
  );
  const pathBuilder = line()
    .x((coordinate) => coordinate[0])
    .y((coordinate) => coordinate[1])
    .curve(curveCatmullRomClosed.alpha(0.45));
  const projectedObservations = observations.map((observation) =>
    observation.coordinates.map(projection),
  );
  const samples = projectedObservations.reduce((aligned, coordinates) => {
    const sampled = resampleClosedLine(coordinates, 16);
    const previous = aligned.at(-1);
    aligned.push(previous ? alignSamples(previous, sampled) : sampled);
    return aligned;
  }, []);
  const contours = observations.map((observation, index) => ({
    year: observation.year,
    color: colorForYear(index / (years.length - 1)),
    path: pathBuilder(samples[index]),
  }));
  const hotspot = coastalShoreline.rates
    .map((candidate) => ({
      ...candidate,
      distance: coordinateDistance(candidate.coordinates, islandCenter),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return {
    contours,
    samples,
    pathBuilder,
    hotspot,
  };
}

function resampleClosedLine(coordinates, sampleCount) {
  const segments = coordinates.map((point, index) => {
    const next = coordinates[(index + 1) % coordinates.length];
    return { point, next, length: pointDistance(point, next) };
  });
  const perimeter = segments.reduce((sum, segment) => sum + segment.length, 0);
  const interval = perimeter / sampleCount;
  const samples = [];
  let segmentIndex = 0;
  let segmentStart = 0;

  for (let index = 0; index < sampleCount; index += 1) {
    const target = index * interval;
    while (
      segmentIndex < segments.length - 1 &&
      segmentStart + segments[segmentIndex].length < target
    ) {
      segmentStart += segments[segmentIndex].length;
      segmentIndex += 1;
    }
    const segment = segments[segmentIndex];
    const t = segment.length
      ? (target - segmentStart) / segment.length
      : 0;
    samples.push(interpolatePoint(segment.point, segment.next, t));
  }

  return samples;
}

function alignSamples(reference, samples) {
  let bestOffset = 0;
  let bestDistance = Infinity;

  for (let offset = 0; offset < samples.length; offset += 1) {
    const distance = reference.reduce((sum, point, index) => {
      const candidate = samples[(index + offset) % samples.length];
      const dx = point[0] - candidate[0];
      const dy = point[1] - candidate[1];
      return sum + dx * dx + dy * dy;
    }, 0);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = offset;
    }
  }

  return samples.map(
    (_, index) => samples[(index + bestOffset) % samples.length],
  );
}

function interpolatePoints(from, to, t) {
  const eased = t * t * (3 - 2 * t);
  return from.map((point, index) =>
    interpolatePoint(point, to[index], eased),
  );
}

function interpolatePoint(from, to, t) {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

function pointDistance(from, to) {
  return Math.hypot(to[0] - from[0], to[1] - from[1]);
}

function buildProjection(coordinates) {
  const centerLatitude =
    coordinates.reduce((sum, coordinate) => sum + coordinate[1], 0) /
    coordinates.length;
  const longitudeCorrection = Math.cos((centerLatitude * Math.PI) / 180);
  const localCoordinates = coordinates.map(([longitude, latitude]) => [
    longitude * longitudeCorrection,
    -latitude,
  ]);
  const minX = Math.min(...localCoordinates.map(([x]) => x));
  const maxX = Math.max(...localCoordinates.map(([x]) => x));
  const minY = Math.min(...localCoordinates.map(([, y]) => y));
  const maxY = Math.max(...localCoordinates.map(([, y]) => y));
  const scale = Math.min(
    (plot.x1 - plot.x0 - 70) / (maxX - minX),
    (plot.y1 - plot.y0 - 118) / (maxY - minY),
  );
  const centerX = (plot.x0 + plot.x1) / 2;
  const centerY = (plot.y0 + plot.y1) / 2 + 15;

  return ([longitude, latitude]) => [
    centerX +
      (longitude * longitudeCorrection - (minX + maxX) / 2) * scale,
    centerY + (-latitude - (minY + maxY) / 2) * scale,
  ];
}

function isClosed(coordinates) {
  const first = coordinates[0];
  const last = coordinates.at(-1);
  return first[0] === last[0] && first[1] === last[1];
}

function withoutClosingPoint(coordinates) {
  return isClosed(coordinates) ? coordinates.slice(0, -1) : coordinates;
}

function centroid(coordinates) {
  return coordinates
    .reduce(
      (sum, coordinate) => [
        sum[0] + coordinate[0],
        sum[1] + coordinate[1],
      ],
      [0, 0],
    )
    .map((value) => value / coordinates.length);
}

function coordinateDistance([longitudeA, latitudeA], [longitudeB, latitudeB]) {
  const latitude = ((latitudeA + latitudeB) / 2) * (Math.PI / 180);
  const longitudeDelta = (longitudeA - longitudeB) * Math.cos(latitude);
  return Math.hypot(longitudeDelta, latitudeA - latitudeB);
}
