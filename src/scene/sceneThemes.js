import { interpolateRgb } from "d3";
import { clamp } from "../lib/math";

function mixHex(a, b, t) {
  return interpolateRgb(a, b)(t);
}

export function interpolateSky(stops, p) {
  const leftIndex = stops.findLastIndex((stop) => stop.p <= p);
  const left = stops[Math.max(0, leftIndex)];
  const right = stops[Math.min(stops.length - 1, leftIndex + 1)];
  const local = right.p === left.p ? 0 : (p - left.p) / (right.p - left.p);

  return {
    top: mixHex(left.top, right.top, local),
    mid: mixHex(left.mid, right.mid, local),
    hor: mixHex(left.hor, right.hor, local),
    sea: mixHex(left.sea, right.sea, local),
  };
}

const dawnSkyStops = [
  { p: 0, top: "#22344c", mid: "#c78a68", hor: "#f4c9a8", sea: "#2aa495" },
  { p: 0.14, top: "#5f8ea6", mid: "#bcd8dd", hor: "#e6f0ec", sea: "#2aa495" },
  { p: 0.42, top: "#7fb0c4", mid: "#aacdd6", hor: "#d3e7e6", sea: "#2aa495" },
];

export const dawnTheme = {
  skyStops: dawnSkyStops,
  sunPosition(t) {
    return {
      x: 120 + t * 1200,
      y: 548 - Math.sin(t * Math.PI) * 390,
      fill: mixHex("#f7d9b0", "#ff9f6b", t),
      opacity: 0.9,
    };
  },
};

const duskSkyStops = [
  { p: 0, top: "#7fb0c4", mid: "#aacdd6", hor: "#d3e7e6", sea: "#2aa495" },
  { p: 0.55, top: "#3d5570", mid: "#c98a68", hor: "#f4c9a8", sea: "#1c6058" },
  { p: 1, top: "#0b1c2e", mid: "#16283a", hor: "#22344c", sea: "#0a2333" },
];

export const duskTheme = {
  skyStops: duskSkyStops,
  sunPosition(t) {
    const fade = 1 - clamp((t - 0.8) / 0.2, 0, 1);
    return {
      x: 1040 - t * 260,
      y: 220 + t * 340,
      fill: mixHex("#ffd9a0", "#ff6a4a", Math.min(t * 1.3, 1)),
      opacity: 0.92 * fade,
    };
  },
  starsOpacity(t) {
    return clamp((t - 0.55) / 0.35, 0, 1) * 0.85;
  },
};
