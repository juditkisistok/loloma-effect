export const relocationFunding = {
  timeline: {
    startYear: 2019,
    endYear: 2025,
    ticks: [2019, 2022, 2024, 2025],
  },
  levy: {
    launchYear: 2019,
    sharePercent: 3,
    projectedAnnualFjd: 5_000_000,
    removedYear: 2022,
    removedMonth: "April",
  },
  replacement: {
    effectiveYear: 2022,
    sharePercent: 3,
    mechanism: "VAT on prescribed services and specified levies",
  },
  nabavatu: {
    approvedYear: 2024,
    budgetFjd: 5_900_000,
    committedYear: 2025,
    committedFjd: 3_500_000,
  },
  partnerContribution: {
    announcedMonth: "December",
    announcedYear: 2025,
    donor: "New Zealand",
    amountLabel: "$5M",
    currencySpecified: false,
  },
  context: {
    relocatedCommunities: 6,
    assessedCommunities: 43,
    asOfYear: 2025,
  },
  sources: [
    {
      title: "Fiji Prime Minister's Office",
      url: "https://www.fiji.gov.fj/",
    },
    {
      title: "Fiji Revenue and Customs Service",
      url: "https://www.frcs.org.fj/",
    },
    {
      title: "Fiji Cabinet",
      url: "https://www.fiji.gov.fj/",
    },
    {
      title: "Parliament of Fiji",
      url: "https://www.parliament.gov.fj/",
    },
  ],
};

export const nabavatuGapFjd =
  relocationFunding.nabavatu.budgetFjd -
  relocationFunding.nabavatu.committedFjd;
