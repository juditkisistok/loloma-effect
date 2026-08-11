import styles from "./Essay.module.css";

export function Essay() {
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
    </section>
  );
}
