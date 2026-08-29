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
        </div>

        <div className={styles.prose}>
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
            The measurements are not contradictory. Sea level records the
            height of the water; shoreline position marks where water meets
            land, which also shifts with waves, sediment and vegetation. Fiji's
            coasts are not changing along one neat line. Each coast — and each
            community — faces a different combination of risks.
          </p>
          <p>
            For the people living beside those changing shores, the important
            question is not simply whether a line moved inward or outward. It is
            whether homes, water supplies, roads and livelihoods can remain
            safe. Sometimes the answer is to adapt in place. Sometimes it is to
            move.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            For Vunidogoloa, a coastal village on Vanua Levu, that conversation
            led to a move. In 2014, about 140 residents moved to a new site about
            two kilometres away by road. It is widely recognised as Fiji's
            first climate-related planned relocation.
            <Ref
              n="7"
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8072796/"
              label="Planned relocation and health case study from Vunidogoloa, Fiji"
            />
          </p>
          <p>
            The new site offered safer housing, better road access and farmland
            where crops could grow without saltwater intrusion. It also changed
            familiar routines: the sea was now two kilometres away, making
            fishing more time-consuming. Residents later reported eating less
            fresh seafood and more packaged food.
          </p>
          <p>
            The move made Vunidogoloa safer, but it did not preserve the
            village exactly as it was. This is why Fiji treats relocation as a
            last resort.
          </p>
          <p>
            Vunidogoloa was the first village relocated through Fiji's
            climate-change programme, but it was not the last community to
            move. As of 2025, six communities had completed full or partial
            relocations. Since 2021, <strong>43 communities had been screened</strong>:
            some moved towards adapting in place, while others remained under
            assessment. Screening is not an order to move.
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
            Relocation is one outcome, not the default. Assessments are not
            limited to sea-level rise: heavy rainfall, river flooding,
            landslides and unstable ground can also make a settlement unsafe.
            In each case, the first question is whether the risk can be reduced
            without moving the community.
          </p>
          <p>
            With dozens requiring assessment, Fiji cannot improvise its
            response one village at a time. It published national relocation
            guidelines in 2018 and, in 2019, launched what the Fijian government
            described as the world's first national climate-relocation trust
            fund. Planned relocation was later written into Fiji's Climate
            Change Act.
            <Ref
              n="9"
              href="https://www.un.int/fiji/news/world%E2%80%99s-first-%E2%80%93ever-relocation-trust-fund-people-displaced-climate-change-launched-fijian-prime"
              label="Fiji Mission to the United Nations, world-first relocation trust fund launch, 2019"
            />
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            The human reality becomes clearer through one village. Nabavatu is
            inland, also on Vanua Levu. Heavy rain from Tropical Cyclone Ana in
            January 2021 triggered landslides and deep cracks that left the
            ground unstable.
          </p>
          <p>
            The village was evacuated. By July 2026, 37 families were preparing
            to move into permanent homes, with keys expected by September or
            October.
            <Ref
              n="10"
              href="https://pmn.co.nz/read/pacific-region/the-trauma-remains-fiji-families-finally-leaving-tent-life-after-nearly-six-years"
              label="Pacific Media Network, Nabavatu families prepare to relocate, July 2026"
            />
          </p>
          <p>
            Nabavatu is a reminder that planned relocation is not only about
            the sea, and that moving a community is a long process rather than
            a single construction project.
          </p>
        </div>

        <div className={styles.prose}>
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
              n="12"
              href="https://www.laws.gov.fj/Acts/ViewSection/131378?query=climate+change"
              label="Fiji Climate Change Act 2021, planned relocation provisions"
            />
          </p>
          <p>
            That means making room for somebody else's future, on land that
            also carries your own history.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Fiji is already doing this work — in policy, in villages and
            between communities. Nothing a visitor does during a holiday can
            cancel the flight that brought them there, or finance a village's
            relocation. The more useful question is smaller — and more human:
            once you arrive, what does it mean to help care for the place that
            welcomed you?
          </p>
          <p>The answer brings the story back to its first word.</p>
          <p>Loloma.</p>
          <p>
            At its largest, loloma can look like one community making space
            for another that can no longer safely remain where it is.
          </p>
          <p>It can also ask for something much smaller.</p>
          <p>An hour.</p>
        </div>

        <div className={styles.prose}>
          <p>
            In April 2025, Tourism Fiji launched Loloma Hour, inviting
            visitors to give one hour of their stay back to the place they
            had come to enjoy.
            <Ref
              n="13"
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
              n="14"
              href="https://www.fiji.travel/loloma-hour"
              label="Tourism Fiji, Loloma Hour launch details"
            />
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            One year on, the programme had surpassed its target more than
            threefold. The graphic below separates the contributed-hours total
            from the environmental outcomes it reported; one is not a
            conversion of the other.
            <Ref
              n="15"
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
            Loloma Hour is not an offset. It cannot cancel the flight that
            brought a visitor to Fiji, and it does not replace the long-term
            financing that planned relocation requires.
          </p>
          <p>
            It does something more modest: it directs some of the time,
            attention and labour brought by tourism towards work already
            being done on the islands.
          </p>
        </div>
        <Methods />
      </article>
    </section>
  );
}
