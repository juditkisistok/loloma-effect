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
              ? `${latestArrivals} people came to Fiji in ${storyEndYear}. More than in any year before. Follow the line back and visitor numbers have risen dramatically since the turn of the century. There is one sharp interruption in 2020, when international travel stopped almost overnight. Then the visitors returned. And in 2025, Fiji recorded its busiest year yet.`
              : ""}
          </p>
        </div>

        <div className={styles.dataBlock}>
          <div className={styles.dataHeader}>
            <h3>Visitor arrivals to Fiji</h3>
            <p>Annual arrivals, 1999-2025</p>
          </div>
          <ArrivalsChart rows={rows} />
        </div>
      </article>
    </section>
  );
}
