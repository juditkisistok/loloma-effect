import { Act } from "../scroll/Act";
import { Card } from "../components/Card";
import { Ref } from "../components/Ref";
import panelStyles from "../styles/panel.module.css";
import styles from "./Knot.module.css";


export function Knot() {
  return (
    <Act name="knot" align="center" height="165vh">
      <Card className={panelStyles.panel}>
        <p className={styles.statement}>
          In 2025, Fiji welcomed nearly a million visitors.
        </p>
        <p className={`${panelStyles.panelBody} ${styles.body}`}>
          Tourism brings jobs, income, and opportunity — accounting for around
          40% of the country’s GDP.
          <Ref
            n="2"
            href="https://www.finance.gov.fj/wp-content/uploads/2024/02/Fact-Sheet-Tourism.pdf"
            label="Fiji Ministry of Finance Tourism Fact Sheet"
          />{" "}
          But bringing visitors carries a climate cost: the emissions from
          their journeys add to the pressures already reshaping Fiji’s coasts.
        </p>
        <p className={`${panelStyles.panelBody} ${styles.body}`}>
          At the same time, some of the money tourists spend is helping pay to
          relocate communities already losing ground to the rising ocean.
        </p>
        <p className={`${panelStyles.panelBody} ${styles.body}`}>
          The problem and part of the response are deeply intertwined.
        </p>
      </Card>
    </Act>
  );
}
