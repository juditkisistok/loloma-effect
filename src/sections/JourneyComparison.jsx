import { journeyOptions, flightComparison } from "../data/journeyComparison";
import { useEffect, useRef, useState } from "react";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import { stickyFigureProgress } from "../scroll/stickyFigure";
import { Definition } from "../components/Definition";
import { useMediaQuery } from "../hooks/useMediaQuery";
import visualizationStyles from "../styles/visualization.module.css";
import styles from "./JourneyComparison.module.css";

const maxFlightTotal = Math.max(...journeyOptions.map((route) => route.total));
const segmentClassNames = {
  direct: styles.segmentDirect,
  supply: styles.segmentSupply,
  warming: styles.segmentWarming,
};

const easedReveal = (progress, start, end) => {
  const t = clamp((progress - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
};

const steadyReveal = (progress, start, end) => {
  const t = clamp((progress - start) / (end - start), 0, 1);
  const edge = 0.1;

  if (t < edge) {
    const u = t / edge;
    return edge * u * u * (2 - u);
  }
  if (t > 1 - edge) {
    const u = (1 - t) / edge;
    return 1 - edge * u * u * (2 - u);
  }
  return t;
};

export function JourneyComparison({ selectedId = "london", onSelect }) {
  const figureRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const isCompact = useMediaQuery("(max-width: 900px)");
  const menuRef = useRef(null);
  const selected =
    journeyOptions.find((route) => route.id === selectedId) ?? journeyOptions[0];
  const direct = selected.segments.find((segment) => segment.key === "direct");
  const directMultiple = direct.value / flightComparison.fijiPerPerson;
  const flightWidth = (selected.total / maxFlightTotal) * 100;
  const benchmarkWidth = (flightComparison.fijiPerPerson / maxFlightTotal) * 100;
  const flightReveal = steadyReveal(progress, 0.02, 0.58);
  let segmentStart = 0;
  const revealedSegments = selected.segments.map((segment) => {
    const share = segment.value / selected.total;
    const start = segmentStart;
    segmentStart += share;
    return {
      ...segment,
      share,
      opacity:
        0.4 +
        0.6 * easedReveal(flightReveal, start, Math.min(1, start + 0.12)),
    };
  });
  const benchmarkReveal = steadyReveal(progress, 0.14, 0.72);
  const legendReveal = easedReveal(
    progress,
    isCompact ? 0.18 : 0.32,
    isCompact ? 0.46 : 0.64,
  );
  const statReveal = easedReveal(
    progress,
    isCompact ? 0.34 : 0.54,
    isCompact ? 0.62 : 0.86,
  );

  useFrame((frame) => {
    if (frame.reduced) {
      setProgress(1);
      return;
    }
    const next = stickyFigureProgress(figureRef.current, {
      desktopTop: 0,
      mobileTop: 0,
    });
    setProgress((current) =>
      Math.abs(current - next) > 0.002 ? next : current,
    );
  });

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const chooseJourney = (id) => {
    onSelect?.(id);
    setMenuOpen(false);
  };

  return (
    <figure
      id="journey-comparison"
      className={`${visualizationStyles.scrollFigure} ${visualizationStyles.figureFrame} ${visualizationStyles.insetFrame} ${styles.figure}`}
      ref={figureRef}
    >
      <div className={`${visualizationStyles.stickyCenter} ${styles.sticky}`}>
      <header className={`${visualizationStyles.figureHeader} ${styles.header}`}>
        <h3>One return journey to Nadi</h3>
        <p>
          <span className={styles.routeMenu} ref={menuRef}>
            <button
              className={styles.routeSelect}
              type="button"
              aria-label={`Change origin city. Currently ${selected.label}`}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={styles.routeValue} key={selected.id}>{selected.label}</span>
            </button>
            {menuOpen && (
              <span className={styles.routeOptions}>
                {journeyOptions.map((journey) => (
                  <button
                    className={styles.routeOption}
                    key={journey.id}
                    type="button"
                    aria-pressed={journey.id === selected.id}
                    onClick={() => chooseJourney(journey.id)}
                  >
                    {journey.label}
                  </button>
                ))}
              </span>
            )}
          </span>
          <span className={styles.routeDetails} key={`details-${selected.id}`}>
            {selected.note ? ` ${selected.note}` : ""} · {selected.returnKm.toLocaleString("en-US")} passenger-km
          </span>
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.bars}>
          <section className={styles.barGroup}>
            <div className={styles.rowHeading}>
              <span>FLIGHT CLIMATE IMPACT</span>
              <strong className={styles.valueChange} key={`total-${selected.id}`}>
                {selected.total.toFixed(2)} t {" "}
                <Definition
                  label="CO₂e, carbon dioxide equivalent"
                  definition="Carbon dioxide equivalent: a common unit that expresses the warming impact of greenhouse gases and other climate effects as an equivalent amount of CO₂."
                >
                  CO₂e
                </Definition>
              </strong>
            </div>
            <div
              className={styles.track}
              role="img"
              aria-label={`${selected.total.toFixed(2)} tonnes carbon dioxide equivalent: ${selected.segments.map((segment) => `${segment.label} ${segment.value.toFixed(2)} tonnes`).join(", ")}.`}
            >
              <div
                className={styles.flightBar}
                style={{
                  width: `${flightWidth}%`,
                  clipPath: `inset(0 ${(1 - flightReveal) * 100}% 0 0)`,
                }}
              >
                {revealedSegments.map((segment) => (
                  <span
                    key={segment.key}
                    className={segmentClassNames[segment.key]}
                    style={{
                      width: `${segment.share * 100}%`,
                      opacity: segment.opacity,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.legend} style={{ opacity: legendReveal }}>
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
                style={{ width: `${benchmarkWidth * benchmarkReveal}%` }}
                role="img"
                aria-label={`${flightComparison.fijiPerPerson.toFixed(2)} tonnes of territorial CO₂ per person in Fiji in 2024.`}
              />
            </div>
          </section>
        </div>

        <aside
          className={styles.stat}
          style={{
            opacity: statReveal,
            transform: `translateX(${(1 - statReveal) * 12}px)`,
          }}
          aria-label={`Direct flight carbon dioxide alone is ${directMultiple.toFixed(1)} times Fiji's annual territorial carbon dioxide per person.`}
        >
          <p>DIRECT CO₂ ALONE</p>
          <strong className={styles.valueChange} key={`multiple-${selected.id}`}>
            {directMultiple.toFixed(1)}×
          </strong>
          <span>Fiji's annual territorial CO₂ per person</span>
        </aside>
      </div>

      <figcaption className={`${visualizationStyles.figureCaption} ${styles.caption}`}>
        A single return flight and one year of Fiji's territorial CO₂ per
        person are shown together to compare scale. Distances follow the
        shortest path between airports; actual itineraries may be longer.
          Sources:{" "}
          <a
            href="https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025"
            target="_blank"
            rel="noopener noreferrer"
          >
            UK government conversion factors, 2025
          </a>
          ;{" "}
          <a
            href="https://ourworldindata.org/profile/co2/fiji"
            target="_blank"
            rel="noopener noreferrer"
          >
            Our World in Data, Fiji, 2024
          </a>
          .
      </figcaption>
      </div>
    </figure>
  );
}
