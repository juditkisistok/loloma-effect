import styles from "./Ref.module.css";

export function Ref({ n, href, label }) {
  return (
    <sup className={styles.sup}>
      <a
        className={styles.ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label ? `Reference ${n}: ${label}` : `Reference ${n}`}
      >
        {n}
      </a>
    </sup>
  );
}
