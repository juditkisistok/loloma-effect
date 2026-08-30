import { format } from "d3";
import { useRef, useState } from "react";
import { lolomaHour } from "../data/lolomaHour";
import { useNearViewport } from "../hooks/useNearViewport";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
import visualizationStyles from "../styles/visualization.module.css";
import styles from "./LolomaHour.module.css";

const formatWhole = format(",");
const formatOutcome = (value) =>
  Number.isInteger(value) ? formatWhole(value) : format(",.2f")(value);
const assetUrl = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
const tileImages = {
  rubbish: assetUrl("blue-cleanup-bucket.webp"),
  corals: assetUrl("soft-coral-pink.webp"),
  mangroves: assetUrl("mature-mangrove.webp"),
  trees: assetUrl("coastal-tree-cluster.webp"),
};
const targetMultiple =
  lolomaHour.yearOne.hours / lolomaHour.launch.firstYearTargetHours;
const activityColors = {
  wildlife: "#0f877c",
  reef: "#e06f5f",
  community: "#bf8739",
  coastline: "#4f7f8f",
};
const targetRadii = [50, 64, 78, 92];
const ringCapacity = lolomaHour.launch.firstYearTargetHours;
const activityRanges = lolomaHour.yearOne.activityHours.map(
  (activity, index, activities) => {
    const start = activities
      .slice(0, index)
      .reduce((sum, item) => sum + item.value, 0);
    return { ...activity, start, end: start + activity.value };
  },
);
const activityArcTrim = 8.5;

function describeArc(radius, startShare, endShare) {
  const startAngle = -Math.PI / 2 + startShare * Math.PI * 2;
  const endAngle = -Math.PI / 2 + endShare * Math.PI * 2;
  const startX = Math.cos(startAngle) * radius;
  const startY = Math.sin(startAngle) * radius;
  const endX = Math.cos(endAngle) * radius;
  const endY = Math.sin(endAngle) * radius;
  const largeArc = endShare - startShare > 0.5 ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
}

export function LolomaHour() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeActivityId, setActiveActivityId] = useState(null);
  const loadOutcomeImages = useNearViewport(ref);

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
  const activeActivity = lolomaHour.yearOne.activityHours.find(
    (activity) => activity.id === activeActivityId,
  );
  const visibleActivityHours = lolomaHour.yearOne.hours * ringReveal;
  const summarySceneOpacity = 1 - clamp((progress - 0.49) / 0.03, 0, 1);
  const resultsSceneOpacity = clamp((progress - 0.47) / 0.03, 0, 1);
  const mobileCaptionOpacity = clamp((progress - 0.6) / 0.12, 0, 1);

  return (
    <figure
      id="loloma-hour-chart"
      className={`${visualizationStyles.scrollFigure} ${styles.figure}`}
      ref={ref}
      aria-label={`${formatWhole(lolomaHour.yearOne.hours)} hours contributed, ${targetMultiple.toFixed(1)} times the first-year target, across ${formatWhole(lolomaHour.yearOne.sessions)} sessions at ${lolomaHour.yearOne.properties} properties. Reported outcomes are separate totals: ${lolomaHour.yearOne.outcomes.map((outcome) => `${formatOutcome(outcome.value)} ${outcome.label}`).join("; ")}.`}
    >
      <div className={visualizationStyles.stickyCenter}>
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
                aria-label={`${formatWhole(lolomaHour.yearOne.hours)} hours filled three complete ${formatWhole(lolomaHour.launch.firstYearTargetHours)}-hour rings and almost half of a fourth. Hover or focus the activity labels to compare ${lolomaHour.yearOne.activityHours.map((activity) => `${formatWhole(activity.value)} ${activity.label.toLowerCase()} hours`).join(", ")}.`}
              >
                <g transform="translate(125 112)">
                  {targetRadii.map((radius, index) => {
                    const circumference = 2 * Math.PI * radius;
                    const ringStart = index * ringCapacity;
                    const ringEnd = ringStart + ringCapacity;
                    return (
                      <g key={radius}>
                        <circle className={styles.orbitTrack} r={radius} />
                        {activityRanges.map((activity) => {
                          const segmentStart = Math.max(activity.start, ringStart);
                          const segmentEnd = Math.min(
                            activity.end,
                            ringEnd,
                            visibleActivityHours,
                          );
                          if (segmentEnd <= segmentStart) return null;

                          const startShare = (segmentStart - ringStart) / ringCapacity;
                          const share = (segmentEnd - segmentStart) / ringCapacity;
                          const startInset = activityArcTrim / 2;
                          const endInset = activityArcTrim / 2;
                          const segmentLength = Math.max(
                            0,
                            share * circumference - startInset - endInset,
                          );
                          const renderedStartShare =
                            startShare + startInset / circumference;
                          const renderedEndShare =
                            renderedStartShare + segmentLength / circumference;
                          return (
                            <path
                              className={styles.activityArc}
                              key={activity.id}
                              d={describeArc(
                                radius,
                                renderedStartShare,
                                renderedEndShare,
                              )}
                              style={{
                                "--activity-color": activityColors[activity.id],
                                "--activity-opacity":
                                  activeActivity && activeActivity.id !== activity.id
                                    ? 0.16
                                    : 1,
                              }}
                              aria-hidden="true"
                              onMouseEnter={() => setActiveActivityId(activity.id)}
                              onMouseLeave={() => setActiveActivityId(null)}
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
                <text
                  className={`${styles.orbitValue} ${activeActivity ? styles.orbitValueDetail : ""}`}
                  x="125"
                  y={activeActivity ? "111" : "116"}
                  textAnchor="middle"
                >
                  {activeActivity
                    ? formatWhole(activeActivity.value)
                    : `${displayedMultiple.toFixed(1)}×`}
                </text>
                <text
                  className={`${styles.orbitLabel} ${activeActivity ? styles.orbitLabelDetail : ""}`}
                  x="125"
                  y={activeActivity ? "126" : "132"}
                  textAnchor="middle"
                >
                  {activeActivity ? `${activeActivity.label.toUpperCase()} HOURS` : "TARGET"}
                </text>
                {activeActivity && (
                  <text className={styles.orbitContext} x="125" y="137" textAnchor="middle">
                    {((activeActivity.value / lolomaHour.yearOne.hours) * 100).toFixed(1)}% OF TOTAL
                  </text>
                )}
                <text className={styles.orbitUnit} x="125" y="231" textAnchor="middle">
                  EACH RING = {formatWhole(lolomaHour.launch.firstYearTargetHours)} HOURS
                </text>
              </svg>
              <div className={styles.activityLegend} style={{ opacity: detailReveal }}>
                {lolomaHour.yearOne.activityHours.map((activity) => (
                  <button
                    type="button"
                    key={activity.id}
                    aria-pressed={activeActivityId === activity.id}
                    title={`${activity.label}: ${formatWhole(activity.value)} hours, ${((activity.value / lolomaHour.yearOne.hours) * 100).toFixed(1)}% of the total`}
                    style={{ "--activity-color": activityColors[activity.id] }}
                    onMouseEnter={() => setActiveActivityId(activity.id)}
                    onMouseLeave={() => setActiveActivityId(null)}
                    onFocus={() => setActiveActivityId(activity.id)}
                    onBlur={() => setActiveActivityId(null)}
                    onClick={() => setActiveActivityId(activity.id)}
                  >
                    <i />
                    <span>{activity.label}</span>
                    <strong>{formatWhole(activity.value)}</strong>
                  </button>
                ))}
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
                    <OutcomeImage id={outcome.id} enabled={loadOutcomeImages} />
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
          community and coastline activities, and reports the programme
          outcomes shown here.
          Source:{" "}
          <a href={lolomaHour.source.url} target="_blank" rel="noreferrer">
            {lolomaHour.source.title}
          </a>, {lolomaHour.source.date}.
        </figcaption>
      </div>
    </figure>
  );
}

function OutcomeImage({ id, enabled }) {
  return (
    <div className={styles.outcomeImage} data-outcome={id} aria-hidden="true">
      {enabled && (
        <img
          src={tileImages[id]}
          alt=""
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      )}
    </div>
  );
}
