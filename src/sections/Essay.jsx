import { format } from "d3";
import { useEffect, useMemo, useState } from "react";
import {
  loadTourismArrivals,
  parseBundledTourismArrivals,
} from "../data/tourismArrivals";
import { Ref } from "../components/Ref";
import { ArrivalsChart } from "./ArrivalsChart";
import { flightComparison, journeyOptions } from "../data/journeyComparison";
import { JourneyComparison } from "./JourneyComparison";
import styles from "./Essay.module.css";

const storyEndYear = 2025;
const formatWhole = format(",");

export function Essay() {
  const [rows, setRows] = useState(() =>
    parseBundledTourismArrivals().filter((row) => row.year <= storyEndYear),
  );

  useEffect(() => {
    let alive = true;

    loadTourismArrivals().then((data) => {
      if (alive) {
        setRows(data.filter((row) => row.year <= storyEndYear));
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  const latest = useMemo(
    () => rows.find((row) => row.year === storyEndYear),
    [rows],
  );
  const latestArrivals = latest ? formatWhole(latest.arrivals) : null;
  const [selectedJourneyId, setSelectedJourneyId] = useState("london");
  const [journeyMenuOpen, setJourneyMenuOpen] = useState(false);
  const selectedJourney =
    journeyOptions.find((journey) => journey.id === selectedJourneyId) ??
    journeyOptions[0];
  const roundedJourneyTonnes = Math.round(selectedJourney.total);

  return (
    <section className={styles.essay} aria-labelledby="essay-title">
      <div className={styles.masthead}>
        <h2 id="essay-title" className={styles.title}>
          At the water’s edge
        </h2>
        <p className={styles.byline}>
          By{" "}
          <a href="https://juditkisistok.com" target="_blank" rel="noreferrer">
            Judit Kisistok
          </a>
        </p>
        <p className={styles.date}>August 2025</p>
      </div>

      <article className={styles.storyBlock}>
        <div className={styles.prose}>
          <p>
            {latestArrivals
              ? `${latestArrivals} people came to Fiji in ${storyEndYear} - more than in any year before. Follow the line of arrivals and you will see the visitor numbers have risen dramatically since the turn of the century. There is, naturally, one sharp interruption in 2020, when the world halted and travel stopped almost overnight; we all know the reason.`
              : ""}
          </p>
          <p>
            Then the visitors returned and in {storyEndYear}, Fiji recorded its
            busiest year yet.
          </p>
        </div>

        <div className={styles.dataBlock}>
          <ArrivalsChart rows={rows} />
        </div>

        <div className={styles.prose}>
          <p>
            Most of those visitors arrived by air. There is a shortage of
            practical alternatives: Fiji is an archipelago in the middle of the
            Pacific, thousands of kilometres from many of the people who travel
            there.
          </p>
          <p>This is where the climate side of the story begins.</p>
          <p>
            Take one visitor travelling from {" "}
            <span className={styles.inlineMenu}>
              <button
                className={styles.inlineSelect}
                type="button"
                aria-label="Choose origin city"
                aria-expanded={journeyMenuOpen}
                onClick={() => setJourneyMenuOpen((open) => !open)}
              >
                {selectedJourney.label}
              </button>
              {journeyMenuOpen && (
                <span className={styles.inlineOptions}>
                  {journeyOptions.map((journey) => (
                    <button
                      className={styles.inlineOption}
                      key={journey.id}
                      type="button"
                      onClick={() => {
                        setSelectedJourneyId(journey.id);
                        setJourneyMenuOpen(false);
                      }}
                    >
                      {journey.label}
                    </button>
                  ))}
                </span>
              )}
            </span>{" "}
            to Nadi in economy class. Their return journey produces around {" "}
            <strong>
              {roundedJourneyTonnes} tonne
              {roundedJourneyTonnes === 1 ? "" : "s"} of CO₂e
            </strong>, depending on the route and calculation method.
            <Ref
              n="3"
              href="https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025"
              label="UK government greenhouse gas conversion factors 2025"
            />
          </p>
          <p>
            Fiji's territorial CO₂ emissions were around {" "}
            <strong>
              {flightComparison.fijiPerPerson.toFixed(2)} tonnes per person in
              2024
            </strong>.
            <Ref
              n="4"
              href="https://ourworldindata.org/profile/co2/fiji"
              label="Our World in Data CO₂ profile for Fiji"
            />
          </p>
          <p>
            The figures are not directly equivalent: the flight estimate
            includes aviation's wider warming effects, while Fiji's figure
            counts only CO₂ released within its borders. Even with that caveat,
            the imbalance is rather significant.
          </p>
        </div>

        <div className={styles.dataBlock}>
          <JourneyComparison selectedId={selectedJourneyId} />
        </div>

        <div className={styles.prose}>
          <p>
            That flight is one small part of decades of accumulated global
            emissions - a total Fiji has contributed very little to.
          </p>
          <p>
            By the time Nadi's shoreline appears through the window, most of the journey's
            emissions have already been released. They sit outside Fiji's
            national carbon account, even as the country has to spend more on
            adapting to a warmer climate.
          </p>
        </div>
      </article>
    </section>
  );
}
