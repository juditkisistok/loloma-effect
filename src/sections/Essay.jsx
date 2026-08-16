import { format } from "d3";
import { useEffect, useMemo, useState } from "react";
import {
  loadTourismArrivals,
  parseBundledTourismArrivals,
} from "../data/tourismArrivals";
import { ArrivalsChart } from "./ArrivalsChart";
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
        </div>
      </article>
    </section>
  );
}
