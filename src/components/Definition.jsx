import { useId } from "react";
import styles from "./Definition.module.css";

export function Definition({ children, definition, label }) {
  const tooltipId = useId();

  return (
    <span
      className={styles.term}
      tabIndex="0"
      aria-label={label}
      aria-describedby={tooltipId}
    >
      {children}
      <span className={styles.popover} id={tooltipId} role="tooltip">
        {definition}
      </span>
    </span>
  );
}
