import { useId } from "react";
import styles from "./Ref.module.css";

export function Ref({ n, href, label }) {
  const tooltipId = useId();

  return (
    <sup className={styles.sup}>
      <span className={styles.wrap}>
        <a
          className={styles.ref}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Reference ${n}`}
          aria-describedby={label ? tooltipId : undefined}
        >
          {n}
        </a>
        {label && (
          <span className={styles.popover} id={tooltipId} role="tooltip">
            {label}
          </span>
        )}
      </span>
    </sup>
  );
}
