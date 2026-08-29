import styles from "./Methods.module.css";

const rows = [
  {
    name: "Visitor arrivals",
    source: "Pacific Data Hub / SPC; Fiji Bureau of Statistics",
    url: "https://pacificdata.org/data/dataset/tourism-arrivals-df-tourism-arrivals",
    method: "Annual TOUR series. Pacific Data supplies 1995–2024; the Fiji Bureau supplies the missing provisional 2025 total. Same-day excursionists are excluded so every year uses one definition.",
    licence: "Pacific Data Hub: Other (Open); the 2025 national supplement is cited at source.",
  },
  {
    name: "Shoreline snapshots",
    source: "Digital Earth Pacific / Pacific Data Hub",
    url: "https://pacificdata.org/data/dataset/dep_ls_coastlines",
    method: "Tivua Island is the only closed outline in the extracted Lautoka–Nadi subset with good-certainty vectors in all four selected years: 1999, 2007, 2015 and 2023. It is a site-specific case study, not a national trend. Its rate is the nearest good, significant point in the full extracted extent, selected without filtering by magnitude; intermediate animation frames are not observations. A 3,838-point local distribution provides context.",
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
    source: "Fiji Climate Change Division / UNOSAT; Parliament of Fiji; geoBoundaries",
    url: "https://www.geoboundaries.org/countryDownloads.html",
    method: "Public coordinates from the 2023 completed-relocation and 2022 adaptation-survey layers. The 43-community figure is a 2025 national screening total, not 43 mapped relocation sites.",
    licence: "gbOpen boundary: CC BY 4.0; source GIS attribution retained.",
  },
  {
    name: "Loloma Hour",
    source: "Tourism Fiji",
    url: "https://www.fiji.travel/loloma-hour",
    method: "Annual-results totals transcribed from Tourism Fiji. The 17,407 hours comprise wildlife (4,581), reef (3,390), community (5,672) and coastline (3,764) activities. Each circular ring represents 5,000 hours—the programme's first-year target—and categories continue from one ring to the next. The four illustrated outcomes are additional programme totals; image size is decorative, not proportional.",
    licence: "Numeric facts transcribed from official programme reporting; source attribution retained.",
  },
  {
    name: "Illustrative imagery",
    source: "Images AI-generated with OpenAI",
    url: "https://openai.com/",
    method: "The bucket, coral, mangrove and tree cutouts do not reproduce existing photographs. Real-world imagery and species material were consulted only to guide their visual and ecological detail.",
    references: [
      {
        label: "Give Clean Water — Project Fiji",
        url: "https://givecleanwater.org/project-fiji/",
      },
      {
        label: "MES Fiji — mangrove ecosystems",
        url: "https://mesfiji.org/resources/environment/mangrovewetland-ecosystems",
      },
      {
        label: "FAO — Fiji mangrove vegetation",
        url: "https://www.fao.org/4/j1533e/j1533e68.htm",
      },
      {
        label: "Oceanlight — Vatu-i-Ra coral photography",
        url: "https://www.oceanlight.com/log/diving-the-vatu-i-ra-passage-in-fijis-bligh-waters.html",
      },
      {
        label: "WWF — Kabara vesi factsheet",
        url: "https://wwfasia.awsassets.panda.org/downloads/kabara_email_1.pdf",
      },
      {
        label: "Tetiaroa Society — Pandanus tectorius",
        url: "https://www.tetiaroasociety.org/biosphere-tetiaroa/pandanus-tectorius",
      },
      {
        label: "Tetiaroa Society — atoll vegetation",
        url: "https://www.tetiaroasociety.org/programs/research/water-use-rates-of-tropical-atoll-vegetation",
      },
    ],
    licence: "No reference photograph is reproduced; linked photography and publications remain the property of their respective creators and publishers.",
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
              {row.references && (
                <p>
                  Visual and ecological references: {row.references.map((reference, index) => (
                    <span key={reference.url}>
                      {index > 0 ? "; " : ""}
                      <a href={reference.url} target="_blank" rel="noreferrer">
                        {reference.label}
                      </a>
                    </span>
                  ))}.
                </p>
              )}
              <small>{row.licence}</small>
            </section>
          ))}
        </div>
      </details>
    </aside>
  );
}
