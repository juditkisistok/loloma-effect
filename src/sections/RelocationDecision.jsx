import { useMemo, useRef, useState } from "react";
import { fijiBoundary } from "../data/fijiBoundary";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./RelocationDecision.module.css";

const { width, height } = fijiBoundary.dimensions;

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
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Fiji map with hoverable public GIS points for completed relocations and adaptation survey communities."
      >
        <g className={styles.header}>
          <text x="58" y="47">
            STAY, ADAPT OR MOVE
          </text>
          <text x="58" y="70">
            Public GIS points for completed relocation and scoped adaptation sites
          </text>
        </g>

        <g className={styles.map}>
          {fijiBoundary.paths.map((path) => (
            <path key={path.id} className={styles.land} d={path.d} />
          ))}

          {fijiBoundary.places.map((place) => (
            <g
              key={place.id}
              className={
                place.id === "vunidogoloa-label"
                  ? styles.highlightPlace
                  : styles.place
              }
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
              <circle
                key={dot.id}
                className={`${styles.dot} ${
                  dot.type === "relocated"
                    ? styles.relocatedDot
                    : styles.assessmentDot
                } ${selected ? styles.selectedDot : ""}`}
                cx={dot.x}
                cy={dot.y}
                r={selected ? 7.2 : dot.type === "relocated" ? 5.6 : 3.8}
                opacity={reveal}
                tabIndex="0"
                role="button"
                aria-label={`${dot.title}: ${dot.status}`}
                onPointerEnter={() => setHoveredId(dot.id)}
                onPointerLeave={() => setHoveredId("completed-vunidogoloa")}
                onFocus={() => setHoveredId(dot.id)}
                onBlur={() => setHoveredId("completed-vunidogoloa")}
              />
            );
          })}
        </g>

        <g className={styles.legend} transform="translate(58 488)">
          <circle className={styles.relocatedDot} cx="0" cy="0" r="5.5" />
          <text x="14" y="4">
            relocated
          </text>
          <circle className={styles.assessmentDot} cx="105" cy="0" r="4" />
          <text x="118" y="4">
            adaptation survey
          </text>
        </g>

        <g
          className={styles.panel}
          opacity={panelReveal}
          transform={`translate(724 ${92 + (1 - panelReveal) * 8})`}
        >
          <text className={styles.panelKicker} x="0" y="0">
            DECISION FIELD
          </text>

          <g className={styles.countPair} transform="translate(0 48)">
            <text className={styles.bigCount} x="0" y="0">
              6
            </text>
            <text x="58" y="-9">
              communities relocated
            </text>
            <text x="58" y="13">
              as of 2025
            </text>
          </g>

          <g className={styles.countPair} transform="translate(0 118)">
            <text className={styles.bigCount} x="0" y="0">
              17
            </text>
            <text x="84" y="-9">
              public survey points
            </text>
            <text x="84" y="13">
              mapped by CCD / UNOSAT
            </text>
          </g>

          <text className={styles.nationalCount} x="0" y="160">
            43 screened nationally since 2021
          </text>

          <line x1="0" x2="218" y1="184" y2="184" />

          <text className={styles.panelTitle} x="0" y="226">
            {panel.title}
          </text>
          <text className={styles.panelStatus} x="0" y="254">
            {panel.status}
          </text>
          <TextBlock lines={panel.detail} x={0} y={290} />

          <line x1="0" x2="218" y1="360" y2="360" />

          <text className={styles.panelKicker} x="0" y="396">
            POSSIBLE OUTCOMES
          </text>
          <text x="0" y="428">
            adapt in place
          </text>
          <text x="0" y="454">
            remain under assessment
          </text>
          <text x="0" y="480">
            relocate with consent
          </text>
        </g>
      </svg>
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
        <tspan key={`${index}-${line}`} x={x} dy={index === 0 ? 0 : 23}>
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
    status: `${point.relocationType}, completed ${point.year}`,
    detail: [
      `${point.province} province; ${point.households} households.`,
      `Moved about ${point.distanceMeters} m from old site.`,
      ...wrapText(point.cause, 32, 2),
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
      ...wrapText(point.hazards, 32, 3),
    ],
    type: "assessment",
  }));

  return [...relocated, ...assessment];
}

function wrapText(value, maxLength, maxLines) {
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
    if (lines.length === maxLines) break;
  }

  if (line && lines.length < maxLines) lines.push(line);
  if (
    lines.length === maxLines &&
    words.join(" ").length > lines.join(" ").length
  ) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]$/, "")}...`;
  }

  return lines;
}
