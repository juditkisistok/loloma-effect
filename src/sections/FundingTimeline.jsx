import { nabavatuGapFjd, relocationFunding } from "../data/relocationFunding";
import styles from "./FundingTimeline.module.css";

const width = 1000;
const height = 360;
const leftX = 70;
const rightX = 540;
const dividerX = 500;
const panelWidth = 390;
const budgetBarY = 202;
const budgetBarHeight = 42;

function formatMillions(value) {
  return `FJ$${(value / 1_000_000).toFixed(1)}M`;
}

export function FundingTimeline() {
  const committedShare =
    relocationFunding.nabavatu.committedFjd /
    relocationFunding.nabavatu.budgetFjd;
  const gapShare = 1 - committedShare;
  const committedWidth = panelWidth * committedShare;
  const gapWidth = panelWidth * gapShare;

  return (
    <figure className={styles.figure}>
      <div className={styles.scrollWrap}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Fiji's recurring climate-relocation funding model was removed in April 2022. The levy had been projected to contribute about FJ$5 million a year. Nabavatu's approved relocation budget was FJ$5.9 million; the July 2025 trust-fund commitment supplied FJ$3.5 million, or ${Math.round(
            committedShare * 100,
          )} percent. The remaining ${formatMillions(
            nabavatuGapFjd,
          )} was outside that commitment. New Zealand later announced a separate $5 million contribution to the national fund; the currency and Nabavatu allocation were not specified.`}
        >
          <defs>
            <pattern
              id="funding-gap-hatch"
              width="7"
              height="7"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-28)"
            >
              <line
                className={styles.hatchLine}
                x1="0"
                y1="0"
                x2="0"
                y2="7"
              />
            </pattern>
          </defs>

          <g className={styles.chartHeader}>
            <text x={leftX} y="38">
              From recurring revenue to a one-off commitment
            </text>
            <text x={leftX} y="60">
              The levy ended in 2022. Nabavatu's July allocation covered 59% of
              its approved budget.
            </text>
          </g>

          <line
            className={styles.panelDivider}
            x1={dividerX}
            x2={dividerX}
            y1="92"
            y2="286"
          />

          <g className={styles.levyPanel}>
            <text className={styles.panelKicker} x={leftX} y="108">
              2019 PLAN · RECURRING REVENUE
            </text>
            <text className={styles.panelValue} x={leftX} y="153">
              {formatMillions(relocationFunding.levy.projectedAnnualFjd)}
            </text>
            <text className={styles.panelUnit} x={leftX + 151} y="153">
              projected each year
            </text>
            <text className={styles.panelNote} x={leftX} y="177">
              3% of the levy was intended for the relocation fund
            </text>

            <line
              className={styles.levyRail}
              x1={leftX}
              x2={leftX + panelWidth}
              y1="220"
              y2="220"
            />
            <rect
              className={styles.levyBand}
              x={leftX}
              y="209"
              width={panelWidth - 28}
              height="22"
              rx="11"
            />
            <path
              className={styles.breakMark}
              d={`M${leftX + panelWidth - 34},202 l8,12 -7,9 9,13`}
            />

            <text className={styles.year} x={leftX} y="255">
              2019 · promised
            </text>
            <text
              className={styles.removedLabel}
              x={leftX + panelWidth}
              y="255"
              textAnchor="end"
            >
              APR 2022 · removed
            </text>
          </g>

          <g className={styles.budgetPanel}>
            <text className={styles.panelKicker} x={rightX} y="108">
              2024–25 · NABAVATU
            </text>
            <text className={styles.panelValue} x={rightX} y="153">
              {formatMillions(relocationFunding.nabavatu.budgetFjd)}
            </text>
            <text className={styles.panelUnit} x={rightX + 151} y="153">
              approved budget
            </text>
            <text className={styles.panelNote} x={rightX} y="177">
              Homes and the infrastructure needed to make the site liveable
            </text>

            <rect
              className={styles.committedBar}
              x={rightX}
              y={budgetBarY}
              width={committedWidth}
              height={budgetBarHeight}
              rx="6"
            />
            <rect
              className={styles.gapBar}
              x={rightX + committedWidth}
              y={budgetBarY}
              width={gapWidth}
              height={budgetBarHeight}
            />
            <rect
              className={styles.gapHatch}
              x={rightX + committedWidth}
              y={budgetBarY}
              width={gapWidth}
              height={budgetBarHeight}
              rx="6"
            />

            <text
              className={styles.barValueLight}
              x={rightX + committedWidth / 2}
              y={budgetBarY + 26}
              textAnchor="middle"
            >
              {formatMillions(relocationFunding.nabavatu.committedFjd)}
            </text>
            <text
              className={styles.barValueDark}
              x={rightX + committedWidth + gapWidth / 2}
              y={budgetBarY + 26}
              textAnchor="middle"
            >
              {formatMillions(nabavatuGapFjd)}
            </text>

            <text className={styles.shareLabel} x={rightX} y="269">
              59% · JULY COMMITMENT
            </text>
            <text
              className={styles.shareLabel}
              x={rightX + panelWidth}
              y="269"
              textAnchor="end"
            >
              41% · OTHER SUPPORT
            </text>
          </g>

          <line
            className={styles.contextDivider}
            x1={leftX}
            x2="930"
            y1="303"
            y2="303"
          />
          <g className={styles.contextLine}>
            <text x={leftX} y="327">
              DEC 2025 · NEW ZEALAND ANNOUNCED +$5M TO THE NATIONAL FUND
            </text>
            <text x={leftX} y="347">
              Currency and Nabavatu's share were not specified.
            </text>
          </g>
        </svg>
      </div>
      <p className={styles.scrollHint}>Scroll for full chart →</p>
      <figcaption className={styles.caption}>
        Sources: Fiji Prime Minister's Office; Fiji Revenue and Customs
        Service; Fiji Cabinet; Parliament of Fiji; New Zealand contribution
        announced by the Fiji Government.
      </figcaption>
    </figure>
  );
}
