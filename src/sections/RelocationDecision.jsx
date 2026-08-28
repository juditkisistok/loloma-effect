import { useMemo, useRef, useState } from "react";
import { fijiBoundary } from "../data/fijiBoundary";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./RelocationDecision.module.css";

const { width } = fijiBoundary.dimensions;
const height = 590;

export function RelocationDecision() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState("completed-vunidogoloa");
  const dots = useMemo(() => buildDots(), []);

  useFrame((frame) => {
    const el = ref.current;
    if (!el) return;
    if (frame.reduced) {
      setProgress(1);
      return;
    }

    const rect = el.getBoundingClientRect();
    const start = window.innerHeight * 0.9;
    const end = window.innerHeight * 0.14;
    const next = clamp((start - rect.top) / (start - end), 0, 1);

    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  const relocatedReveal = clamp(progress / 0.3, 0, 1);
  const assessmentReveal = clamp((progress - 0.24) / 0.42, 0, 1);
  const panelReveal = clamp((progress - 0.58) / 0.22, 0, 1);
  const hovered = dots.find((dot) => dot.id === hoveredId);
  const panel = hovered ?? defaultPanel;

  return (
    <figure className={styles.figure} ref={ref}>
      <div className={styles.scrollWrap}>
      <svg
        className={`${styles.svg} ${styles.desktopSvg}`}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Interactive Fiji map showing six communities with completed full or partial relocations, 17 public adaptation-survey locations, and a national total of 43 communities screened since 2021."
      >
        <g className={styles.header}>
          <text x="58" y="47">
            STAY, ADAPT OR MOVE
          </text>
          <text x="58" y="70">
            Public GIS locations · select a point for its recorded status
          </text>
        </g>

        <g className={styles.map}>
          {fijiBoundary.paths.map((path) => (
            <path key={path.id} className={styles.land} d={path.d} />
          ))}

          {fijiBoundary.places
            .filter((place) => place.id !== "vunidogoloa-label")
            .map((place) => (
            <g
              key={place.id}
              className={styles.place}
              transform={`translate(${place.x} ${place.y})`}
            >
              <circle r="2.4" />
              <text x="7" y="-6">
                {place.label}
              </text>
            </g>
          ))}

          {dots.map((dot, index) => {
            const reveal =
              dot.type === "relocated"
                ? clamp((relocatedReveal - index * 0.05) / 0.24, 0, 1)
                : clamp(
                    (assessmentReveal -
                      (index - fijiBoundary.completed.length) * 0.018) /
                      0.18,
                    0,
                    1,
                  );
            const selected = dot.id === hoveredId;
            return (
              <g key={dot.id} opacity={reveal}>
                <circle
                  className={`${styles.dotPulse} ${
                    dot.type === "relocated"
                      ? styles.relocatedPulse
                      : styles.assessmentPulse
                  } ${selected ? styles.selectedPulse : ""}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={selected ? 20 : dot.type === "relocated" ? 17 : 8}
                  style={{ animationDelay: `${-(index % 8) * 0.42}s` }}
                  tabIndex="0"
                  role="button"
                  aria-label={`${dot.title}: ${dot.status}`}
                  onPointerEnter={() => setHoveredId(dot.id)}
                  onPointerDown={() => setHoveredId(dot.id)}
                  onFocus={() => setHoveredId(dot.id)}
                />
              </g>
            );
          })}
        </g>

        <g className={styles.legend} transform="translate(58 500)">
          <circle className={styles.relocatedDot} cx="0" cy="0" r="5.5" />
          <text x="14" y="4">
            relocated
          </text>
          <circle className={styles.assessmentDot} cx="105" cy="0" r="4" />
          <text x="118" y="4">
            surveyed for adaptation
          </text>
        </g>

        <g
          className={styles.panel}
          opacity={panelReveal}
          transform={`translate(${704 + (1 - panelReveal) * 8} 0)`}
        >
          <line className={styles.panelRail} x1="-28" x2="-28" y1="92" y2="568" />

          <text className={styles.panelKicker} x="0" y="47">
            NATIONAL PICTURE
          </text>

          <g className={styles.countPair} transform="translate(0 112)">
            <text className={styles.bigCount} x="58" y="0" textAnchor="end">
              6
            </text>
            <text x="82" y="-23">
              completed moves
            </text>
            <text x="82" y="-1">
              2 full · 4 partial
            </text>
          </g>

          <g className={styles.countPair} transform="translate(0 188)">
            <text className={styles.bigCount} x="58" y="0" textAnchor="end">
              43
            </text>
            <text x="82" y="-23">
              communities screened
            </text>
            <text x="82" y="-1">
              nationally since 2021
            </text>
          </g>

          <text className={styles.mappedNote} x="0" y="226">
            17 survey locations have public coordinates here
          </text>

          <line className={styles.panelDivider} x1="0" x2="238" y1="252" y2="252" />

          <text className={styles.panelKicker} x="0" y="282">
            SELECTED LOCATION
          </text>
          <text className={styles.panelTitle} x="0" y="312">
            {panel.title}
          </text>
          <text className={styles.panelStatus} x="0" y="338">
            {panel.status}
          </text>
          <TextBlock lines={panel.detail} x={0} y={370} />

        </g>
      </svg>
      </div>

      <div className={styles.mobileView}>
        <header className={styles.mobileHeader}>
          <h3>Stay, adapt or move</h3>
          <p>Public GIS locations · select a point for its recorded status</p>
        </header>
        <div className={styles.mobileCounts}>
          <div><strong>6</strong><span>completed moves<br />2 full · 4 partial</span></div>
          <div><strong>43</strong><span>communities screened<br />nationally since 2021</span></div>
        </div>
        <svg
          className={styles.mobileMap}
          viewBox="35 78 665 405"
          role="img"
          aria-label="Map of Fiji with six completed full or partial relocation locations and 17 public adaptation-survey locations."
        >
          <g className={styles.map}>
            {fijiBoundary.paths.map((path) => (
              <path key={path.id} className={styles.land} d={path.d} />
            ))}
            {dots.map((dot, index) => {
              const selected = dot.id === hoveredId;
              return (
                <circle
                  key={dot.id}
                  className={`${styles.dotPulse} ${dot.type === "relocated" ? styles.relocatedPulse : styles.assessmentPulse} ${selected ? styles.selectedPulse : ""}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={selected ? 18 : dot.type === "relocated" ? 15 : 7}
                  style={{ animationDelay: `${-(index % 8) * 0.42}s` }}
                  tabIndex="0"
                  role="button"
                  aria-label={`${dot.title}: ${dot.status}`}
                  onPointerDown={() => setHoveredId(dot.id)}
                  onFocus={() => setHoveredId(dot.id)}
                />
              );
            })}
          </g>
        </svg>
        <div className={styles.mobileLegend}>
          <span><i className={styles.relocatedDot} />completed move</span>
          <span><i className={styles.assessmentDot} />surveyed for adaptation</span>
        </div>
        <section className={styles.mobilePanel} aria-live="polite">
          <p>SELECTED LOCATION</p>
          <h4>{panel.title}</h4>
          <strong>{panel.status}</strong>
          <div>{panel.detail.map((line) => <span key={line}>{line}</span>)}</div>
        </section>
      </div>
      <figcaption className={styles.caption}>
        Sources: geoBoundaries gbOpen Fiji ADM0 boundary; Fiji Climate Change
        Division / UNOSAT GIS Platform, Completed Relocation (CCD, 2023) and
        Adaptation Survey 2022 (CCD, 2023); FBC News report on 43 communities
        screened since 2021. Every plotted dot uses a public GIS coordinate.
      </figcaption>
    </figure>
  );
}

function TextBlock({ lines, x, y }) {
  return (
    <text className={styles.detailText} x={x} y={y}>
      {lines.map((line, index) => (
        <tspan key={`${index}-${line}`} x={x} dy={index === 0 ? 0 : 21}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

const defaultPanel = {
  title: "Hover a mapped point",
  status: "Assessment is not an order to move.",
  detail: [
    "The 17 survey points are mapped;",
    "the 43 national count is not.",
  ],
};

function buildDots() {
  const relocated = fijiBoundary.completed.map((point) => ({
    ...point,
    title: point.name,
    status: `${sentenceCase(point.relocationType)} · completed ${point.year}`,
    detail: [
      `${point.province} · ${point.households} households`,
      ...(point.distanceMeters
        ? [`Moved about ${formatDistance(point.distanceMeters)}`]
        : []),
      ...wrapText(point.cause, 32),
    ],
    type: "relocated",
  }));

  const assessment = fijiBoundary.surveyed.map((point, index) => ({
    ...point,
    id: `${point.id}-${index}`,
    title: point.name,
    status: `${point.province} ${
      point.communityType?.toLowerCase() ?? "community"
    }`,
    detail: [
      "Adaptation Survey 2022 point.",
      ...wrapText(point.hazards, 32),
    ],
    type: "assessment",
  }));

  return [...relocated, ...assessment];
}

function formatDistance(distanceMeters) {
  if (distanceMeters >= 1000) {
    const kilometres = distanceMeters / 1000;
    return `${Number.isInteger(kilometres) ? kilometres : kilometres.toFixed(1)} km`;
  }
  return `${distanceMeters} m`;
}

function sentenceCase(value) {
  const text = String(value ?? "");
  return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
}

function wrapText(value, maxLength) {
  if (!value) return [];
  const words = String(value).split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);

  return lines;
}
