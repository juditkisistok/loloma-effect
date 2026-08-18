import { format } from "d3";
import { useRef, useState } from "react";
import { lolomaHour } from "../data/lolomaHour";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./LolomaHour.module.css";

const width = 1000;
const height = 420;
const formatWhole = format(",");

const tileIcons = {
  rubbish: (
    <path d="M-8,-10 L8,-10 L6,12 Q0,16 -6,12 Z M-5,-10 L-5,-15 Q0,-19 5,-15 L5,-10" />
  ),
  corals: (
    <path d="M0,14 L0,-2 M0,-2 L-9,-14 M0,-2 L0,-16 M0,-2 L9,-14 M-9,-14 L-9,-18 M0,-16 L0,-20 M9,-14 L9,-18" />
  ),
  mangroves: (
    <path d="M0,-14 L0,4 M0,4 L-10,16 M0,4 L0,16 M0,4 L10,16 M-10,16 L-13,20 M0,16 L0,20 M10,16 L13,20" />
  ),
  trees: (
    <path d="M0,16 L0,4 M-11,4 L11,4 L0,-16 Z" />
  ),
};

const tileOffsets = [-330, -110, 110, 330];

export function LolomaHour() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);

  useFrame((frame) => {
    const el = ref.current;
    if (!el) return;
    if (frame.reduced) {
      setProgress(1);
      return;
    }

    const rect = el.getBoundingClientRect();
    const start = window.innerHeight * 0.92;
    const end = window.innerHeight * 0.12;
    const next = clamp((start - rect.top) / (start - end), 0, 1);

    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  const countReveal = clamp(progress / 0.4, 0, 1);
  const displayedHours = Math.round(1 + (lolomaHour.firstQuarter.hours - 1) * countReveal);
  const sessionsReveal = clamp((progress - 0.36) / 0.14, 0, 1);
  const tileReveals = lolomaHour.firstQuarter.outcomes.map((_, index) =>
    clamp((progress - (0.48 + index * 0.1)) / 0.14, 0, 1),
  );

  return (
    <figure className={styles.figure} ref={ref}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${formatWhole(lolomaHour.firstQuarter.hours)} hours volunteered by Loloma Hour participants across ${lolomaHour.firstQuarter.sessions} sessions in the programme's first three reported months. Reported outcomes, kept as separate totals rather than a single conversion: ${lolomaHour.firstQuarter.outcomes.map((outcome) => `${formatWhole(outcome.value)} ${outcome.label}`).join("; ")}.`}
      >
        <g className={styles.chartHeader}>
          <text x="70" y="40">
            What 3,540 hours looked like
          </text>
          <text x="70" y="60">
            The first three reported months of Loloma Hour
          </text>
        </g>

        <g className={styles.counter} transform={`translate(${width / 2} 150)`}>
          <text className={styles.bigNumber} textAnchor="middle" y="0">
            {formatWhole(displayedHours)}
          </text>
          <text className={styles.counterCaption} textAnchor="middle" y="26">
            hours volunteered, first three months
          </text>
          <text
            className={styles.sessionsNote}
            textAnchor="middle"
            y="48"
            opacity={sessionsReveal}
          >
            across {lolomaHour.firstQuarter.sessions} reported sessions
          </text>
        </g>

        <g className={styles.tiles}>
          {lolomaHour.firstQuarter.outcomes.map((outcome, index) => (
            <g
              key={outcome.id}
              transform={`translate(${width / 2 + tileOffsets[index]} 280) translate(0 ${(1 - tileReveals[index]) * 14})`}
              opacity={tileReveals[index]}
            >
              <g className={styles.tileIcon}>{tileIcons[outcome.id]}</g>
              <text className={styles.tileValue} textAnchor="middle" y="46">
                {formatWhole(outcome.value)}
              </text>
              <TileLabel label={outcome.label} />
            </g>
          ))}
        </g>
      </svg>
      <figcaption className={styles.caption}>
        Kept as parallel outcomes, not a conversion from hours: different
        activities require different amounts of labour. Source: published
        first-three-month Loloma Hour results reported by{" "}
        {lolomaHour.source.title}, {lolomaHour.source.date}.
      </figcaption>
    </figure>
  );
}

function TileLabel({ label }) {
  const words = label.split(" ");
  const midpoint = Math.ceil(words.length / 2);
  const lines = [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];

  return (
    <text className={styles.tileLabel} textAnchor="middle" y="68">
      {lines.map((line, index) => (
        <tspan key={line} x="0" dy={index === 0 ? 0 : 16}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
