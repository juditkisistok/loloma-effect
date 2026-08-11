import { Act } from "../scroll/Act";
import { Card } from "../components/Card";
import panelStyles from "../styles/panel.module.css";
import styles from "./Impasse.module.css";


export function Impasse() {
  return (
    <Act name="impasse" align="center" height="165vh">
      <Card className={panelStyles.panel}>
        <p className={styles.statement}>
        The problem and part of the response are deeply intertwined: Fiji can't simply ask people to stop coming.
        </p>

        <p className={`${panelStyles.panelBody} ${styles.body}`}>
          So the question becomes:
        </p>

        <p className={styles.turn}>
          How do you keep tourism thriving without leaving the archipelago to
          carry the burden alone?
        </p>
      </Card>
    </Act>
  );
}
