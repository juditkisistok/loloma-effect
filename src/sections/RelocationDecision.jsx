import { useMemo, useRef, useState } from "react";
import { fijiBoundary } from "../data/fijiBoundary";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
import visualizationStyles from "../styles/visualization.module.css";
import styles from "./RelocationDecision.module.css";

const { width } = fijiBoundary.dimensions;

const overlapOffsets = {
  "survey-nabuna-8": -4,
  "survey-vanuakula-9": 4,
  "survey-wailotua-1-12": -4,
  "survey-wailotua-2-13": 4,
};

const softReveal = (progress, start, end) => {
  const t = clamp((progress - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
};

export function RelocationDecision() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState("completed-vunidogoloa");
  const dots = useMemo(() => buildDots(), []);
  const isMobile = useMediaQuery(
    "(max-width: 599px), (max-width: 900px) and (min-height: 701px)",
  );

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

  // Keep the mobile sequence compact. On desktop, let readers land on the
  // geography first, then introduce completed moves, surveys and the panel.
  const relocatedReveal = clamp(progress / 0.12, 0, 1);
  const assessmentReveal = clamp((progress - 0.04) / 0.18, 0, 1);
  const panelReveal = isMobile
    ? clamp((progress - 0.16) / 0.22, 0, 1)
    : softReveal(progress, 0.68, 0.88);
  const legendReveal = isMobile ? 1 : softReveal(progress, 0.3, 0.48);
  const hovered = dots.find((dot) => dot.id === hoveredId);
  const panel = hovered ?? defaultPanel;

  return (
    <figure
      id="relocation-map"
      className={`${visualizationStyles.scrollFigure} ${visualizationStyles.figureFrame} ${visualizationStyles.insetFrame} ${styles.figure}`}
      ref={ref}
    >
      <div className={`${visualizationStyles.stickyCenter} ${styles.sticky}`}>
      <div className={styles.scrollWrap}>
      <header className={`${visualizationStyles.figureHeader} ${styles.desktopHeader}`}>
        <h3>Stay, adapt or move</h3>
        <p>Public GIS locations · select a point for its recorded status</p>
      </header>
      <svg
        className={`${styles.svg} ${styles.desktopSvg}`}
        viewBox={`0 60 ${width} 450`}
        role="group"
        aria-hidden={isMobile}
        aria-label="Interactive Fiji map showing six communities with completed full or partial relocations, 17 public adaptation-survey locations, and a national total of 43 communities screened since 2021."
      >
        <g className={styles.map} transform="translate(-70 -10) scale(1.08)">
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
            const assessmentIndex = index - fijiBoundary.completed.length;
            const reveal = isMobile
              ? dot.type === "relocated"
                ? clamp((relocatedReveal - index * 0.05) / 0.24, 0, 1)
                : clamp(
                    (assessmentReveal - assessmentIndex * 0.018) / 0.18,
                    0,
                    1,
                  )
              : dot.type === "relocated"
                ? softReveal(progress, 0.04 + index * 0.03, 0.2 + index * 0.03)
                : softReveal(
                    progress,
                    0.36 + assessmentIndex * 0.011,
                    0.52 + assessmentIndex * 0.011,
                  );
            const selected = dot.id === hoveredId;
            const xOffset = overlapOffsets[dot.id] ?? 0;
            return (
              <g key={dot.id} opacity={isMobile ? 0.5 + reveal * 0.5 : reveal}>
                <circle
                  className={`${styles.dotPulse} ${
                    dot.type === "relocated"
                      ? styles.relocatedPulse
                      : styles.assessmentPulse
                  } ${selected ? styles.selectedPulse : ""}`}
                  cx={dot.x + xOffset}
                  cy={dot.y}
                  r={selected ? 20 : dot.type === "relocated" ? 17 : 10}
                  style={{ animationDelay: `${-(index % 8) * 0.42}s` }}
                  data-point-index={index}
                  tabIndex={!isMobile && selected ? 0 : -1}
                  role="button"
                  aria-label={`${dot.title}: ${dot.status}`}
                  onPointerEnter={() => setHoveredId(dot.id)}
                  onPointerDown={() => setHoveredId(dot.id)}
                  onFocus={() => setHoveredId(dot.id)}
                  onKeyDown={(event) =>
                    selectPointFromKeyboard(event, index, dots, setHoveredId)
                  }
                />
              </g>
            );
          })}
        </g>

        <g
          className={styles.legend}
          transform="translate(200 490)"
          opacity={legendReveal}
        >
          <circle className={styles.relocatedDot} cx="0" cy="0" r="4.5" />
          <text x="13" y="4">
            completed move
          </text>
          <circle className={styles.assessmentDot} cx="122" cy="0" r="4.5" />
          <text x="135" y="4">
            surveyed for adaptation
          </text>
        </g>

        <g
          className={styles.panel}
          opacity={panelReveal}
          transform={`translate(${744 + (1 - panelReveal) * 8} 30)`}
        >
          <line className={styles.panelRail} x1="-28" x2="-28" y1="34" y2="450" />

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
          <text className={styles.panelStatus} x="0" y="252">
            {panel.status}
          </text>
          <TextBlock
            className={styles.detailSummary}
            lines={panel.summary}
            x={0}
            y={286}
            lineHeight={20}
          />

        </g>
      </svg>
      </div>

      <div className={styles.mobileView} aria-hidden={!isMobile}>
        <header className={`${visualizationStyles.figureHeader} ${styles.mobileHeader}`}>
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
          role="group"
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
              const xOffset = overlapOffsets[dot.id] ?? 0;
              return (
                <g key={dot.id} opacity={0.5 + reveal * 0.5}>
                  <circle
                    className={`${styles.dotPulse} ${dot.type === "relocated" ? styles.relocatedPulse : styles.assessmentPulse} ${selected ? styles.selectedPulse : ""}`}
                    cx={dot.x + xOffset}
                    cy={dot.y}
                    r={selected ? 20 : dot.type === "relocated" ? 17 : 10}
                    style={{ animationDelay: `${-(index % 8) * 0.42}s` }}
                    data-point-index={index}
                    tabIndex={isMobile && selected ? 0 : -1}
                    role="button"
                    aria-label={`${dot.title}: ${dot.status}`}
                    onPointerDown={() => setHoveredId(dot.id)}
                    onFocus={() => setHoveredId(dot.id)}
                    onKeyDown={(event) =>
                      selectPointFromKeyboard(event, index, dots, setHoveredId)
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
      <figcaption className={`${visualizationStyles.figureCaption} ${styles.caption}`}>
        <span className={styles.sourceDesktop}>
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
        </span>
        <span className={styles.sourceMobile}>
          Locations:{" "}
          <a
            href={fijiBoundary.source.relocationAppUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fiji Climate Change Division / UNOSAT
          </a>
          ; boundary:{" "}
          <a
            href={fijiBoundary.source.boundaryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            geoBoundaries
          </a>
          . The map shows 17 survey locations with public coordinates; 43 is
          Fiji's national screening total ({" "}
          <a
            href="https://www.parliament.gov.fj/wp-content/uploads/2025/08/Daily-Hansard-Monday-14th-July-2025.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Parliament, July 2025
          </a>
          ).
        </span>
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

function selectPointFromKeyboard(event, index, dots, select) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select(dots[index].id);
    return;
  }

  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
    return;
  }

  event.preventDefault();
  const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? dots.length - 1
        : (index + direction + dots.length) % dots.length;
  select(dots[nextIndex].id);
  requestAnimationFrame(() => {
    event.currentTarget
      .closest("svg")
      ?.querySelector(`[data-point-index="${nextIndex}"]`)
      ?.focus();
  });
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
    "Part of the community relocated after Tropical Cyclone Evan destroyed 19 coastal homes in 2012. The remaining low-lying settlement faces flooding, erosion and rising seas.",
  "completed-tukuraki": (point) =>
    `The village relocated about ${formatDistance(point.distanceMeters)} after a 2012 landslide buried 80% of the settlement and killed a young family.`,
  "completed-narikoso": (point) =>
    `Seven homes moved about ${formatDistance(point.distanceMeters)} uphill from the village's most flood-prone area. Most residents remain in low-lying areas exposed to rising seas, coastal flooding and erosion.`,
  "completed-vunidogoloa": (point) =>
    `The village moved about ${formatDistance(point.distanceMeters)} inland from low ground repeatedly flooded by storm surges, high tides and rising seas.`,
  "completed-nagasauva": (point) =>
    `Part of the village moved about ${formatDistance(point.distanceMeters)} after Tropical Cyclone Tomas destroyed seven homes. Severe coastal erosion remains a concern.`,
  "completed-vunisavisavi": (point) =>
    `Four homes moved about ${formatDistance(point.distanceMeters)} to higher ground within the village. Coastal flooding and saltwater intrusion continue.`,
};

const surveySummaries = {
  "survey-nabavatu":
    "Rain-triggered landslides and cyclone winds threaten the community. About 85% of residents are temporarily displaced, and drainage remains a concern at the old and proposed sites.",
  "survey-dawara":
    "River flooding and bank erosion threaten homes. During severe floods, logs swept downstream have struck houses along the riverbank.",
  "survey-cogea":
    "Flooding from the Wainunu River has destroyed several homes. A proposed relocation site exists, but safe, flat land is scarce.",
  "survey-soliyaga":
    "Coastal flooding, rising seas and storm surges threaten homes and infrastructure. Rocky terrain leaves little habitable land for relocation.",
  "survey-nakanacagi":
    "The low-lying village floods when the Dawa River rises. Heavy rain can also cut its road connection to the highway.",
  "survey-narata":
    "River and flash flooding threaten the village. Homes nearest the Sigatoka River face the greatest flood and erosion risk.",
  "survey-nawaqarua":
    "The village faces river and flash flooding at the Ba River estuary. Some affected homes have moved onto reclaimed land nearby.",
  "survey-nabuna:Lomaiviti":
    "Coastal and river flooding, erosion and storm surges affect the village. Runoff and a culvert that slows drainage can push water back into the community.",
  "survey-nabuna:Tavua":
    "River and coastal flooding leave the village waterlogged. The flooding has disrupted vegetable, root-crop and sugar-cane farming.",
  "survey-vanuakula":
    "River and flash flooding affect this estuary-side settlement. Floodwater can remain for several days.",
  "survey-vuniniudrovu":
    "Flooding and erosion along the Waimanu River threaten the village. Further bank collapse could damage homes and the Waila water supply.",
  "survey-saumakia":
    "River flooding and erosion during heavy rain are occurring more often than residents remember. Floods disrupt access to markets and essential services.",
  "survey-wailotua-1":
    "River flooding affects the village. Some households have raised homes on stilts or built second storeys to protect belongings.",
  "survey-wailotua-2":
    "River and flash flooding repeatedly affect the village. Residents face repeated rebuilding and little vacant habitable land nearby.",
  "survey-nadogoloa":
    "Storm surges, rising seas, river and coastal flooding, and cyclone winds affect this low-lying village. Several homes have already moved to a relocation site or family-owned land.",
  "survey-muani":
    "Storm surges, rising seas and saltwater intrusion contribute to flooding and waterlogging. Residents have built drains to channel surface water to the sea.",
  "survey-lekanai":
    "Coastal and river flooding, along with cyclone winds, threaten the village. Water can back into the community during heavy rain and king tides.",
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

  const assessment = fijiBoundary.surveyed.map((point, index) => {
    const summaryKey =
      point.id === "survey-nabuna"
        ? `${point.id}:${formatPlaceName(point.province)}`
        : point.id;

    return {
      ...point,
      id: `${point.id}-${index}`,
      title: point.name,
      status: `${formatPlaceName(point.province)} ${
        point.communityType?.toLowerCase() ?? "community"
      } · surveyed 2022`,
      summary: wrapText(surveySummaries[summaryKey] ?? point.hazards, 34),
      type: "assessment",
    };
  });

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
