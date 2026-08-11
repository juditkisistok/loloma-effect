import { curveCatmullRom, interpolateRgb, line } from "d3";
import { useMemo, useState } from "react";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./Scene.module.css";

const WIDTH = 1440;
const HEIGHT = 900;
const WATERLINE = 540;

const skyStops = [
  { p: 0, top: "#22344c", mid: "#c78a68", hor: "#f4c9a8", sea: "#2aa495" },
  { p: 0.14, top: "#5f8ea6", mid: "#bcd8dd", hor: "#e6f0ec", sea: "#2aa495" },
  { p: 0.42, top: "#7fb0c4", mid: "#aacdd6", hor: "#d3e7e6", sea: "#2aa495" },
];

const farRidge = [
  [0, 478],
  [240, 432],
  [480, 458],
  [720, 414],
  [980, 452],
  [1220, 426],
  [1440, 462],
];

const midRidge = [
  [0, 506],
  [280, 470],
  [560, 496],
  [860, 458],
  [1160, 494],
  [1440, 470],
];

const islandRidge = [
  [300, 562],
  [430, 486],
  [560, 432],
  [720, 392],
  [880, 430],
  [1010, 478],
  [1140, 560],
];

const stars = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: seeded(i * 17 + 7) * WIDTH,
  y: seeded(i * 29 + 11) * 460,
  r: seeded(i * 41 + 3) * 1.1 + 0.3,
}));

export function Scene() {
  const paths = useMemo(
    () => ({
      far: ridgePath(farRidge),
      mid: ridgePath(midRidge),
      island: ridgePath(islandRidge),
    }),
    [],
  );
  const [tone, setTone] = useState(0);
  const color = interpolateScene(tone);
  const sun = sunPosition(tone);

  useFrame((frame) => {
    const nextTone = frame.span("hero", "impasse");
    setTone((current) =>
      Math.abs(current - nextTone) > 0.00001 ? nextTone : current,
    );
  });

  return (
    <div className={styles.scene} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lol-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.top} />
            <stop offset="55%" stopColor={color.mid} />
            <stop offset="100%" stopColor={color.hor} />
          </linearGradient>
          <linearGradient id="lol-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.sea} />
            <stop offset="100%" stopColor="#081f33" />
          </linearGradient>
          <filter id="lol-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
            />
          </filter>
          <filter id="lol-mist" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="lol-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="lol-vignette" cx="50%" cy="46%" r="72%">
            <stop offset="62%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#04101c" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill="url(#lol-sky)" />
        <g className={styles.stars} opacity="0">
          {stars.map((star) => (
            <circle
              key={star.id}
              cx={star.x.toFixed(1)}
              cy={star.y.toFixed(1)}
              r={star.r.toFixed(2)}
              fill="#fbf6ec"
            />
          ))}
        </g>
        <circle
          cx={sun.x}
          cy={sun.y}
          r="34"
          fill={sun.fill}
          opacity="0.9"
        />
        <g className={styles.mist} filter="url(#lol-mist)" opacity={0.5 - tone * 0.32}>
          <ellipse cx="420" cy="430" rx="360" ry="26" fill="#fbf6ec" opacity="0.3" />
          <ellipse cx="980" cy="470" rx="440" ry="30" fill="#fbf6ec" opacity="0.22" />
          <ellipse cx="700" cy="392" rx="300" ry="20" fill="#fbf6ec" opacity="0.18" />
        </g>
        <path d={paths.far} fill="#3f5a63" opacity="0.55" />
        <path d={paths.mid} fill="#243f48" opacity="0.85" />
        <path d={paths.island} fill="#12262d" />
        <rect
          x="0"
          y={WATERLINE}
          width={WIDTH}
          height={HEIGHT - WATERLINE}
          fill="url(#lol-sea)"
        />
        <g className={styles.shimmer} opacity="0.5">
          <line x1="120" y1={WATERLINE + 40} x2="520" y2={WATERLINE + 40} />
          <line x1="700" y1={WATERLINE + 70} x2="1180" y2={WATERLINE + 70} />
          <line x1="300" y1={WATERLINE + 110} x2="900" y2={WATERLINE + 110} />
        </g>
        <line
          x1="0"
          y1={WATERLINE}
          x2={WIDTH}
          y2={WATERLINE}
          className={styles.waterline}
          filter="url(#lol-glow)"
        />
        <rect width={WIDTH} height={HEIGHT} filter="url(#lol-grain)" opacity="0.06" />
        <rect width={WIDTH} height={HEIGHT} fill="url(#lol-vignette)" />
      </svg>

      <div className={styles.flora}>
        <img className={styles.palmLarge} src="/assets/palm-tree.png" alt="" />
        <img className={styles.palmSmall} src="/assets/palm-tree.png" alt="" />
      </div>
    </div>
  );
}

function ridgePath(points) {
  const draw = line().curve(curveCatmullRom.alpha(0.5));
  return `${draw(points)}L${points.at(-1)[0]},${HEIGHT} L${points[0][0]},${HEIGHT} Z`;
}

function interpolateScene(p) {
  const leftIndex = skyStops.findLastIndex((stop) => stop.p <= p);
  const left = skyStops[Math.max(0, leftIndex)];
  const right = skyStops[Math.min(skyStops.length - 1, leftIndex + 1)];
  const local = right.p === left.p ? 0 : (p - left.p) / (right.p - left.p);

  return {
    top: mixHex(left.top, right.top, local),
    mid: mixHex(left.mid, right.mid, local),
    hor: mixHex(left.hor, right.hor, local),
    sea: mixHex(left.sea, right.sea, local),
  };
}

function sunPosition(p) {
  const t = clamp(p, 0, 1);
  return {
    x: 120 + t * 1200,
    y: 548 - Math.sin(t * Math.PI) * 390,
    fill: mixHex("#f7d9b0", "#ff9f6b", t),
  };
}

function mixHex(a, b, t) {
  return interpolateRgb(a, b)(t);
}

function seeded(seed) {
  const n = Math.sin(seed) * 10000;
  return n - Math.floor(n);
}
