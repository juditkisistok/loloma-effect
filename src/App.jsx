import { ScrollStage } from "./scroll/ScrollStage";
import { useStage } from "./scroll/stageContext";
import { Scene } from "./scene/Scene";
import { Hero } from "./sections/Hero";
import { Knot } from "./sections/Knot";
import { Impasse } from "./sections/Impasse";
import { Essay } from "./sections/Essay";
import { Close } from "./sections/Close";
import styles from "./App.module.css";
import scrollSceneStyles from "./styles/scrollScene.module.css";

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
      <div className={scrollSceneStyles.wrap} ref={wrapRef}>
        <div className={scrollSceneStyles.sticky}>
          <Scene />
        </div>

        <div className={scrollSceneStyles.steps}>
          <Hero />
          <Knot />
          <Impasse />
        </div>
      </div>

      <Essay />
      <Close />
    </div>
  );
}
