import { format } from "d3";
import { useRef, useState } from "react";
import { lolomaHour } from "../data/lolomaHour";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
import styles from "./LolomaHour.module.css";

const formatWhole = format(",");
const formatOutcome = (value) =>
  Number.isInteger(value) ? formatWhole(value) : format(",.2f")(value);
const tileImages = {
  rubbish: "/assets/blue-cleanup-bucket.png",
  corals: "/assets/soft-coral-pink.png",
  mangroves: "/assets/mature-mangrove.png",
  trees: "/assets/coastal-tree-cluster.png",
};
const targetMultiple =
  lolomaHour.yearOne.hours / lolomaHour.launch.firstYearTargetHours;
const targetRadii = [50, 64, 78, 92];

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
    const next = stickyFigureProgress(el, {
      desktopTop: 0,
      mobileTop: 0,
    });
    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  const countReveal = clamp(progress / 0.4, 0, 1);
  const displayedHours = Math.round(lolomaHour.yearOne.hours * countReveal);
  const detailReveal = clamp((progress - 0.32) / 0.18, 0, 1);
  const ringReveal = clamp(progress / 0.85, 0, 1);
  const displayedMultiple = targetMultiple * ringReveal;
  const summarySceneOpacity = 1 - clamp((progress - 0.38) / 0.08, 0, 1);
  const resultsSceneOpacity = clamp((progress - 0.46) / 0.1, 0, 1);
  const mobileCaptionOpacity = clamp((progress - 0.58) / 0.12, 0, 1);

  return (
    <figure
      className={styles.figure}
      ref={ref}
      aria-label={`${formatWhole(lolomaHour.yearOne.hours)} hours contributed, ${targetMultiple.toFixed(1)} times the first-year target, across ${formatWhole(lolomaHour.yearOne.sessions)} sessions at ${lolomaHour.yearOne.properties} properties. Reported outcomes are separate totals: ${lolomaHour.yearOne.outcomes.map((outcome) => `${formatOutcome(outcome.value)} ${outcome.label}`).join("; ")}.`}
    >
      <div className={styles.sticky}>
        <header className={styles.header}>
          <h3>What 17,407 hours looked like</h3>
          <p>Loloma Hour · {lolomaHour.yearOne.period}</p>
        </header>

        <div className={styles.contentGrid}>
          <div
            className={styles.summaryColumn}
            style={{ "--mobile-scene-opacity": summarySceneOpacity }}
          >
            <div className={styles.metric}>
              <strong>{formatWhole(displayedHours)}</strong>
              <span>HOURS CONTRIBUTED</span>
              <small style={{ opacity: detailReveal }}>
                {formatWhole(lolomaHour.yearOne.sessions)} sessions across {lolomaHour.yearOne.properties} properties
              </small>
            </div>
            <div className={styles.targetOrbit}>
              <svg
                className={styles.orbitChart}
                viewBox="0 0 250 238"
                role="img"
                aria-label={`${formatWhole(lolomaHour.yearOne.hours)} hours filled three complete ${formatWhole(lolomaHour.launch.firstYearTargetHours)}-hour rings and almost half of a fourth.`}
              >
                <g transform="translate(125 112)">
                  {targetRadii.map((radius, index) => {
                    const circumference = 2 * Math.PI * radius;
                    const ringProgress = clamp(displayedMultiple - index, 0, 1);
                    const strokeProgress =
                      ringProgress >= 0.999
                        ? {}
                        : {
                            strokeDasharray: `${circumference * ringProgress} ${circumference}`,
                            strokeDashoffset: 0,
                          };
                    return (
                      <g key={radius}>
                        <circle className={styles.orbitTrack} r={radius} />
                        <circle
                          className={index === 0 ? styles.orbitTarget : styles.orbitBeyond}
                          r={radius}
                          opacity={ringProgress > 0.001 ? 1 : 0}
                          {...strokeProgress}
                        />
                      </g>
                    );
                  })}
                </g>
                <text className={styles.orbitValue} x="125" y="120" textAnchor="middle">
                  {displayedMultiple.toFixed(1)}×
                </text>
                <text className={styles.orbitLabel} x="125" y="134" textAnchor="middle">
                  TARGET
                </text>
                <text className={styles.orbitUnit} x="125" y="231" textAnchor="middle">
                  EACH RING = {formatWhole(lolomaHour.launch.firstYearTargetHours)} HOURS
                </text>
              </svg>
              <div className={styles.orbitLegend} style={{ opacity: detailReveal }}>
                <span><i className={styles.targetKey} />first-year target</span>
                <span><i className={styles.beyondKey} />+{formatWhole(lolomaHour.yearOne.hours - lolomaHour.launch.firstYearTargetHours)} hours beyond</span>
              </div>
            </div>
          </div>

          <div
            className={styles.resultsColumn}
            style={{ "--mobile-scene-opacity": resultsSceneOpacity }}
          >
            <div className={styles.outcomesHeading}><span>REPORTED OUTCOMES</span><i /></div>
            <div className={styles.outcomes}>
              {lolomaHour.yearOne.outcomes.map((outcome, index) => {
                const reveal = clamp((progress - (0.1 + index * 0.08)) / 0.22, 0, 1);
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
          </div>
        </div>

        <figcaption
          className={styles.caption}
          style={{ "--mobile-caption-opacity": mobileCaptionOpacity }}
        >
          Tourism Fiji divides the 17,407 hours among wildlife, reef,
          community and coastline activities. The four outcomes shown here
          are reported separately, without an hours-per-outcome breakdown.
          Source:{" "}
          <a href={lolomaHour.source.url} target="_blank" rel="noreferrer">
            {lolomaHour.source.title}
          </a>, {lolomaHour.source.date}.
        </figcaption>
      </div>
    </figure>
  );
}

function OutcomeImage({ id }) {
  return (
    <div className={styles.outcomeImage} data-outcome={id} aria-hidden="true">
      <img src={tileImages[id]} alt="" />
    </div>
  );
}
