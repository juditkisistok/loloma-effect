import { nabavatuGapFjd, relocationFunding } from "../data/relocationFunding";
import styles from "./FundingTimeline.module.css";

function formatMillions(value) {
  return `FJ$${(value / 1_000_000).toFixed(1)}M`;
}

export function FundingTimeline() {
  const committedPercent = Math.round(
    (relocationFunding.nabavatu.committedFjd /
      relocationFunding.nabavatu.budgetFjd) *
      100,
  );
  const uncoveredPercent = 100 - committedPercent;

  return (
    <figure
      className={styles.figure}
      aria-labelledby="nabavatu-funding-title"
      aria-describedby="nabavatu-funding-caption"
    >
      <header className={styles.header}>
        <p className={styles.kicker}>Nabavatu relocation</p>
        <h3 id="nabavatu-funding-title" className={styles.title}>
          <strong>{formatMillions(relocationFunding.nabavatu.budgetFjd)}</strong>
          {" "}
          <span>approved budget · February 2024</span>
        </h3>
      </header>

      <div className={styles.allocation}>
        <div
          className={styles.band}
          role="img"
          aria-label={`${committedPercent} percent, or ${formatMillions(
            relocationFunding.nabavatu.committedFjd,
          )}, was committed from the relocation trust fund in July 2025. ${uncoveredPercent} percent, or ${formatMillions(
            nabavatuGapFjd,
          )}, was not covered by that commitment.`}
        >
          <span
            className={styles.committedBand}
            style={{ width: `${committedPercent}%` }}
          />
          <span
            className={styles.uncoveredBand}
            style={{ width: `${uncoveredPercent}%` }}
          />
          <span
            className={styles.marker}
            style={{ left: `${committedPercent}%` }}
            aria-hidden="true"
          >
            <strong>{committedPercent}%</strong>
            <span>covered</span>
          </span>
        </div>

        <div
          className={styles.bandLabels}
          style={{ gridTemplateColumns: `${committedPercent}fr ${uncoveredPercent}fr` }}
          aria-hidden="true"
        >
          <div className={styles.committedLabel}>
            <strong>
              {formatMillions(relocationFunding.nabavatu.committedFjd)}
            </strong>
            <span>Trust-fund commitment · July 2025</span>
          </div>
          <div className={styles.uncoveredLabel}>
            <strong>{formatMillions(nabavatuGapFjd)}</strong>
            <span>Not covered by that commitment</span>
          </div>
        </div>
      </div>

      <figcaption id="nabavatu-funding-caption" className={styles.caption}>
        Sources: Fiji Cabinet, February 2024; Parliament of Fiji, July 2025.
        FJ$2.4M is calculated from those reported amounts.
      </figcaption>
    </figure>
  );
}
