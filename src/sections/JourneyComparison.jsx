import { journeyOptions, flightComparison } from "../data/journeyComparison";
import styles from "./JourneyComparison.module.css";

const maxFlightTotal = Math.max(...journeyOptions.map((route) => route.total));
const segmentClassNames = {
  direct: styles.segmentDirect,
  supply: styles.segmentSupply,
  warming: styles.segmentWarming,
};

export function JourneyComparison({ selectedId = "london" }) {
  const selected =
    journeyOptions.find((route) => route.id === selectedId) ?? journeyOptions[0];
  const direct = selected.segments.find((segment) => segment.key === "direct");
  const directMultiple = direct.value / flightComparison.fijiPerPerson;
  const flightWidth = (selected.total / maxFlightTotal) * 100;
  const benchmarkWidth = (flightComparison.fijiPerPerson / maxFlightTotal) * 100;

  return (
    <figure className={styles.figure}>
      <header className={styles.header}>
        <h3>One return journey to Nadi</h3>
        <p>
          {selected.label}{selected.note ? ` ${selected.note}` : ""} · {selected.returnKm.toLocaleString("en-US")} passenger-km
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.bars}>
          <section className={styles.barGroup}>
            <div className={styles.rowHeading}>
              <span>FLIGHT CLIMATE IMPACT</span>
              <strong>{selected.total.toFixed(2)} t CO₂e</strong>
            </div>
            <div
              className={styles.track}
              role="img"
              aria-label={`${selected.total.toFixed(2)} tonnes CO₂e: ${selected.segments.map((segment) => `${segment.label} ${segment.value.toFixed(2)} tonnes`).join(", ")}.`}
            >
              <div className={styles.flightBar} style={{ width: `${flightWidth}%` }}>
                {selected.segments.map((segment) => (
                  <span
                    key={segment.key}
                    className={segmentClassNames[segment.key]}
                    style={{ width: `${(segment.value / selected.total) * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.legend}>
              {selected.segments.map((segment) => (
                <span key={segment.key}>
                  <i className={segmentClassNames[segment.key]} aria-hidden="true" />
                  {segment.label} · {segment.value.toFixed(2)} t
                </span>
              ))}
            </div>
          </section>

          <section className={styles.barGroup}>
            <div className={styles.rowHeading}>
              <span>FIJI TERRITORIAL CO₂</span>
              <strong>{flightComparison.fijiPerPerson.toFixed(2)} t / person / year</strong>
            </div>
            <div className={styles.track}>
              <div
                className={styles.benchmarkBar}
                style={{ width: `${benchmarkWidth}%` }}
                role="img"
                aria-label={`${flightComparison.fijiPerPerson.toFixed(2)} tonnes of territorial CO₂ per person in Fiji in 2024.`}
              />
            </div>
          </section>
        </div>

        <aside className={styles.stat} aria-label={`Direct flight carbon dioxide alone is ${directMultiple.toFixed(1)} times Fiji's annual territorial carbon dioxide per person.`}>
          <p>DIRECT CO₂ ALONE</p>
          <strong>{directMultiple.toFixed(1)}×</strong>
          <span>Fiji's annual territorial CO₂ per person</span>
        </aside>
      </div>

      <figcaption className={styles.caption}>
        Great-circle route estimate; an actual itinerary may be longer. Direct
        flight CO₂ is compared with Fiji's territorial CO₂ on the same basis.
        Fuel-supply and trace-gas emissions, then aviation's non-CO₂ effects,
        are shown separately in the total climate-impact bar. Sources: UK
        government 2025 conversion factors; Our World in Data, Fiji, 2024.
      </figcaption>
    </figure>
  );
}
