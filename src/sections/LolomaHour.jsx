import { format } from "d3";
import { useRef, useState } from "react";
import { lolomaHour } from "../data/lolomaHour";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./LolomaHour.module.css";

const width = 1000;
const height = 440;
const formatWhole = format(",");
const formatOutcome = (value) => (Number.isInteger(value) ? formatWhole(value) : format(",.2f")(value));
const gauge = { x: 70, y: 224, width: 860, height: 20, maxHours: 20000 };
const outcomeCenters = [175, 390, 610, 825];
const tileImages = {
  corals: "/assets/branching-coral-a.png",
  mangroves: "/assets/mangrove-sapling.png",
  trees: "/assets/monstera-leaf-cluster.png",
};
const targetMultiple =
  lolomaHour.yearOne.hours / lolomaHour.launch.firstYearTargetHours;

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
  const displayedHours = Math.round(lolomaHour.yearOne.hours * countReveal);
  const sessionsReveal = clamp((progress - 0.36) / 0.14, 0, 1);
  const tileReveals = lolomaHour.yearOne.outcomes.map((_, index) =>
    clamp((progress - (0.48 + index * 0.1)) / 0.14, 0, 1),
  );
  const targetHours = lolomaHour.launch.firstYearTargetHours;
  const actualFillWidth =
    gauge.width * (Math.min(displayedHours, gauge.maxHours) / gauge.maxHours);
  const targetX = gauge.x + gauge.width * (targetHours / gauge.maxHours);
  const finalActualX =
    gauge.x + gauge.width * (lolomaHour.yearOne.hours / gauge.maxHours);

  return (
    <figure className={styles.figure} ref={ref}>
      <div className={styles.scrollWrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${formatWhole(lolomaHour.yearOne.hours)} hours volunteered by Loloma Hour participants, ${targetMultiple.toFixed(1)} times the first-year target, across ${formatWhole(lolomaHour.yearOne.sessions)} sessions and ${lolomaHour.yearOne.properties} properties. Tourism Fiji's reported results for ${lolomaHour.yearOne.period}. Reported outcomes, kept as separate totals rather than a single conversion: ${lolomaHour.yearOne.outcomes.map((outcome) => `${formatOutcome(outcome.value)} ${outcome.label}`).join("; ")}.`}
      >
        <defs>
          <clipPath id="loloma-gauge-fill">
            <rect
              x={gauge.x}
              y={gauge.y}
              width={actualFillWidth}
              height={gauge.height}
              rx={gauge.height / 2}
            />
          </clipPath>
        </defs>

        <g className={styles.chartHeader}>
          <text x="70" y="40">
            Visitors volunteered {targetMultiple.toFixed(1)}× the first-year target
          </text>
          <text x="70" y="60">
            Loloma Hour, {lolomaHour.yearOne.period}
          </text>
        </g>

        <g className={styles.counter}>
          <text className={styles.bigNumber} x="70" y="154">
            {formatWhole(displayedHours)}
          </text>
          <text className={styles.counterCaption} x="70" y="179">
            VOLUNTEER HOURS
          </text>
          <text
            className={styles.sessionsNote}
            x="70"
            y="201"
            opacity={sessionsReveal}
          >
            {formatWhole(lolomaHour.yearOne.sessions)} sessions · {lolomaHour.yearOne.properties} properties
          </text>
          <line className={styles.heroDivider} x1="500" x2="500" y1="104" y2="202" />
          <text className={styles.multiple} x="570" y="154">
            {targetMultiple.toFixed(1)}×
          </text>
          <text className={styles.multipleLabel} x="570" y="179">
            OF THE FIRST-YEAR TARGET
          </text>
          <text className={styles.sessionsNote} x="570" y="201" opacity={sessionsReveal}>
            target set at {formatWhole(targetHours)} hours
          </text>
        </g>

        <g className={styles.gauge}>
          <rect
            className={styles.gaugeTrack}
            x={gauge.x}
            y={gauge.y}
            width={gauge.width}
            height={gauge.height}
            rx={gauge.height / 2}
          />
          <g clipPath="url(#loloma-gauge-fill)">
            <rect
              className={styles.targetFill}
              x={gauge.x}
              y={gauge.y}
              width={targetX - gauge.x}
              height={gauge.height}
            />
            <rect
              className={styles.beyondFill}
              x={targetX}
              y={gauge.y}
              width={gauge.x + gauge.width - targetX}
              height={gauge.height}
            />
          </g>
          {[1, 2, 3].map((multiple) => {
            const x = gauge.x + gauge.width * multiple * 0.25;
            return (
              <line
                key={multiple}
                className={styles.gaugeDivider}
                x1={x}
                x2={x}
                y1={gauge.y - 4}
                y2={gauge.y + gauge.height + 4}
              />
            );
          })}
          <text
            className={`${styles.gaugeLabel} ${styles.targetGaugeLabel}`}
            x={(gauge.x + targetX) / 2}
            y={gauge.y + 14}
            textAnchor="middle"
            opacity={sessionsReveal}
          >
            {formatWhole(targetHours)} H TARGET
          </text>
          <text
            className={`${styles.gaugeLabel} ${styles.beyondGaugeLabel}`}
            x={(targetX + finalActualX) / 2}
            y={gauge.y + 14}
            textAnchor="middle"
            opacity={sessionsReveal}
          >
            +{formatWhole(lolomaHour.yearOne.hours - targetHours)} H BEYOND TARGET
          </text>
        </g>

        <g className={styles.outcomesHeader} opacity={sessionsReveal}>
          <text x="70" y="292">REPORTED OUTCOMES</text>
          <line x1="214" x2="930" y1="287" y2="287" />
        </g>

        <g className={styles.outcomes}>
          {lolomaHour.yearOne.outcomes.map((outcome, index) => (
            <g
              key={outcome.id}
              transform={`translate(${outcomeCenters[index]} 350) translate(0 ${(1 - tileReveals[index]) * 12})`}
              opacity={tileReveals[index]}
            >
              <OutcomeImage id={outcome.id} />
              <text className={styles.tileValue} textAnchor="middle" y="40">
                {formatOutcome(outcome.value)}
              </text>
              <text className={styles.tileLabel} textAnchor="middle" y="62">
                {outcome.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
      </div>
      <p className={styles.scrollHint}>Scroll for full chart →</p>
      <figcaption className={styles.caption}>
        Reported outcomes are parallel totals, not conversions from volunteer hours;
        activities require different amounts of labour. Source:{" "}
        <a href={lolomaHour.source.url} target="_blank" rel="noreferrer">
          {lolomaHour.source.title}
        </a>
        , {lolomaHour.source.date}.
      </figcaption>
    </figure>
  );
}

function OutcomeImage({ id }) {
  if (id === "rubbish") {
    return (
      <g className={styles.tileIcon}>
        <circle className={styles.iconBackdrop} cx="0" cy="-8" r="30" />
        <path d="M-8,-9 L8,-9 L6,11 Q0,15 -6,11 Z M-5,-9 L-5,-14 Q0,-18 5,-14 L5,-9" />
      </g>
    );
  }

  return (
    <g className={styles.tileIcon} aria-hidden="true">
      <circle className={styles.iconBackdrop} cx="0" cy="-8" r="30" />
      <image
        href={tileImages[id]}
        x="-26"
        y="-36"
        width="52"
        height="52"
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}
