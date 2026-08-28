import styles from "./Methods.module.css";

const rows = [
  {
    name: "Visitor arrivals",
    source: "Pacific Data Hub / SPC; Fiji Bureau of Statistics",
    url: "https://pacificdata.org/data/dataset/tourism-arrivals-df-tourism-arrivals",
    method: "Annual TOUR series. Fiji Bureau values replace the rounded 2006 and inconsistent 2024 entries, and supply preliminary 2025. Same-day excursionists are excluded so every year uses one definition.",
    licence: "Pacific Data Hub: Other (Open); national supplements cited at source.",
  },
  {
    name: "Shoreline snapshots",
    source: "Digital Earth Pacific / Pacific Data Hub",
    url: "https://pacificdata.org/data/dataset/dep_ls_coastlines",
    method: "Good-certainty 1999, 2007, 2015 and 2023 vectors. The rate is the nearest good, significant point in the full extracted extent; intermediate animation frames are not observations.",
    licence: "CC BY-NC 4.0.",
  },
  {
    name: "Flight comparison",
    source: "UK government conversion factors; Our World in Data",
    url: "https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025",
    method: "Return great-circle distance multiplied by 2025 long-haul economy factors. Direct CO₂ is compared with Fiji territorial CO₂; fuel-supply, trace-gas and non-CO₂ effects remain visibly separate.",
    licence: "UK Open Government Licence; OWID attribution terms.",
  },
  {
    name: "Relocation map",
    source: "Fiji Climate Change Division / UNOSAT; geoBoundaries",
    url: "https://www.geoboundaries.org/countryDownloads.html",
    method: "Public coordinates from the 2023 completed-relocation and 2022 adaptation-survey layers. The 43-community figure is a 2025 national screening total, not 43 mapped relocation sites.",
    licence: "gbOpen boundary: CC BY 4.0; source GIS attribution retained.",
  },
  {
    name: "Relocation funding",
    source: "Fiji law, Cabinet and Parliament",
    url: "https://www.laws.gov.fj/Acts/ViewSection/63007?query=plastic+bottle",
    method: "Nominal Fiji-dollar commitments. The ECAL ended in 2022, while a 3% allocation from prescribed-service VAT and specified levies continued.",
    licence: "Official public records; links supplied in the essay.",
  },
  {
    name: "Loloma Hour",
    source: "Tourism Fiji",
    url: "https://www.fiji.travel/loloma-hour",
    method: "Reported programme totals, April 2025–April 2026. Environmental outcomes are parallel totals, not conversions from volunteer hours or carbon offsets.",
    licence: "Official programme reporting; attribution retained.",
  },
];

export function Methods() {
  return (
    <aside className={styles.wrap} aria-label="Data sources and methods">
      <details>
        <summary>Data, methods & licences</summary>
        <p className={styles.intro}>
          Sources were checked in August 2026. Values are displayed at the
          precision supported by their source; provisional and non-comparable
          measures are labelled in the graphic.
        </p>
        <div className={styles.rows}>
          {rows.map((row) => (
            <section key={row.name} className={styles.row}>
              <h3>{row.name}</h3>
              <p><a href={row.url} target="_blank" rel="noreferrer">{row.source}</a></p>
              <p>{row.method}</p>
              <small>{row.licence}</small>
            </section>
          ))}
        </div>
      </details>
    </aside>
  );
}
