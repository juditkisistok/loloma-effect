import { ScrollStage } from "./scroll/ScrollStage";
import { useStage } from "./scroll/stageContext";
import { Scene } from "./scene/Scene";
import { Hero } from "./sections/Hero";
import { Knot } from "./sections/Knot";
import { Impasse } from "./sections/Impasse";
import styles from "./App.module.css";

export default function App() {
  return (
    <ScrollStage>
      <Stage />
    </ScrollStage>
  );
}

function Stage() {
  const { wrapRef } = useStage();

  return (
    <div className={styles.root}>
      <div className={styles.wrap} ref={wrapRef}>
        <div className={styles.sticky}>
          <Scene />
        </div>

        <div className={styles.steps}>
          <Hero />
          <Knot />
          <Impasse />
        </div>
      </div>

    </div>
  );
}
