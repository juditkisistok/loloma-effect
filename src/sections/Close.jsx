import { useState } from "react";
import { Act } from "../scroll/Act";
import { Card } from "../components/Card";
import { Scene } from "../scene/Scene";
import { duskTheme } from "../scene/sceneThemes";
import { clamp } from "../lib/math";
import { useFrame } from "../scroll/stageContext";
import panelStyles from "../styles/panel.module.css";
import styles from "./Close.module.css";

const farewellLines = [
  "Fiji cannot simply ask people to stop coming.",
  "Loloma Hour asks them not to come empty-handed.",
  "So come.",
  "Stay.",
  "And while you are here,",
  "give an hour.",
];

export function Close() {
  const [coralsOn, setCoralsOn] = useState(false);
  const [lights, setLights] = useState({ on: false, climb: 0 });

  useFrame((frame) => {
    const coralProgress = frame.act("close2");
    const nextCoralsOn = coralProgress > 0.03;
    setCoralsOn((current) => (current !== nextCoralsOn ? nextCoralsOn : current));

    const lightProgress = frame.act("close5");
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
          toneEnd="close5"
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
            <p className={styles.lead}>
              We tend to think about travel in terms of what we get to take
              home.
            </p>
            <p className={styles.support}>
              A view. A story. A photograph. A memory of having been
              somewhere beautiful.
            </p>
          </Card>
        </Act>

        <Act name="close2" align="center" height="120vh">
          <Card className={`${panelStyles.panel} ${styles.beat}`}>
            <p className={styles.lead}>
              Loloma asks whether travel can contain something moving in the
              other direction too.
            </p>
            <p className={styles.support}>
              A mangrove planted into a damaged shoreline. A piece of reef
              restored. An hour spent learning about a place from the people
              who live there.
            </p>
            <p className={styles.support}>
              Not payment for having come. Not absolution. Just reciprocity.
            </p>
          </Card>
        </Act>

        <Act name="close3" align="center" height="120vh">
          <Card className={`${panelStyles.panel} ${styles.beat}`}>
            <p className={styles.lead}>
              One hour cannot carry the weight of Fiji's climate problem, and
              it should not have to.
            </p>
            <p className={styles.support}>
              The larger responsibility still belongs with governments,
              businesses and the countries that have contributed most to
              global emissions.
            </p>
            <p className={styles.support}>
              Loloma does not ask a visitor to fix Fiji. It asks them to arrive
              as more than a consumer — and to recognise that being welcomed
              somewhere can also mean giving something back.
            </p>
          </Card>
        </Act>

        <Act name="close4" align="center" height="130vh">
          <Card className={`${panelStyles.panel} ${styles.finalBeat}`}>
            <div className={styles.farewell}>
              {farewellLines.map((line) => (
                <p key={line} className={styles.line}>
                  {line}
                </p>
              ))}
            </div>
          </Card>
        </Act>

        <Act name="close5" align="start" height="140vh">
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
