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
            But the arrangement did not last. The levy was removed in April
            2022, leaving the trust fund in place without the domestic
            revenue stream originally intended to sustain it.
            <Ref
              n="12"
              href="https://www.parliament.gov.fj/"
              label="Fiji Cabinet / Parliament of Fiji, Environment and Climate Adaptation Levy repeal, 2022"
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
              href="https://www.fijivillage.com/"
              label="Nabavatu evacuation and temporary relocation coverage"
            />
          </p>
          <p>
            In 2024, the government approved a new site around 800 metres
            away. The relocation was budgeted at approximately{" "}
            <strong>FJ$5.9 million</strong>.
            <Ref
              n="14"
              href="https://www.fiji.gov.fj/"
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
            Fiji now has rules for deciding when relocation should happen and
            a fund that can contribute to the cost. What it does not have is
            a dependable source of money large enough to meet every case
            likely to come before it.
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
              n="15"
              href="https://itaukeilandtrustboard.com.fj/"
              label="iTaukei Land Trust Board, communal land tenure in Fiji"
            />{" "}
            Where a village cannot move within its own customary land,
            another landowning group may need to agree to host it. Fiji's
            Climate Change Act requires the rights and concerns of both the
            relocating and host communities to be taken into account.
            <Ref
              n="16"
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
              n="17"
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
              n="18"
              href="https://www.fiji.travel/loloma-hour"
              label="Tourism Fiji, Loloma Hour launch details"
            />
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            In its first three months, published results put the programme
            at <strong>3,540 hours</strong> across{" "}
            <strong>317 sessions</strong>. Participants collected{" "}
            <strong>512 kilograms of rubbish</strong> and planted{" "}
            <strong>1,211 corals</strong>, <strong>12,858 mangroves</strong>{" "}
            and <strong>313 trees</strong>.
            <Ref
              n="19"
              href="https://www.eglobaltravelmedia.com.au/"
              label="eGlobal Travel Media, first-three-month Loloma Hour results, September 2025"
            />
          </p>
        </div>

        <div className={styles.prose}>
          <p>
            These numbers should not be mistaken for an offset. An hour spent
            planting coral does not cancel the flight that brought a visitor
            to Fiji, and it does not close the country's relocation funding
            gap.
          </p>
          <p>
            It does something more modest: it directs some of the time,
            attention and labour brought by tourism towards work already
            being done on the islands.
          </p>
        </div>
      </article>
    </section>
  );
}
