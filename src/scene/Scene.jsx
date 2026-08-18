import { curveCatmullRom, line } from "d3";
import { useMemo, useState } from "react";
import { dawnTheme, interpolateSky } from "./sceneThemes";
import { useFrame } from "../scroll/stageContext";
import styles from "./Scene.module.css";

const WIDTH = 1440;
const HEIGHT = 900;
const WATERLINE = 540;

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

const coralCollage = [
  {
    src: "coral-seafan-blue.png",
    left: "7%",
    bottom: "3%",
    width: "15vw",
    maxWidth: 230,
    rot: -3,
    opacity: 0.9,
    filter: "saturate(0.82) brightness(0.9) drop-shadow(0 14px 20px rgba(4,14,26,0.55))",
    zIndex: 2,
  },
  {
    src: "coral-staghorn.png",
    left: "14%",
    bottom: "2%",
    width: "12vw",
    maxWidth: 185,
    rot: 2,
    opacity: 0.95,
    filter: "saturate(0.8) brightness(0.86) drop-shadow(0 14px 20px rgba(4,14,26,0.6))",
    zIndex: 3,
  },
  {
    src: "brain-coral.png",
    left: "22%",
    bottom: "1%",
    width: "7vw",
    maxWidth: 104,
    rot: -2,
    opacity: 0.94,
    filter: "saturate(0.7) brightness(0.84) drop-shadow(0 12px 18px rgba(4,14,26,0.6))",
    zIndex: 4,
  },
  {
    src: "sea-fan-coral.png",
    left: "73%",
    bottom: "6%",
    width: "11vw",
    maxWidth: 168,
    rot: -2,
    opacity: 0.86,
    filter: "saturate(0.62) brightness(0.82) drop-shadow(0 12px 18px rgba(4,14,26,0.5))",
    zIndex: 1,
  },
  {
    src: "branching-coral-a.png",
    left: "78%",
    bottom: "2%",
    width: "14vw",
    maxWidth: 212,
    rot: 3,
    opacity: 0.95,
    filter: "saturate(0.62) brightness(0.84) drop-shadow(0 14px 20px rgba(4,14,26,0.6))",
    zIndex: 3,
  },
];

export function Scene({
  theme = dawnTheme,
  toneStart = "hero",
  toneEnd = "impasse",
  idPrefix = "lol",
  corals = false,
  coralsOn = false,
  lights = false,
  lightsOn = false,
  lightsClimb = 0,
}) {
  const paths = useMemo(
    () => ({
      far: ridgePath(farRidge),
      mid: ridgePath(midRidge),
      island: ridgePath(islandRidge),
    }),
    [],
  );
  const [tone, setTone] = useState(0);
  const color = interpolateSky(theme.skyStops, tone);
  const sun = theme.sunPosition(tone);
  const starsOpacity = theme.starsOpacity ? theme.starsOpacity(tone) : 0;

  useFrame((frame) => {
    const nextTone = frame.span(toneStart, toneEnd);
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
          <linearGradient id={`${idPrefix}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.top} />
            <stop offset="55%" stopColor={color.mid} />
            <stop offset="100%" stopColor={color.hor} />
          </linearGradient>
          <linearGradient id={`${idPrefix}-sea`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.sea} />
            <stop offset="100%" stopColor="#081f33" />
          </linearGradient>
          <filter id={`${idPrefix}-grain`}>
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
          <filter id={`${idPrefix}-mist`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id={`${idPrefix}-glow`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`${idPrefix}-vignette`} cx="50%" cy="46%" r="72%">
            <stop offset="62%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#04101c" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill={`url(#${idPrefix}-sky)`} />
        <g className={styles.stars} opacity={starsOpacity}>
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
          opacity={sun.opacity ?? 0.9}
        />
        <g className={styles.mist} filter={`url(#${idPrefix}-mist)`} opacity={0.5 - tone * 0.32}>
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
          fill={`url(#${idPrefix}-sea)`}
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
          filter={`url(#${idPrefix}-glow)`}
        />
        {lights && (
          <g className={styles.lights} opacity={lightsOn ? 1 : 0}>
            <g
              transform={`translate(${(-26 * lightsClimb).toFixed(1)}, ${(-62 * lightsClimb).toFixed(1)})`}
            >
              <circle cx="690" cy="470" r="9" fill="#ffcf8a" filter={`url(#${idPrefix}-glow)`} />
              <circle cx="690" cy="470" r="2.6" fill="#fff2d6" />
              <circle cx="775" cy="486" r="8" fill="#ffbd7a" filter={`url(#${idPrefix}-glow)`} />
              <circle cx="775" cy="486" r="2.4" fill="#fff2d6" />
            </g>
          </g>
        )}
        <rect width={WIDTH} height={HEIGHT} filter={`url(#${idPrefix}-grain)`} opacity="0.06" />
        <rect width={WIDTH} height={HEIGHT} fill={`url(#${idPrefix}-vignette)`} />
      </svg>

      <div className={styles.flora}>
        <img className={styles.palmLarge} src="/assets/palm-tree.png" alt="" />
        <img className={styles.palmSmall} src="/assets/palm-tree.png" alt="" />
      </div>

      {corals && (
        <div className={styles.collage} style={{ opacity: coralsOn ? 0.92 : 0 }}>
          {coralCollage.map((item) => (
            <img
              key={item.src}
              className={styles.collageImg}
              src={`/assets/${item.src}`}
              alt=""
              style={{
                left: item.left,
                bottom: item.bottom,
                width: item.width,
                maxWidth: item.maxWidth,
                zIndex: item.zIndex,
                opacity: coralsOn ? item.opacity : 0,
                transform: coralsOn
                  ? `rotate(${item.rot}deg)`
                  : `translateY(16px) rotate(${item.rot}deg)`,
                filter: item.filter,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ridgePath(points) {
  const draw = line().curve(curveCatmullRom.alpha(0.5));
  return `${draw(points)}L${points.at(-1)[0]},${HEIGHT} L${points[0][0]},${HEIGHT} Z`;
}

function seeded(seed) {
  const n = Math.sin(seed) * 10000;
  return n - Math.floor(n);
}
