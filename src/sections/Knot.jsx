import { Act } from "../scroll/Act";
import { Card } from "../components/Card";
import panelStyles from "../styles/panel.module.css";
import styles from "./Knot.module.css";


export function Knot() {
  return (
    <Act name="knot" align="center" height="165vh">
      <Card className={panelStyles.panel}>

        <p className={styles.statement}>
          Last year, nearly a million people flew to Fiji. 
        </p>
        <p className={`${panelStyles.panelBody} ${styles.body}`}>
          The flights that carried them warmed the ocean — now that ocean is
          moving Fiji’s coastline inland, village by village.
        </p>

        <p className={`${panelStyles.panelBody} ${styles.body}`}>
          And in the same breath, the money those visitors spent helped fund the
          villages’ retreat.
        </p>
      </Card>
    </Act>
  );
}
