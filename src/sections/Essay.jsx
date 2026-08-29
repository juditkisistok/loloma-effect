import { format } from "d3";
import { useEffect, useMemo, useState } from "react";
import {
  loadTourismArrivals,
  parseBundledTourismArrivals,
} from "../data/tourismArrivals";
import { Ref } from "../components/Ref";
import { Definition } from "../components/Definition";
import { ArrivalsChart } from "./ArrivalsChart";
import { flightComparison, journeyOptions } from "../data/journeyComparison";
import { CoastalExposure } from "./CoastalExposure";
import { JourneyComparison } from "./JourneyComparison";
import { RelocationDecision } from "./RelocationDecision";
import { LolomaHour } from "./LolomaHour";
import { Methods } from "./Methods";
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
  const selectedDirectCo2 = selectedJourney.segments.find(
    (segment) => segment.key === "direct",
  )?.value;

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
            Fiji welcomed {latestArrivals ?? "nearly one million"} visitors in{" "}
            {storyEndYear}.
            <Ref
              n="3"
              href="https://www.statsfiji.gov.fj/provisional-visitor-arrivals-december-2025/"
              label="Fiji Bureau of Statistics, provisional visitor arrivals for December 2025"
            />
          </p>
          <p>
            Follow the line of arrivals and you will see visitor numbers rising
            dramatically since the turn of the century. There is, naturally, a
            two-year collapse beginning in 2020, when international travel
            contracted almost overnight. We all know the reason.
          </p>
        </div>

        <div className={styles.dataBlock}>
          <ArrivalsChart rows={rows} />
        </div>

        <div className={styles.prose}>
          <p>
            Reaching Fiji usually means flying. It is an archipelago in the
            middle of the Pacific, thousands of kilometres from many of the
            people who travel there.
          </p>
          <p>
            Consider one visitor travelling from{" "}
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
              {roundedJourneyTonnes === 1 ? "" : "s"} of {" "}
              <Definition
                label="CO₂e, carbon dioxide equivalent"
                definition="Carbon dioxide equivalent: a common unit that expresses the warming impact of greenhouse gases and other climate effects as an equivalent amount of CO₂."
              >
                CO₂e
              </Definition>
            </strong>.
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
            The chart below separates the journey's estimated climate impact
            into three parts. Its direct CO₂ — about{" "}
            <strong>{selectedDirectCo2.toFixed(1)} tonnes</strong> — is the
            closest comparison with Fiji's territorial CO₂. Emissions from
            fuel production and aviation's other warming effects are shown
            separately, so the total reflects the journey's wider effect.
          </p>
        </div>

        <div className={styles.dataBlock}>
          <JourneyComparison
            selectedId={selectedJourneyId}
            onSelect={setSelectedJourneyId}
          />
        </div>

        <div className={styles.prose}>
          <p>
            That flight is one small part of decades of accumulated global
            emissions — a total Fiji has contributed very little to. Yet by
            the time Nadi's shoreline appears through the window, most of
            the flight's climate impact has already been created.
          </p>
          <p>
            That imbalance reaches Fiji at the water's edge. But the data do
            not show a simple story of every coastline retreating.
          </p>
          <p>
            At Lautoka, sea level has risen by around{" "}
            <strong>13 centimetres since 1993</strong>.
            <Ref
              n="6"
              href="https://sealevel.nasa.gov/internal_resources/522/Lautoka_Fiji_combined.pdf"
              label="NASA Sea Level Change Team summary for Lautoka, Fiji"
            />
            {" "}But sea level measures the height of the water; shoreline data
            track where water meets land. Waves and currents can add sediment
            in one place and remove it in another, so the two don't always move
            together. Across 3,838 good-certainty measurements around Lautoka
            and Nadi, shores moved in both directions; the median point shifted
            seaward by <strong>0.22 metres a year</strong>.
          </p>
          <p>
            Tivua Island, about 13 kilometres west of Lautoka, illustrates this
            distinction. At the highlighted point, its shore advanced by an
            average <strong>0.38 metres a year</strong>. The data tell us that
            the shoreline moved, but not why — and outward movement does not
            mean the island is safe from rising water. The climate story is,
            unsurprisingly, more complicated than a single moving line.
          </p>
        </div>

        <div className={styles.dataBlock}>
          <CoastalExposure />
        </div>

        <div className={styles.prose}>
          <p>
            For the people living beside those changing shores, the important
            question is not simply whether a line moved inward or outward — it is
            whether homes, water supplies, roads and livelihoods can remain
            safe. Sometimes the answer is to adapt in place. Sometimes it is to
            pack up and move.
          </p>
          <p>
            In 2014, about 140 residents from Vunidogoloa, a coastal village on
            Vanua Levu, relocated to higher ground two kilometres away by road.
            It became Fiji's first village to relocate with government support
            away from environmental risk.
            <Ref
              n="7"
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12055693/"
              label="Longitudinal study of climate-related relocation in Vunidogoloa, Fiji"
            />
          </p>
          <p>
            The new site offered safer housing, better road access and farmland
            where crops could grow without saltwater intrusion. However, it also
            changed familiar routines: fishing now took longer, and residents
            later described eating less fresh seafood and more packaged food —
            a shift researchers linked both to the distance from fishing grounds
            and easier access to shops.
            <Ref
              n="7"
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12055693/"
              label="Longitudinal study of climate-related relocation in Vunidogoloa, Fiji"
            />
          </p>
          <p>
            The move reduced Vunidogoloa's exposure to coastal hazards, but it
            did not preserve village life exactly as it was. This trade-off
            helps explain why Fiji treats relocation as a last resort.
            <Ref
              n="8"
              href="https://www.parliament.gov.fj/wp-content/uploads/2025/08/Daily-Hansard-Monday-14th-July-2025.pdf"
              label="Fiji Parliament Daily Hansard, 14 July 2025"
            />
          </p>
          <p>
            By 2025, six communities in total had completed full or partial
            relocations. Since 2021, <strong>43 communities had been screened</strong>,
            but screening did not necessarily lead to a move: some shifted
            towards adapting in place, while others remained under assessment.
            <Ref
              n="8"
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
            With dozens requiring assessment, Fiji cannot improvise its
            response one village at a time. It published national relocation
            guidelines in 2018 and, a year later, launched what the Fijian
            government described as the world's first climate-relocation trust
            fund.
            <Ref
              n="9"
              href="https://www.un.int/fiji/news/world%E2%80%99s-first-%E2%80%93ever-relocation-trust-fund-people-displaced-climate-change-launched-fijian-prime"
              label="Fiji Mission to the United Nations, world-first relocation trust fund launch, 2019"
            />
            Planned relocation was subsequently written into Fiji's Climate
            Change Act.
            <Ref
              n="10"
              href="https://www.laws.gov.fj/Acts/ViewSection/131378?query=climate+change"
              label="Fiji Climate Change Act 2021, planned relocation provisions"
            />
          </p>
          <p>
            Together, these measures aim to turn relocation from an improvised
            response into a national process: the guidelines define how
            communities should be consulted, the fund provides a way to pay for
            the work, and the Act makes relocation a government responsibility.
          </p>
          <p>
            About nine-tenths of land in Fiji is iTaukei land, held communally
            by Indigenous landowning groups rather than simply bought and sold
            on the open market.
            <Ref
              n="11"
              href="https://tltb.com.fj/corporate-profile/"
              label="iTaukei Land Trust Board, communal land tenure in Fiji"
            />{" "}
            Where a village cannot move within its own customary land,
            another landowning group may need to agree to host it. Fiji's
            Climate Change Act requires the rights and concerns of both the
            relocating and host communities to be taken into account.
            <Ref
              n="10"
              href="https://www.laws.gov.fj/Acts/ViewSection/131378?query=climate+change"
              label="Fiji Climate Change Act 2021, planned relocation provisions"
            />
          </p>
          <p>
            That means making room for somebody else's future, on land that
            also carries your own history.
          </p>
        </div>

        <div className={`${styles.prose} ${styles.pivot}`}>
          <p>
            Responsibility for meeting this challenge extends beyond Fiji —
            and compels us to rethink travel as a practice. Doing so is only
            one part of that wider effort, but it can begin to change the
            relationship between visitor and host for the better. The question
            then becomes: once you arrive, what does it mean to help care for
            the place that welcomed you?
          </p>
          <p>
            The answer brings us back to where we started: the concept of
            loloma.
          </p>
          <p>
            Loloma can look like one community making space for another that
            can no longer safely remain where it is. Or it can be a much
            smaller ask: an hour of your time.
          </p>
          <p>
            In April 2025, Tourism Fiji launched Loloma Hour, inviting
            visitors to give one hour of their stay back to the place they
            had come to enjoy.
            <Ref
              n="12"
              href="https://www.fiji.travel/loloma-hour"
              label="Tourism Fiji, Loloma Hour"
            />
          </p>
          <p>
            Visitors could plant coral, restore mangroves, join wildlife
            conservation, help with beach clean-ups or take part in cultural
            activities led by local communities. At launch,{" "}
            <strong>21 tourism partners</strong> offered more than{" "}
            <strong>40 ways</strong> to participate, with a first-year target
            of <strong>5,000 hours</strong>.
            <Ref
              n="13"
              href="https://www.fiji.travel/loloma-hour"
              label="Tourism Fiji, Loloma Hour launch details"
            />
          </p>
          <p>
            One year on, Tourism Fiji reported <strong>17,407 contributed
            hours</strong> — 3.5 times the programme's first-year target.
            <Ref
              n="14"
              href="https://www.fiji.travel/loloma-hour"
              label="Tourism Fiji, Loloma Hour annual results, April 2025 – April 2026"
            />
          </p>
        </div>

        <div className={styles.dataBlock}>
          <LolomaHour />
        </div>

        <div className={styles.prose}>
          <p>
            Seventeen thousand hours do not solve the larger imbalance. But
            they turn part of what tourism brings — people's time, attention
            and labour — towards work already being done on the islands.
          </p>
        </div>
        <Methods />
      </article>
    </section>
  );
}
