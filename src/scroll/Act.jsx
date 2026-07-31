import { useEffect, useRef } from "react";
import { useStage } from "./stageContext";
import styles from "./Act.module.css";

export function Act({ name, align = "start", height = "150vh", children }) {
  const { registerSection } = useStage();
  const ref = useRef(null);

  useEffect(() => registerSection(name, ref.current), [name, registerSection]);

  return (
    <section
      ref={ref}
      data-act={name}
      className={styles.act}
      style={{ minHeight: height, justifyContent: JUSTIFY[align] }}
    >
      {children}
    </section>
  );
}

const JUSTIFY = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};
