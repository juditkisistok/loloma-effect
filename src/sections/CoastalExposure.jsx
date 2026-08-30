import { curveCatmullRomClosed, interpolateRgb, line } from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNearViewport } from "../hooks/useNearViewport";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
import visualizationStyles from "../styles/visualization.module.css";
import styles from "./CoastalExposure.module.css";

const width = 700;
const height = 390;
const plot = { x0: 24, y0: 10, x1: 676, y1: 380 };
const fallbackYears = [1999, 2007, 2015, 2023];
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
  const [shorelineData, setShorelineData] = useState(null);
  const shouldLoadData = useNearViewport(ref, "200% 0px");
  const years = shorelineData?.years ?? fallbackYears;
  const chart = useMemo(
    () => (shorelineData ? buildChart(shorelineData) : null),
    [shorelineData],
  );

  useEffect(() => {
    if (!shouldLoadData || shorelineData) return undefined;
    let active = true;
    import("../data/coastalShoreline").then(({ coastalShoreline }) => {
      if (active) setShorelineData(coastalShoreline);
    });
    return () => {
      active = false;
    };
  }, [shouldLoadData, shorelineData]);

  useFrame((frame) => {
    const el = ref.current;
    if (!el || !chart) return;
    if (frame.reduced) {
      setProgress(1);
      return;
    }

    const next = stickyFigureProgress(el, {
      desktopTop: 0.12,
      mobileTop: 0.06,
      hold: 0,
    });

    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  if (!chart) {
    return (
      <figure
        id="shoreline-chart"
        className={styles.figure}
        ref={ref}
        aria-busy="true"
      >
        <div className={styles.sticky}>
          <header className={`${visualizationStyles.figureHeader} ${styles.header}`}>
            <div>
              <h3>The moving edges of Tivua</h3>
              <p>Four satellite observations · 1999–2023</p>
            </div>
          </header>
          <div className={styles.loading}>Loading shoreline record…</div>
        </div>
      </figure>
    );
  }

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
    <figure id="shoreline-chart" className={styles.figure} ref={ref}>
      <div className={styles.sticky}>
        <header className={`${visualizationStyles.figureHeader} ${styles.header}`}>
          <div>
            <h3>The moving edges of Tivua</h3>
            <p>Four satellite observations · 1999–2023</p>
          </div>
        </header>

        <div className={styles.layout}>
          <div className={styles.plotWrap}>
          <div className={styles.yearKey} aria-label={`Current observation year ${activeYear}`}>
            <strong>{activeYear}</strong>
            <div className={styles.yearRamp} aria-hidden="true">
              <span style={{ left: `${activeT * 100}%` }} />
            </div>
            <div className={styles.yearEnds}><span>1999</span><span>2023</span></div>
          </div>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Four satellite observations show how the edge of Tivua Island changed between 1999 and 2023. The current observation year is ${activeYear}. The nearest valid shoreline-rate estimate shows that this section of shore moved outward by an average ${chart.hotspot.rate.toFixed(2)} metres per year.`}
          >
            <defs>
              <clipPath id="shore-paper-clip">
                <rect
                  x={plot.x0}
                  y={plot.y0}
                  width={plot.x1 - plot.x0}
                  height={plot.y1 - plot.y0}
                />
              </clipPath>
            </defs>

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
              <circle
                className={styles.measurePoint}
                cx={chart.hotspotPoint[0]}
                cy={chart.hotspotPoint[1]}
                r="5.5"
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

          </svg>
          </div>

          <aside className={styles.factRail}>
            <p>AT THE CIRCLED POINT</p>
            <strong>+{chart.hotspot.rate.toFixed(2)} m/yr</strong>
            <span>on average, the shoreline moved outward</span>
            <small>(±{chart.hotspot.se.toFixed(2)} m/yr est. uncertainty)</small>
            <RateContext
              context={shorelineData.rateContext}
              selectedRate={chart.hotspot.rate}
            />
          </aside>
        </div>

        <figcaption className={styles.caption}>
          <span className={styles.sourceDesktop}>
            Among the islands examined around Lautoka and Nadi, only Tivua has a
            complete, good-certainty outline in all four years. Thin lines mark
            observations; the thick line animates between them, so its in-between
            positions are not additional data. The circled rate comes from the
            nearest valid shoreline-rate estimate to the island's centre,
            offering a local view of change rather than a measure of the whole
            island or Fiji's coastlines more broadly.
            Source:{" "}
            <a
              href={shorelineData.source.url}
              target="_blank"
              rel="noreferrer"
            >
              Digital Earth Pacific / Pacific Data Hub Annual Shorelines
            </a>{" "}
            (Landsat, 30 m). Full selection method below.
          </span>
          <span className={styles.sourceMobile}>
            Thin lines are the four measured shorelines; the thick line moves
            between them. The circled +{chart.hotspot.rate.toFixed(2)} m/yr rate
            is a nearby local estimate, not an island average. Source:{" "}
            <a
              href={shorelineData.source.url}
              target="_blank"
              rel="noreferrer"
            >
              Pacific Data Hub Annual Shorelines
            </a>{" "}
            (Landsat, 30 m). Full method below.
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

function RateContext({ context, selectedRate }) {
  const chartWidth = 216;
  const chartHeight = 124;
  const x0 = 6;
  const x1 = 210;
  const baseline = 80;
  const maxBarHeight = 44;
  const [domainMin, domainMax] = context.domain;
  const maxCount = Math.max(...context.bins.map((bin) => bin.count));
  const x = (value) =>
    x0 + ((value - domainMin) / (domainMax - domainMin)) * (x1 - x0);
  const selectedX = x(selectedRate);
  const clippedCount = context.clippedLow + context.clippedHigh;

  return (
    <div className={styles.rateContext}>
      <div className={styles.contextTitle}>NEARBY SHORES MOVED BOTH WAYS</div>
      <div className={styles.contextDeck}>
        local median · +{context.median.toFixed(2)} m/yr
      </div>
      <svg
        className={styles.contextChart}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label={`Distribution of ${context.pointCount.toLocaleString()} good-certainty shoreline-rate estimates around Lautoka and Nadi. The selected rate is plus ${selectedRate.toFixed(2)} metres per year; the local median is plus ${context.median.toFixed(2)} metres per year.`}
      >
        <g className={styles.contextBars}>
          {context.bins.map((bin) => {
            const barX = x(bin.x0);
            const barWidth = Math.max(1, x(bin.x1) - barX - 1);
            const barHeight = (bin.count / maxCount) * maxBarHeight;
            return (
              <rect
                key={bin.x0}
                x={barX}
                y={baseline - barHeight}
                width={barWidth}
                height={barHeight}
                className={bin.x1 <= 0 ? styles.inwardBar : styles.outwardBar}
              />
            );
          })}
        </g>
        <line className={styles.contextAxis} x1={x0} x2={x1} y1={baseline} y2={baseline} />
        <line className={styles.zeroLine} x1={x(0)} x2={x(0)} y1="28" y2={baseline + 4} />
        <g className={styles.selectedMarker} transform={`translate(${selectedX} 0)`}>
          <text x="0" y="12" textAnchor="middle">selected +{selectedRate.toFixed(2)}</text>
          <line x1="0" x2="0" y1="19" y2={baseline + 3} />
          <circle cx="0" cy={baseline} r="2.8" />
        </g>
        <g className={styles.contextTicks}>
          <text x={x0} y="98">−{Math.abs(domainMin).toFixed(1)}</text>
          <text x={x(0)} y="98" textAnchor="middle">0</text>
          <text x={x1} y="98" textAnchor="end">+{domainMax.toFixed(1)} m/yr</text>
          <text x={x0} y="119">INWARD ←</text>
          <text x={x1} y="119" textAnchor="end">→ OUTWARD</text>
        </g>
      </svg>
      <div className={styles.contextNote}>
        {context.pointCount.toLocaleString()} good-certainty shoreline-rate estimates · middle 96% shown · {clippedCount} beyond chart range
      </div>
    </div>
  );
}

function buildChart(coastalShoreline) {
  const years = coastalShoreline.years;
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
    const sampled = resampleClosedLine(coordinates, 48);
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
    hotspotPoint: projection(hotspot.coordinates),
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
