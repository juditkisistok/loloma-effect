import { interpolateRgb } from "d3";
import { useMemo, useRef, useState } from "react";
import { coastalShoreline } from "../data/coastalShoreline";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./CoastalExposure.module.css";

const width = 1000;
const height = 425;
const years = Array.from({ length: 25 }, (_, index) => 1999 + index);
const colorForYear = interpolateRgb("#149f94", "#ff7668");

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
    const start = window.innerHeight * 0.9;
    const end = window.innerHeight * 0.14;
    const next = clamp((start - rect.top) / (start - end), 0, 1);

    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  const yearProgress = clamp(progress / 0.62, 0, 1);
  const activeIndex = Math.round(yearProgress * (years.length - 1));
  const activeYear = years[activeIndex];
  const activeT = activeIndex / (years.length - 1);
  return (
    <figure className={styles.figure} ref={ref}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Stylized annual shorelines for Fiji's Lautoka-Nadi coast from 1999 to 2023, showing inward coastal movement, sea-level rise at Lautoka, and population exposure near the coast."
      >
        <defs>
          <linearGradient id="coast-year-ramp" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#149f94" />
            <stop offset="100%" stopColor="#ff7668" />
          </linearGradient>
          <clipPath id="shore-paper-clip">
            <rect x="54" y="26" width="892" height="390" />
          </clipPath>
        </defs>

        <g className={styles.grid}>
          <line x1="230" x2="230" y1="26" y2="412" />
          <line x1="430" x2="430" y1="26" y2="412" />
          <line x1="630" x2="630" y1="26" y2="412" />
          <line x1="54" x2="946" y1="230" y2="230" />
        </g>

        <g className={styles.kicker}>
          <text x="70" y="70">
            VITI LEVU · LAUTOKA-NADI COAST
          </text>
        </g>

        <g className={styles.yearKey}>
          <text x="874" y="82" textAnchor="end">
            {activeYear}
          </text>
          <rect x="724" y="94" width="150" height="10" />
          <rect
            className={styles.yearNeedle}
            x={724 + activeT * 150 - 1}
            y="90"
            width="2"
            height="18"
          />
          <text x="724" y="125">
            1999
          </text>
          <text x="850" y="125">
            2023
          </text>
        </g>

        <g
          className={styles.factRail}
          opacity={clamp((progress - 0.64) / 0.22, 0, 1)}
        >
          <line x1="724" x2="724" y1="168" y2="316" />
          <text x="746" y="220" className={styles.factValueTeal}>
            +13 cm - Lautoka sea level since 1993
          </text>
          <text x="746" y="264" className={styles.factValue}>
            27%
          </text>
          <text x="816" y="262">
            of the population lives within 1 km of the sea
          </text>
          <text x="746" y="308" className={styles.factValue}>
            76%
          </text>
          <text x="816" y="306">
            within 5 km
          </text>
        </g>

        <g clipPath="url(#shore-paper-clip)">
          <path className={styles.reefShadow} d={chart.outerPath} />

          <g className={styles.contours}>
            {chart.contours.map((contour, index) => (
              <path
                key={contour.year}
                d={contour.path}
                opacity={index <= activeIndex ? contour.opacity : 0}
                style={{ stroke: contour.color }}
              />
            ))}
          </g>

          <path
            className={styles.currentShore}
            d={chart.contours[activeIndex].path}
            style={{ stroke: chart.contours[activeIndex].color }}
          />
        </g>

        <g className={styles.scale}>
          <line x1="84" x2="194" y1="360" y2="360" />
          <line x1="84" x2="84" y1="352" y2="368" />
          <line x1="194" x2="194" y1="352" y2="368" />
          <text x="84" y="344">
            500 m
          </text>
        </g>

        <g className={styles.coords}>
          <text x="238" y="406">
            177°24'E
          </text>
          <text x="638" y="406">
            177°30'E
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        Sources: Digital Earth Pacific / Pacific Data Hub Annual Shorelines
        (Landsat, 30 m); NASA Sea Level Change Team Lautoka summary; SPREP Fiji
        relocation coverage. Shoreline geometry is stylized for the scroll
        transition; annotations use the cited measurements.
      </figcaption>
    </figure>
  );
}

function buildChart() {
  const contours = years.map((year, index) => {
    const t = index / (years.length - 1);
    return {
      year,
      path: shorelinePath(t),
      color: colorForYear(t),
      opacity: 0.18 + t * 0.62,
    };
  });

  return {
    contours,
    outerPath: shorelinePath(0),
    innerPath: shorelinePath(1),
    rates: coastalShoreline.rates,
  };
}

function shorelinePath(t) {
  const cx = 386;
  const cy = 226;
  const points = Array.from({ length: 140 }, (_, index) => {
    const a = (Math.PI * 2 * index) / 140;
    const erosionBias =
      1 -
      t *
        (0.08 +
          0.1 * Math.max(0, Math.sin(a - 0.35)) +
          0.05 * Math.max(0, Math.cos(a * 2.2 + 0.4)));
    const rx = 268 * erosionBias;
    const ry = 116 * (1 - t * 0.08);
    const wobble =
      1 +
      0.11 * Math.sin(a * 3.1 + 0.7) +
      0.055 * Math.cos(a * 5.4 - 0.8) -
      0.09 * Math.max(0, Math.sin(a + 1.8));

    return [
      cx + Math.cos(a) * rx * wobble + 22 * Math.sin(a * 2.1),
      cy + Math.sin(a) * ry * wobble + 10 * Math.cos(a * 3.2),
    ];
  });

  return `${points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")} Z`;
}
