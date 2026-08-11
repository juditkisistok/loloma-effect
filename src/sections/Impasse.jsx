import { Act } from "../scroll/Act";
import { Card } from "../components/Card";
import panelStyles from "../styles/panel.module.css";
import styles from "./Impasse.module.css";


export function Impasse() {
  return (
    <Act name="impasse" align="center" height="165vh">
      <Card className={panelStyles.panel}>
        <p className={styles.statement}>
          Fiji can't ask them to stop coming — tourism is, after all, a core part of their economy.</p>

          <p className={`${panelStyles.panelBody} ${styles.body}`}>
            Inconveniently enough, the thing doing the damage and the thing keeping the country afloat are the same thing.
        </p>

        <p className={styles.turn}>
          So Fiji has not asked its visitors to leave — instead, it has asked
          them for something a bit more curious.
        </p>
      </Card>
    </Act>
  );
}
