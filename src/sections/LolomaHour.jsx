import { format } from "d3";
import { useRef, useState } from "react";
import { lolomaHour } from "../data/lolomaHour";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./LolomaHour.module.css";

const formatWhole = format(",");
const formatOutcome = (value) =>
  Number.isInteger(value) ? formatWhole(value) : format(",.2f")(value);
const tileImages = {
  corals: "/assets/branching-coral-a.png",
  mangroves: "/assets/mangrove-sapling.png",
  trees: "/assets/monstera-leaf-cluster.png",
};
const targetMultiple =
  lolomaHour.yearOne.hours / lolomaHour.launch.firstYearTargetHours;
const gaugeMax = 20000;

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
  const detailReveal = clamp((progress - 0.32) / 0.18, 0, 1);
  const targetShare = (lolomaHour.launch.firstYearTargetHours / gaugeMax) * 100;
  const fillShare = (displayedHours / gaugeMax) * 100;
  const targetWithinFill = Math.min(
    100,
    (targetShare / Math.max(fillShare, 0.001)) * 100,
  );

  return (
    <figure
      className={styles.figure}
      ref={ref}
      aria-label={`${formatWhole(lolomaHour.yearOne.hours)} volunteer hours, ${targetMultiple.toFixed(1)} times the first-year target, across ${formatWhole(lolomaHour.yearOne.sessions)} sessions at ${lolomaHour.yearOne.properties} properties. Reported outcomes are separate totals: ${lolomaHour.yearOne.outcomes.map((outcome) => `${formatOutcome(outcome.value)} ${outcome.label}`).join("; ")}.`}
    >
      <header className={styles.header}>
        <h3>What 17,407 volunteer hours looked like</h3>
        <p>Loloma Hour · {lolomaHour.yearOne.period}</p>
      </header>

      <div className={styles.hero}>
        <div className={styles.metric}>
          <strong>{formatWhole(displayedHours)}</strong>
          <span>VOLUNTEER HOURS</span>
          <small style={{ opacity: detailReveal }}>
            {formatWhole(lolomaHour.yearOne.sessions)} sessions · {lolomaHour.yearOne.properties} properties
          </small>
        </div>
        <div className={styles.metricSecondary}>
          <strong>{targetMultiple.toFixed(1)}×</strong>
          <span>THE FIRST-YEAR TARGET</span>
          <small style={{ opacity: detailReveal }}>
            target · {formatWhole(lolomaHour.launch.firstYearTargetHours)} hours
          </small>
        </div>
      </div>

      <div className={styles.gauge} aria-label={`${formatWhole(lolomaHour.yearOne.hours)} hours against a first-year target of ${formatWhole(lolomaHour.launch.firstYearTargetHours)} hours.`} role="img">
        <div className={styles.gaugeTrack}>
          <div className={styles.gaugeFill} style={{ width: `${fillShare}%` }}>
            <span className={styles.targetFill} style={{ width: `${targetWithinFill}%` }} />
            <span className={styles.beyondFill} />
          </div>
          <i className={styles.targetMarker} style={{ left: `${targetShare}%` }} />
        </div>
        <div className={styles.gaugeNotes}>
          <span style={{ left: `${targetShare}%` }}>{formatWhole(lolomaHour.launch.firstYearTargetHours)} h target</span>
          <strong>+{formatWhole(lolomaHour.yearOne.hours - lolomaHour.launch.firstYearTargetHours)} hours beyond target</strong>
        </div>
      </div>

      <div className={styles.outcomesHeading}><span>REPORTED OUTCOMES</span><i /></div>
      <div className={styles.outcomes}>
        {lolomaHour.yearOne.outcomes.map((outcome, index) => {
          const reveal = clamp((progress - (0.46 + index * 0.08)) / 0.16, 0, 1);
          return (
            <div
              className={styles.outcome}
              key={outcome.id}
              style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 10}px)` }}
            >
              <OutcomeImage id={outcome.id} />
              <strong>{formatOutcome(outcome.value)}</strong>
              <span>{outcome.label}</span>
            </div>
          );
        })}
      </div>

      <figcaption className={styles.caption}>
        Reported outcomes are parallel totals, not conversions from volunteer
        hours; activities require different amounts of labour. Source:{" "}
        <a href={lolomaHour.source.url} target="_blank" rel="noreferrer">
          {lolomaHour.source.title}
        </a>, {lolomaHour.source.date}.
      </figcaption>
    </figure>
  );
}

function OutcomeImage({ id }) {
  if (id === "rubbish") {
    return (
      <div className={styles.outcomeImage} aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <path d="M22 25h20l-2 25c-5 4-11 4-16 0l-2-25Zm4 0v-7c4-4 8-4 12 0v7" />
        </svg>
      </div>
    );
  }
  return (
    <div className={styles.outcomeImage} aria-hidden="true">
      <img src={tileImages[id]} alt="" />
    </div>
  );
}
