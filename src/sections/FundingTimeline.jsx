import { scaleLinear } from "d3";
import { useRef, useState } from "react";
import { nabavatuGapFjd, relocationFunding } from "../data/relocationFunding";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import styles from "./FundingTimeline.module.css";

const width = 1000;
const height = 460;
const margin = { left: 70, right: 60 };
const axisY = 380;
const barBaseY = axisY;
const barTop = 130;

const x = scaleLinear()
  .domain([relocationFunding.timeline.startYear, relocationFunding.timeline.endYear])
  .range([margin.left, width - margin.right]);

const valueScale = scaleLinear()
  .domain([0, 7_000_000])
  .range([barBaseY, barTop]);

function formatMillions(value) {
  return `FJ$${(value / 1_000_000).toFixed(1)}M`;
}

export function FundingTimeline() {
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

  const revenueReveal = clamp(progress / 0.32, 0, 1);
  const breakReveal = clamp((progress - 0.28) / 0.14, 0, 1);
  const neededReveal = clamp((progress - 0.42) / 0.18, 0, 1);
  const committedReveal = clamp((progress - 0.58) / 0.18, 0, 1);
  const gapReveal = clamp((progress - 0.74) / 0.14, 0, 1);
  const contextReveal = clamp((progress - 0.86) / 0.14, 0, 1);

  const bandX0 = x(relocationFunding.levy.launchYear);
  const bandX1 = x(relocationFunding.levy.removedYear);
  const bandFullWidth = bandX1 - bandX0;

  const neededX = x(relocationFunding.nabavatu.approvedYear);
  const committedX = x(relocationFunding.nabavatu.committedYear);
  const neededTopFull = valueScale(relocationFunding.nabavatu.budgetFjd);
  const committedTopFull = valueScale(relocationFunding.nabavatu.committedFjd);
  const neededTop = barBaseY - (barBaseY - neededTopFull) * neededReveal;
  const committedTop = barBaseY - (barBaseY - committedTopFull) * committedReveal;

  return (
    <figure className={styles.figure} ref={ref}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Timeline of Fiji's climate relocation trust fund. In 2019 the fund launched with a projected 3 percent levy contribution of about FJ$5 million a year. The levy was removed in April 2022. In 2024 Nabavatu's relocation was budgeted at FJ$5.9 million; in 2025 the government committed FJ$3.5 million from the trust fund toward it, a shortfall of about ${formatMillions(nabavatuGapFjd)}. For context, six communities have been relocated nationally and 43 are under assessment, though costs are not uniform across villages.`}
      >
        <defs>
          <pattern
            id="funding-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-28)"
          >
            <line x1="0" y1="0" x2="0" y2="8" />
          </pattern>
          <clipPath id="funding-band-reveal">
            <rect
              x={bandX0}
              y="0"
              width={bandFullWidth * revenueReveal}
              height={height}
            />
          </clipPath>
        </defs>

        <g className={styles.chartHeader}>
          <text x={margin.left} y="40">
            How the funding changed
          </text>
          <text x={margin.left} y="60">
            The relocation trust fund's original model, and the cost of one
            village
          </text>
        </g>

        <line
          className={styles.baseline}
          x1={margin.left}
          x2={width - margin.right}
          y1={axisY}
          y2={axisY}
        />

        <g className={styles.ticks}>
          {relocationFunding.timeline.ticks.map((year) => (
            <g key={year} transform={`translate(${x(year)} ${axisY})`}>
              <line y1="0" y2="8" />
              <text y="24">{year}</text>
            </g>
          ))}
        </g>

        <g clipPath="url(#funding-band-reveal)">
          <rect
            className={styles.revenueBand}
            x={bandX0}
            y={axisY - 30}
            width={bandFullWidth}
            height="22"
            rx="11"
          />
          <rect
            className={styles.revenueHatch}
            x={bandX0}
            y={axisY - 30}
            width={bandFullWidth}
            height="22"
            rx="11"
          />
        </g>
        <g
          className={styles.revenueLabel}
          opacity={clamp(revenueReveal / 0.6, 0, 1)}
        >
          <text x={bandX0} y={axisY - 58}>
            {relocationFunding.levy.sharePercent}% of the levy, promised in{" "}
            {relocationFunding.levy.launchYear}
          </text>
          <text x={bandX0} y={axisY - 42}>
            projected {formatMillions(relocationFunding.levy.projectedAnnualFjd)}
            /yr
          </text>
        </g>

        <g
          className={styles.breakMark}
          opacity={breakReveal}
          transform={`translate(${bandX1} ${axisY - 19})`}
        >
          <path d="M-6,-16 L2,-4 L-4,4 L6,16" />
          <text x="12" y="-6">
            Levy removed
          </text>
          <text x="12" y="10">
            {relocationFunding.levy.removedMonth}{" "}
            {relocationFunding.levy.removedYear}
          </text>
        </g>

        <g className={styles.neededBar} opacity={neededReveal}>
          <rect
            x={neededX - 17}
            y={neededTop}
            width="34"
            height={barBaseY - neededTop}
          />
          <text x={neededX} y={neededTop - 26} textAnchor="middle" className={styles.barCaption}>
            Nabavatu, needed
          </text>
          <text x={neededX} y={neededTop - 10} textAnchor="middle">
            {formatMillions(relocationFunding.nabavatu.budgetFjd)}
          </text>
        </g>

        <g className={styles.committedBar} opacity={committedReveal}>
          <rect
            x={committedX - 17}
            y={committedTop}
            width="34"
            height={barBaseY - committedTop}
          />
          <text x={committedX} y={committedTop - 26} textAnchor="middle" className={styles.barCaption}>
            Trust fund, committed
          </text>
          <text x={committedX} y={committedTop - 10} textAnchor="middle">
            {formatMillions(relocationFunding.nabavatu.committedFjd)}
          </text>
        </g>

        <g className={styles.gapBracket} opacity={gapReveal}>
          <line
            x1={neededX + 24}
            x2={neededX + 34}
            y1={neededTopFull}
            y2={neededTopFull}
          />
          <line
            x1={committedX - 24}
            x2={neededX + 34}
            y1={committedTopFull}
            y2={committedTopFull}
          />
          <line
            x1={neededX + 34}
            x2={neededX + 34}
            y1={neededTopFull}
            y2={committedTopFull}
          />
          <text
            x={neededX + 42}
            y={(neededTopFull + committedTopFull) / 2}
            dominantBaseline="middle"
          >
            {formatMillions(nabavatuGapFjd)} short
          </text>
        </g>

        <g
          className={styles.contextLine}
          opacity={contextReveal}
          transform={`translate(${margin.left} ${height - 24})`}
        >
          <text x="0" y="0">
            For context: {relocationFunding.context.relocatedCommunities}{" "}
            communities relocated nationally ·{" "}
            {relocationFunding.context.assessedCommunities} identified for
            assessment since 2021 — costs vary by village, and are not
            multiplied here.
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        Sources: Fiji Prime Minister's Office; Fiji Revenue and Customs
        Service; Fiji Cabinet; Parliament of Fiji.
      </figcaption>
    </figure>
  );
}
