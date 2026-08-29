import { useMemo, useRef, useState } from "react";
import { fijiBoundary } from "../data/fijiBoundary";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
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

    const next = stickyFigureProgress(el, {
      desktopTop: 0,
      mobileTop: 0,
    });

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
      <div className={styles.sticky}>
      <div className={styles.scrollWrap}>
      <svg
        className={`${styles.svg} ${styles.desktopSvg}`}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Interactive Fiji map showing six communities with completed full or partial relocations, 17 public adaptation-survey locations, and a national total of 43 communities screened since 2021."
      >
        <g className={styles.header}>
          <text x="58" y="47">
            Stay, adapt or move
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
                  r={selected ? 20 : dot.type === "relocated" ? 17 : 10}
                  style={{ animationDelay: `${-(index % 8) * 0.42}s` }}
                  tabIndex="0"
                  role="button"
                  aria-label={`${dot.title}: ${dot.status}`}
                  onPointerEnter={() => setHoveredId(dot.id)}
                  onPointerDown={() => setHoveredId(dot.id)}
                  onFocus={() => setHoveredId(dot.id)}
                  onKeyDown={(event) =>
                    selectPointFromKeyboard(event, () => setHoveredId(dot.id))
                  }
                />
              </g>
            );
          })}
        </g>

        <g className={styles.legend} transform="translate(240 500)">
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
          transform={`translate(${704 + (1 - panelReveal) * 8} 30)`}
        >
          <line className={styles.panelRail} x1="-28" x2="-28" y1="34" y2="538" />

          <g className={styles.countPair} transform="translate(0 86)">
            <text className={styles.bigCount} x="0" y="0">
              6
            </text>
            <text x="41" y="-22">
              completed moves
            </text>
            <text x="41" y="0">
              2 full · 4 partial
            </text>
          </g>

          <g className={styles.countPair} transform="translate(0 164)">
            <text className={styles.bigCount} x="0" y="0">
              43
            </text>
            <text x="66" y="-22">
              communities screened
            </text>
            <text x="66" y="0">
              nationally since 2021
            </text>
          </g>

          <line className={styles.panelDivider} x1="0" x2="238" y1="192" y2="192" />

          <text className={styles.panelTitle} x="0" y="232">
            {panel.title}
          </text>
          <text className={styles.panelStatus} x="0" y="258">
            {panel.status}
          </text>
          <TextBlock
            className={styles.detailSummary}
            lines={panel.summary}
            x={0}
            y={292}
            lineHeight={20}
          />

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
                    className={`${styles.dotPulse} ${dot.type === "relocated" ? styles.relocatedPulse : styles.assessmentPulse} ${selected ? styles.selectedPulse : ""}`}
                    cx={dot.x}
                    cy={dot.y}
                    r={selected ? 18 : dot.type === "relocated" ? 15 : 9}
                    style={{ animationDelay: `${-(index % 8) * 0.42}s` }}
                    tabIndex="0"
                    role="button"
                    aria-label={`${dot.title}: ${dot.status}`}
                    onPointerDown={() => setHoveredId(dot.id)}
                    onFocus={() => setHoveredId(dot.id)}
                    onKeyDown={(event) =>
                      selectPointFromKeyboard(event, () => setHoveredId(dot.id))
                    }
                  />
                </g>
              );
            })}
          </g>
        </svg>
        <div className={styles.mobileLegend}>
          <span><i className={styles.relocatedDot} />completed move</span>
          <span><i className={styles.assessmentDot} />surveyed for adaptation</span>
        </div>
        <section
          className={styles.mobilePanel}
          style={{ opacity: panelReveal }}
          aria-live="polite"
        >
          <h4>{panel.title}</h4>
          <strong>{panel.status}</strong>
          <div className={styles.mobileSummary}>{panel.summary.join(" ")}</div>
        </section>
      </div>
      <figcaption className={styles.caption}>
        Each dot represents either a completed full or partial relocation or an
        adaptation-survey location at a public coordinate from the{" "}
        <a
          href={fijiBoundary.source.relocationAppUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Fiji Climate Change Division / UNOSAT GIS portal
        </a>
        . Only the 17 survey locations with public coordinates are shown; Fiji
        reported 43 communities screened nationally. Boundary:{"\u00a0"}
        <a
          href={fijiBoundary.source.boundaryUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          geoBoundaries
        </a>
        . National screening total:{"\u00a0"}
        <a
          href="https://www.parliament.gov.fj/wp-content/uploads/2025/08/Daily-Hansard-Monday-14th-July-2025.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Parliament of Fiji, July 2025
        </a>
        .
      </figcaption>
      </div>
    </figure>
  );
}

function TextBlock({ className, lines, x, y, lineHeight }) {
  return (
    <text className={className} x={x} y={y}>
      {lines.map((line, index) => (
        <tspan
          key={`${index}-${line}`}
          x={x}
          dy={index === 0 ? 0 : lineHeight}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
}

function selectPointFromKeyboard(event, select) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  select();
}

const defaultPanel = {
  title: "Hover a mapped point",
  status: "Assessment is not an order to move.",
  summary: [
    "The 17 survey points are mapped;",
    "the 43 national count is not.",
  ],
};

const completedSummaries = {
  "completed-denimanu": () =>
    "After Tropical Cyclone Evan destroyed 19 coastal homes in December 2012, part of this low-lying community moved away from flooding, erosion and rising seas.",
  "completed-tukuraki": (point) =>
    `After a 2012 landslide buried 80% of the village and killed a young family, residents relocated about ${formatDistance(point.distanceMeters)}.`,
  "completed-narikoso": (point) =>
    `Seven homes in the most flood-prone part of the village were moved about ${formatDistance(point.distanceMeters)} uphill. Most residents remain in low-lying areas exposed to rising seas, coastal flooding and erosion.`,
  "completed-vunidogoloa": (point) =>
    `The village moved about ${formatDistance(point.distanceMeters)} inland from low ground repeatedly flooded by storm surges, high tides and rising seas.`,
  "completed-nagasauva": (point) =>
    `After Tropical Cyclone Tomas destroyed seven homes, part of the village moved about ${formatDistance(point.distanceMeters)} away from severe coastal erosion.`,
  "completed-vunisavisavi": (point) =>
    `Four homes were moved about ${formatDistance(point.distanceMeters)} to higher ground within the village, but coastal flooding and saltwater intrusion continue.`,
};

function buildDots() {
  const relocated = fijiBoundary.completed.map((point) => ({
    ...point,
    title: point.name,
    status: `${sentenceCase(point.relocationType)} · ${point.year}`,
    summary: wrapText(
      completedSummaries[point.id]?.(point) ?? point.cause,
      34,
    ),
    type: "relocated",
  }));

  const assessment = fijiBoundary.surveyed.map((point, index) => ({
    ...point,
    id: `${point.id}-${index}`,
    title: point.name,
    status: `${formatPlaceName(point.province)} ${
      point.communityType?.toLowerCase() ?? "community"
    } · surveyed 2022`,
    summary: wrapText(point.hazards, 34),
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

function formatPlaceName(name) {
  return name.trim().replaceAll("_", "-");
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
