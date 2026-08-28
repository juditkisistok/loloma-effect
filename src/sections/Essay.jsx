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
import { FundingTimeline } from "./FundingTimeline";
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
            Fiji recorded {latestArrivals ?? "nearly one million"} visitor
            arrivals in {storyEndYear}.
            <Ref
              n="3"
              href="https://www.statsfiji.gov.fj/provisional-visitor-arrivals-december-2025/"
              label="Fiji Bureau of Statistics, provisional visitor arrivals for December 2025"
            />
          </p>
          <p>
            Follow the line of arrivals and you will see visitor numbers rising
            dramatically since the turn of the century. There is, naturally, a
            two-year interruption beginning in 2020, when international travel
            stopped almost overnight. We all know the reason.
          </p>
          <p>
            Then the visitors returned. By {storyEndYear}, Fiji was again near
            the million-visitor mark.
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
            Take one visitor travelling from{" "}
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
              href="https://ourworldindata.org/co2/country/fiji"
              label="Our World in Data CO₂ profile for Fiji"
            />
          </p>
          <p>
            The comparison below keeps the accounting boundaries visible.
            The flight's direct CO₂ — about{" "}
            <strong>{selectedDirectCo2.toFixed(1)} tonnes</strong> — can be
            compared with Fiji's territorial CO₂. Fuel production and
            aviation's non-CO₂ warming effects are then added separately to
            show the wider estimated climate impact.
          </p>
        </div>

        <div className={styles.dataBlock}>
          <JourneyComparison selectedId={selectedJourneyId} />
        </div>

        <div className={styles.prose}>
          <p>
            That flight is one small part of decades of accumulated global
            emissions — a total Fiji has contributed very little to.
          </p>
          <p>
            By the time Nadi's shoreline appears through the window, most of
            the flight's climate impact has already been created. It sits
            outside Fiji's national carbon account, even as the country has to
            spend more on adapting to a warmer climate.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Based on Fiji's 2007 census distribution, much of that adaptation
            work is concentrated along the coast: {" "}
            <strong>
              76% of the population lived within five kilometres of the sea
            </strong>
            {". "}
            More than a quarter lived within a single kilometre.
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
          <p>
            Shorelines do not all move in the same direction. The satellite
            record below follows one small island off Lautoka where the nearest
            valid rate measurement shows modest outward growth, even as local
            sea level rose. One shoreline cannot stand in for the whole country.
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
            last. As of 2025, six communities had completed full or partial
            relocations. Since 2021, <strong>43 communities had been
            screened</strong>: some moved towards adapting in place, while
            others remained under assessment. Screening is not an order to
            move.
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

        <div className={styles.prose}>
          <p>
            Fiji began building a national system for planned relocation
            before most countries had one. It published national guidelines
            in 2018 and, in 2019, created the world's first national trust
            fund dedicated to relocating communities affected by climate
            change. Planned relocation was later written into Fiji's Climate
            Change Act.
            <Ref
              n="10"
              href="https://www.fiji.gov.fj/getattachment/Media-Centre/News/PM-Bainimarama-Launches-World-First-Climate-Reloc"
              label="Fiji Climate Relocation of Communities Trust Fund, launched 2019"
            />
          </p>
          <p>
            The original plan was to direct 3% of the revenue from the
            Environment and Climate Adaptation Levy into the fund. The levy
            drew partly from prescribed services in hotels, restaurants and
            bars, alongside taxes on high incomes and luxury spending. When
            the fund was launched, the government expected this contribution
            to amount to around FJ$5 million a year.
            <Ref
              n="11"
              href="https://www.frcs.org.fj/"
              label="Fiji Revenue and Customs Service, Environment and Climate Adaptation Levy"
            />
          </p>
          <p>
            It was a fairly direct idea: take a small share of the revenue
            generated by the visitor economy and reserve it for communities
            facing climate loss.
          </p>
          <p>
            In April 2022, the levy itself was removed — but the allocation
            did not disappear. Fiji redirected 3% of VAT collected from
            prescribed services, together with specified levies, into the
            same relocation fund. The tax label changed; the commitment to a
            domestic funding stream continued.
            <Ref
              n="12"
              href="https://www.parliament.gov.fj/wp-content/uploads/2022/03/Daily-Hansard-Thursday-24-March-2022.pdf"
              label="Fiji Parliament, replacement of the ECAL allocation with VAT and specified levies, 2022"
            />
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            The cost of relocation is easier to understand through one
            village.
          </p>
          <p>
            Nabavatu is inland, also on Vanua Levu. After Tropical Cyclone
            Ana in January 2021, the ground beneath it began to fail. Land
            slumped, deep cracks appeared and government mapping found that
            most homes were in medium- or high-risk areas.
          </p>
          <p>
            The village was evacuated. Residents were initially told they
            would be living in tents for three months. More than four years
            later, they were still waiting at the temporary site.
            <Ref
              n="13"
              href="https://www.fijivillage.com/feature/Nabavatu-villagers-dont-have-to-live-in-tents-anymore-as-new-house-constructions-about-to-begin-r548fx/"
              label="Nabavatu evacuation and temporary relocation coverage"
            />
          </p>
          <p>
            In 2024, the government approved a new site around 800 metres
            away. The relocation was budgeted at approximately{" "}
            <strong>FJ$5.9 million</strong>.
            <Ref
              n="14"
              href="https://www.fiji.gov.fj/decisions-made-at-the-meeting-of-cabinet-held-on-27-february-2024/"
              label="Fiji Cabinet, Nabavatu relocation budget approval, 2024"
            />
          </p>
          <p>
            That amount has to provide more than new houses. The project
            includes roads, drainage, water, electricity and sanitation: the
            basic systems needed to make the new site liveable.
          </p>
          <p>
            In 2025, the government committed{" "}
            <strong>FJ$3.5 million</strong> from the relocation trust fund,
            with the rest of the project relying on bilateral and other
            support.
            <Ref
              n="9"
              href="https://www.parliament.gov.fj/wp-content/uploads/2025/08/Daily-Hansard-Monday-14th-July-2025.pdf"
              label="Fiji Parliament Daily Hansard, 14 July 2025"
            />
          </p>
        </div>

        <div className={styles.dataBlock}>
          <FundingTimeline />
        </div>

        <div className={styles.prose}>
          <p>
            In December 2025, New Zealand announced a further $5 million
            contribution to the national relocation fund, including support for
            Nabavatu. The announcement did not specify the currency or reserve
            the whole amount for that village.
            <Ref
              n="15"
              href="https://www.fiji.gov.fj/fiji-secures-5-million-contribution-to-climate-relocation-of-communities-trust-fund-from-new-zealand/"
              label="Fiji Government, New Zealand contribution to the Climate Relocation of Communities Trust Fund, December 2025"
            />
          </p>
          <p>
            Fiji now has rules for deciding when relocation should happen and
            a domestic funding mechanism that can contribute to the cost.
            Nabavatu shows the scale of the task: one trust-fund commitment
            covered 59% of one village's approved budget. Partner support can
            help close what remains, but it arrives as separate commitments.
          </p>
          <p>
            Money, however, is not the only thing a relocation requires. A
            village also needs somewhere to go.
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            Most land in Fiji is iTaukei land, held communally by Indigenous
            landowning groups rather than simply bought and sold on the open
            market.
            <Ref
              n="16"
              href="https://itaukeilandtrustboard.com.fj/"
              label="iTaukei Land Trust Board, communal land tenure in Fiji"
            />{" "}
            Where a village cannot move within its own customary land,
            another landowning group may need to agree to host it. Fiji's
            Climate Change Act requires the rights and concerns of both the
            relocating and host communities to be taken into account.
            <Ref
              n="17"
              href="https://www.fiji.gov.fj/getattachment/Legislations/CLIMATE-CHANGE-ACT-2021"
              label="Fiji Climate Change Act 2021, planned relocation provisions"
            />
          </p>
          <p>
            That means making room for somebody else's future, on land that
            also carries your own history.
          </p>
        </div>

        <div className={styles.prose}>
          <p>It brings the story back to its first word.</p>
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
              n="18"
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
              n="19"
              href="https://www.fiji.travel/loloma-hour"
              label="Tourism Fiji, Loloma Hour launch details"
            />
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            One year on, the programme had reached{" "}
            <strong>17,407 hours</strong> across <strong>2,146 sessions</strong>{" "}
            at <strong>27 properties</strong> — more than three times the
            original 5,000-hour target. Participants planted{" "}
            <strong>2,980 corals</strong> and <strong>13,056 mangroves</strong>,
            added <strong>461 trees</strong>, and collected{" "}
            <strong>1,112 kilograms</strong> of waste.
            <Ref
              n="20"
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
            These numbers should not be mistaken for an offset. An hour spent
            planting coral does not cancel the flight that brought a visitor
            to Fiji, and it does not replace the long-term financing that
            planned relocation requires.
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
