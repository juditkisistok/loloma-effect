import { Act } from "../scroll/Act";
import { Card } from "../components/Card";
import { Ref } from "../components/Ref";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <Act name="hero" align="center">
      <Card className={styles.hero}>
        <h1 className={styles.title}>The Loloma Effect</h1>

        <p className={styles.definition}>
          loloma <span className={styles.lang}>(Fijian)</span>{" "}
          <span className={styles.pos}>n.</span> — to act with
          generosity, driven by love; the deep care that Fijians hold for their

          land, their ocean, and each other.<Ref n={1} href="https://www.fiji.travel/loloma-hour" label="Tourism Fiji · Loloma Hour" />
          
        </p>
      </Card>
    </Act>
  );
}
