import { format } from "d3";
import { useEffect, useMemo, useState } from "react";
import {
  loadTourismArrivals,
  parseBundledTourismArrivals,
} from "../data/tourismArrivals";
import { Ref } from "../components/Ref";
import { ArrivalsChart } from "./ArrivalsChart";
import { flightComparison, journeyOptions } from "../data/journeyComparison";
import { CoastalExposure } from "./CoastalExposure";
import { JourneyComparison } from "./JourneyComparison";
import { RelocationDecision } from "./RelocationDecision";
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
        <p className={styles.date}>August 2026</p>
      </div>

      <article className={styles.storyBlock}>
        <div className={styles.prose}>
          <p>
            {latestArrivals ? `${latestArrivals} ` : ""}people came to Fiji in{" "}
            {storyEndYear} — more than in any year before.
            <Ref
              n="3"
              href="https://www.statsfiji.gov.fj/provisional-visitor-arrivals-december-2025/"
              label="Pacific Data Hub / SPC DF_CLIMATE_CHANGE, TRSM_ARR; Fiji Bureau of Statistics"
            />
          </p>
          <p>
            Follow the line of arrivals and you will see visitor numbers rising
            dramatically since the turn of the century. There is, naturally, one
            sharp interruption in 2020, when the world halted and international
            travel stopped almost overnight. We all know the reason.
          </p>
          <p>
            Then the visitors returned. By {storyEndYear}, Fiji recorded its
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
              n="4"
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
              n="5"
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

        <div className={styles.prose}>
          <p>
            Much of that adaptation work is concentrated along the coast, where{" "}
            <strong>
              76% of Fiji's population lives within five kilometres of the sea
            </strong>
            {". "}
            More than a quarter lives within a single kilometre.
            <Ref
              n="6"
              href="https://www.sprep.org/news/676-communities-face-possible-relocation-in-fiji-as-climate-impacts-escalate"
              label="SPREP coverage of possible community relocation in Fiji"
            />
          </p>
          <p>
            At Lautoka, sea level has risen by around{" "}
            <strong>13 centimetres since 1993</strong>.
            <Ref
              n="7"
              href="https://sealevel.nasa.gov/internal_resources/522/Lautoka_Fiji_combined.pdf"
              label="NASA Sea Level Change Team summary for Lautoka, Fiji"
            />
          </p>
          <p>
            Thirteen centimetres is easy to dismiss when it is drawn on a piece
            of paper. On the coast, however, it gives high tides and storm
            surges a higher starting point. Saltwater reaches gardens, fields
            and freshwater supplies more often. Erosion becomes harder to
            control.
          </p>
          <p>
            The changes tend to arrive as a series of practical problems: a crop
            that no longer grows well, a well that turns brackish, or a section
            of shoreline that needs to be repaired again after the next period
            of high water.
          </p>
        </div>

        <div className={styles.dataBlock}>
          <CoastalExposure />
        </div>

        <div className={styles.prose}>
          <p>
            For some communities, adapting in place may mean seawalls, raised
            homes or changes to the water supply. For others, those measures
            are no longer enough, and relocation needs to enter the
            conversation.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            For Vunidogoloa, a coastal village on Vanua Levu, that conversation
            led to a move. In 2014, about 140 residents moved to a new site two
            kilometres inland. It became Fiji's first planned relocation
            because of climate change.
            <Ref
              n="8"
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8072796/"
              label="Planned relocation and health case study from Vunidogoloa, Fiji"
            />
          </p>
          <p>
            The move resolved some immediate problems. The new site offered
            safer housing, better road access and soil where taro, cassava,
            pineapples and bananas could grow without saltwater reaching their
            roots.
          </p>
          <p>
            It also changed familiar routines. The sea was now two kilometres
            away, making fishing more time-consuming. Residents later reported
            eating less fresh seafood and more packaged food.
          </p>
          <p>
            The move made Vunidogoloa safer, but it did not preserve the
            village exactly as it was. This is why Fiji treats relocation as a
            last resort.
          </p>
          <p>
            Vunidogoloa was the first community to move, but it was not the
            last. As of 2025, Fiji had relocated{" "}
            <strong>six communities</strong>. A further{" "}
            <strong>43 had been identified for assessment</strong> — not
            ordered to move, and not all expected to.
            <Ref
              n="9"
              href="https://www.parliament.gov.fj/wp-content/uploads/2025/08/Daily-Hansard-Monday-14th-July-2025.pdf"
              label="Fiji Parliament Daily Hansard, 14 July 2025"
            />
          </p>
        </div>

        <div className={styles.dataBlock}>
          <RelocationDecision />
        </div>

        <div className={styles.prose}>
          <p>
            The assessments are not limited to sea-level rise. Heavy rainfall,
            river flooding, landslides and unstable ground can also make a
            settlement unsafe. In each case, the first question is whether the
            risk can be reduced without moving the community.
          </p>
          <p>
            With dozens of communities requiring assessment, the response
            cannot be improvised one village at a time.
          </p>
        </div>
      </article>
    </section>
  );
}
