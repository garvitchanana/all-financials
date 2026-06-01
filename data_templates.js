// data_templates.js — ALL FINANCIALS Editorial Mosaic Database
// Initial empty terminal configuration for Garvit Chanana

const ALL_FINANCIALS_DATA = {

  ticker: [
    { name: "Nifty 50", value: "22,857.40", change: "+0.38%", positive: true },
    { name: "DXY", value: "104.62", change: "-0.15%", positive: false },
    { name: "US 10Y Treasury", value: "4.412%", change: "+2.4 bps", positive: true },
    { name: "Gold", value: "$2,348.60", change: "+0.82%", positive: true },
    { name: "Silver", value: "$30.42", change: "+1.65%", positive: true },
    { name: "Liquid Mkt Env Yield", value: "6.85%", change: "-2.1 bps", positive: false },
    { name: "ST Debt Yield Index", value: "7.28%", change: "+1.2 bps", positive: true }
  ],

  // Clear pre-seeded editorial content to start fresh
  section1: { title: "THE FRONT PAGE", articles: [] },
  section2: { title: "THE DAILY BRIEF", subtitle: "10 developments parsed for maximum executive leverage", articles: [] },
  section3: { title: "REGULATORY & AUDIT DESK", articles: [] },
  section4: { title: "GLOBAL CORPORATE FRAUD & COMPLIANCE WATCH", articles: [] },
  section5: { title: "STRATEGY, AI & CAPITAL MARKETS DESK", articles: [] },

  // ── SECTION 6: CORE FRAMEWORK MATRIX ──────────────────────
  frameworks: [
    {
      id: "fw_transfer_pricing",
      name: "Transfer Pricing Documentation Audit — CA Final Group 2",
      week: "Week 22",
      steps: [
        "1. Identify all international transactions and specified domestic transactions under Section 92B/92BA.",
        "2. Select the Most Appropriate Method (MAM) from CUP, RPM, CPM, TNMM, or PSM — document rationale with benchmarking study.",
        "3. Prepare TP documentation per Rule 10D: enterprise overview, functional analysis (FAR), economic analysis, and comparable selection.",
        "4. Compute Arm's Length Price (ALP) using selected method. Apply the ±3% tolerance band per proviso to Section 92C(2).",
        "5. File Form 3CEB (TP Audit Report) — mandatory where aggregate international transactions exceed ₹1 crore.",
        "6. Cross-verify Country-by-Country Report (CbCR) filing obligations under Section 286 for parent entities with consolidated revenue > ₹5,500 crore."
      ]
    },
    {
      id: "fw_gst_itc",
      name: "GST Rule 42/43 — ITC Reversal & Credit Attribution Framework",
      week: "Week 23",
      steps: [
        "1. Segregate total ITC into inputs used exclusively for taxable supplies (T), exempt supplies (E), and common inputs (C).",
        "2. Apply Rule 42 proportional formula: Common ITC attributable to exempt = C × (Exempt Turnover / Total Turnover). This amount must be reversed.",
        "3. For capital goods under Rule 43: compute useful life (60 months / 20 quarters), calculate ITC per quarter, reverse proportionally for exempt use.",
        "4. Verify that turnover calculations exclude GST component, include zero-rated supplies in taxable turnover, and correctly treat land/building sales.",
        "5. Post reversal entries in GSTR-3B Table 4(B)(1) for permanent reversals. Track provisional reversals for annual reconciliation.",
        "6. Perform final annual reconciliation in GSTR-9: compare total ITC claimed versus ITC eligible after applying Rule 42/43 across all tax periods."
      ]
    },
    {
      id: "fw_pe_exposure",
      name: "Permanent Establishment (PE) Exposure Audit — International Tax",
      week: "Week 24",
      steps: [
        "1. Identify fixed place PE risk under Article 5(1) of applicable DTAA: check for offices, branches, factories, or warehouses in source jurisdiction.",
        "2. Assess Service PE exposure under Article 5(2)(l) / UN Model: verify if employees/consultants spent >183 days in the source country within any 12-month period.",
        "3. Evaluate Dependent Agent PE under Article 5(5): check if any local agent habitually exercises authority to conclude contracts on behalf of the enterprise.",
        "4. Compute profits attributable to PE under Article 7 using functionally separate entity approach — apply Transfer Pricing arm's length principles.",
        "5. Verify force-of-attraction rule applicability: assess whether profits from activities outside the PE but similar in nature get attributed to the PE.",
        "6. Document POEM (Place of Effective Management) analysis under Section 6(3) for companies claiming non-resident status despite Indian operational substance."
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ALL_FINANCIALS_DATA };
} else {
  window.ALL_FINANCIALS_DATA = ALL_FINANCIALS_DATA;
}
