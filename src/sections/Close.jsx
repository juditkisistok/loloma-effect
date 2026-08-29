import { useState } from "react";
import { Act } from "../scroll/Act";
import { Card } from "../components/Card";
import { Scene } from "../scene/Scene";
import { duskTheme } from "../scene/sceneThemes";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import panelStyles from "../styles/panel.module.css";
import styles from "./Close.module.css";

export function Close() {
  const [coralsOn, setCoralsOn] = useState(false);
  const [lights, setLights] = useState({ on: false, climb: 0 });

  useFrame((frame) => {
    const coralProgress = frame.act("close2");
    const nextCoralsOn = coralProgress > 0.03;
    setCoralsOn((current) => (current !== nextCoralsOn ? nextCoralsOn : current));

    const lightProgress = frame.act("close4");
    const nextOn = lightProgress > 0.04;
    const nextClimb = clamp((lightProgress - 0.04) / 0.9, 0, 1);
    setLights((current) =>
      current.on !== nextOn || Math.abs(current.climb - nextClimb) > 0.002
        ? { on: nextOn, climb: nextClimb }
        : current,
    );
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.sticky}>
        <Scene
          theme={duskTheme}
          toneStart="close1"
          toneEnd="close4"
          idPrefix="dusk"
          corals
          coralsOn={coralsOn}
          lights
          lightsOn={lights.on}
          lightsClimb={lights.climb}
        />
      </div>

      <div className={styles.steps}>
        <Act name="close1" align="center" height="110vh">
          <Card className={`${panelStyles.panel} ${styles.beat}`}>
            <p className={styles.framing}>
              We tend to think about travel in terms of what we take home.
            </p>
            <br/>
            <p className={styles.framing}>A view.</p>
            <p className={styles.framing}>A story.</p>
            <p className={styles.framing}>A photograph.</p>
            <p className={styles.turn}>
              The memory of having been somewhere beautiful.
            </p>
          </Card>
        </Act>

        <Act name="close2" align="center" height="120vh">
          <Card className={`${panelStyles.panel} ${styles.beat}`}>
            <p className={styles.turn}>
              Loloma Hour asks what might move in the other direction.
            </p>
            <br/><p className={styles.framing}>
              A mangrove taking root at the water's edge.
            </p>
            <p className={styles.framing}>Coral planted on a reef.</p>
            <br/><p className={styles.framing}>
              An hour spent learning from the people who call this place home.
            </p>
          </Card>
        </Act>

        <Act name="close3" align="center" height="165vh">
          <Card className={`${panelStyles.panel} ${styles.beat}`}>
            <p className={styles.framing}>
              Fiji cannot simply ask people to stop coming — nor can an hour
              solve the archipelago's climate challenge. But that hour can
              shift the relationship between visitor and host: from simply
              consuming a place to caring for one that has welcomed you.
            </p>
            <p className={styles.turn}>
              So come. Stay. <br/>And while you are here, give an hour.
            </p>
          </Card>
        </Act>

        <Act name="close4" align="start" height="140vh">
          <div className={styles.vinakaLock}>
            <Card>
              <p className={styles.vinaka}>Vinaka.</p>
            </Card>
          </div>
        </Act>
      </div>
    </div>
  );
}
