// data_templates.js — ALL FINANCIALS Editorial Mosaic Database
// Curated intelligence feed for Garvit Chanana

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

  // ── SECTION 1: FRONT PAGE MOSAIC ──────────────────────────
  section1: {
    title: "THE FRONT PAGE",
    articles: [
      {
        id: "fp_hero",
        span: "hero",
        priority: "Critical",
        title: "RBI Rewrites Infrastructure Lending Rulebook: Provisioning for Under-Construction Projects Jumps from 0.4% to 5%",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
        rawGazette: "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
        rawGazetteLabel: "RBI Notification Portal",
        marketLens: "https://bfsi.economictimes.indiatimes.com/articles/rbis-revised-project-finance-norms-a-game-changer-for-infrastructure-discipline/131362086",
        marketLensLabel: "ET BFSI Deep Dive",
        sourceTier: 1,
        whatHappened: "The Reserve Bank of India issued a landmark circular escalating standard asset provisioning for under-construction infrastructure credit facilities from 0.4% to a steep 5.0%, effective for all new project finance sanctions. The directive also mandates quarterly stress-testing of project cash flow models by lending banks.",
        whyItMatters: "This regulatory capital charge directly increases the cost of infrastructure credit by an estimated 50–75 bps, forcing commercial banks to reprice project finance pipelines. Public-private partnership (PPP) viability models require immediate recalibration across the board.",
        impact: "Strategy consulting divisions must advise infrastructure clients to restructure capital stacks with higher equity contributions. Wealth managers should monitor listed infrastructure NBFCs for margin compression signals."
      },
      {
        id: "fp_feat1",
        span: "feature",
        priority: "Critical",
        title: "Cabinet Clears ₹39,360 Crore for Two New Semiconductor Fabrication Units Under India Semiconductor Mission",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://pib.gov.in/allRelease.aspx",
        rawGazetteLabel: "PIB Official Release",
        marketLens: "https://m.economictimes.com/industry/cons-products/electronics/cabinet-approves-two-new-semiconductor-units-worth-rs-3936-crore-under-india-semiconductor-mission/articleshow/130830439.cms",
        marketLensLabel: "ET Semiconductor Coverage",
        sourceTier: 1,
        whatHappened: "The Union Cabinet approved direct 50% fiscal capital subsidies for two advanced semiconductor fabrication plants, marking the largest single tranche of industrial CAPEX incentives in India's manufacturing history.",
        whyItMatters: "Establishes India as a credible alternative node in the global chip supply chain, reducing strategic dependence on East Asian fabrication clusters.",
        impact: "Consultants must structure localization advisory mandates for multinational chip designers seeking Indian JV partners across Nifty 500 conglomerates."
      },
      {
        id: "fp_feat2",
        span: "feature",
        priority: "Important",
        title: "Federal Reserve Minutes Confirm Extended 'Higher-for-Longer' Monetary Corridor Through 2026",
        image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
        rawGazetteLabel: "Federal Reserve FOMC Portal",
        marketLens: "https://www.reuters.com/markets/us/fed-officials-worried-about-sticky-inflation-may-minutes-show-2024-05-22/",
        marketLensLabel: "Reuters Fed Analysis",
        sourceTier: 1,
        whatHappened: "FOMC minutes reveal deep-seated anxiety among board members regarding sticky core inflation vectors. Several participants expressed willingness to tighten further if upside risks materialize.",
        whyItMatters: "Postpones structural yield curve normalization, anchoring global borrowing costs at multi-decade highs. Debt service coverage ratios for leveraged corporate borrowers face severe compression.",
        impact: "Wealth desks should lock in high-quality yields in medium-duration bonds. Corporate advisory teams must advise clients to extend working capital facilities and hedge debt exposures."
      }
    ]
  },

  // ── SECTION 2: THE DAILY BRIEF ────────────────────────────
  section2: {
    title: "THE DAILY BRIEF",
    subtitle: "10 developments parsed for maximum executive leverage",
    articles: [
      {
        id: "db_1", priority: "Critical",
        title: "PIB: Direct Tax Collections Surge 17.7% YoY, Exceeding Revised Fiscal Estimates",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://pib.gov.in/allRelease.aspx",
        rawGazetteLabel: "PIB Fiscal Data",
        marketLens: "https://www.business-standard.com/economy/news/direct-tax-mop-up-in-fy25-rises-about-18-to-over-rs-22-lakh-cr-provisional-data-125040100624_1.html",
        marketLensLabel: "Business Standard Coverage",
        sourceTier: 1,
        whatHappened: "Gross direct tax collections for FY25–26 reached a historic peak, driven by corporate profitability and enhanced personal income tax filing compliance across urban centres.",
        whyItMatters: "Provides the fiscal authority headroom to sustain infrastructure expenditure budgets without expanding the structural deficit beyond the 5.1% GDP target.",
        impact: "Sustains positive momentum for domestic-focused industrials. Portfolio allocators can maintain overweight stances on infrastructure-adjacent Nifty 500 sectors."
      },
      {
        id: "db_2", priority: "Important",
        title: "SEBI Mandates Enhanced Beneficial Ownership Disclosures for Concentrated FPIs",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.sebi.gov.in/legal/circulars.html",
        rawGazetteLabel: "SEBI Circulars",
        marketLens: "https://www.livemint.com/market/stock-market-news/sebi-tightens-rules-for-fpis-holding-over-50-assets-in-single-group-11708076622283.html",
        marketLensLabel: "Livemint Market Desk",
        sourceTier: 1,
        whatHappened: "SEBI enforced granular disclosure requirements for FPIs holding over 50% of equity AUM in a single corporate group, targeting disguised promoter holdings.",
        whyItMatters: "Restricts offshore structures from circumventing minimum public shareholding rules and limits concentrated market manipulation risk.",
        impact: "Wealth managers must review offshore fund structures and shift allocations out of highly concentrated promoter group equities."
      },
      {
        id: "db_3", priority: "Important",
        title: "Nifty 500 Q4 Earnings Show Median Gross Margin Contraction of 120 bps on Input Cost Inflation",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.nseindia.com/companies-listing/corporate-filings-financial-results",
        rawGazetteLabel: "NSE Corporate Filings",
        marketLens: "https://www.livemint.com/market/stock-market-news/q4-results-today-live-updates-tcs-infosys-hcl-tech-wipro-hdfc-bank-icici-bank-indusind-bank-11713159159505.html",
        marketLensLabel: "Livemint Q4 Results Tracker",
        sourceTier: 1,
        whatHappened: "Q4 earnings across Nifty 500 companies reveal margin compression driven by specialty chemical prices, commodity inflation, and rising executive wage bills.",
        whyItMatters: "Revenue growth remains robust but operational leverage has turned negative as companies struggle to pass costs to end consumers.",
        impact: "Consulting teams must execute organizational cost restructuring and automated operational friction playbooks for corporate clients."
      },
      {
        id: "db_4", priority: "Watchlist",
        title: "Global Ocean Freight Rates Spike 35% in Four Weeks on Red Sea Shipping Disruptions",
        image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.oecd.org/en/publications/oecd-economic-outlook_16097408.html",
        rawGazetteLabel: "OECD Economic Outlook",
        marketLens: "https://www.ft.com/stream/be349267-2780-4df5-a4a0-1e1a8f4cb51f",
        marketLensLabel: "FT Supply Chain Watch",
        sourceTier: 1,
        whatHappened: "Geopolitical chokepoints in the Red Sea and structural congestion at major transshipment hubs have triggered a physical container shortage.",
        whyItMatters: "Reintroduces micro-level supply chain inflationary vectors and risks core component inventory shortages for manufacturers.",
        impact: "Supply chain consulting leads must immediately review near-shoring strategies and buffer stock provisions for corporate clients."
      },
      {
        id: "db_5", priority: "Watchlist",
        title: "DXY Dollar Index Consolidation Near 104.60 Compresses Emerging Market Currency Corridors",
        image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.bis.org/publ/qtrpdf/r_qt2403.htm",
        rawGazetteLabel: "BIS Quarterly Review",
        marketLens: "https://www.reuters.com/markets/currencies/",
        marketLensLabel: "Reuters Currency Desk",
        sourceTier: 1,
        whatHappened: "The US Dollar Index consolidated near 104.60, supported by persistent yield differentials and hawkish Fed forward guidance.",
        whyItMatters: "Forces EM central banks to maintain elevated real interest rates to defend currency corridors, limiting domestic credit expansion room.",
        impact: "Corporate treasuries with USD exposure must implement rolling hedging strategies using options corridors to protect operating margins."
      },
      {
        id: "db_6", priority: "Important",
        title: "Fortune 500 GCC Migration Accelerates: 45+ Companies Announce India Back-Office Relocations",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.mckinsey.com/capabilities/operations/our-insights",
        rawGazetteLabel: "McKinsey Operations",
        marketLens: "https://economictimes.indiatimes.com/tech/technology/indias-global-capability-centres-to-employ-2-5-million-by-2030-nasscom/articleshow/113330990.cms",
        marketLensLabel: "ET GCC Coverage",
        sourceTier: 2,
        whatHappened: "Over 45 Fortune 500 enterprises confirmed plans to migrate core finance, accounting, and IT operations to India-based Global Capability Centers (GCCs) in Q1 2026.",
        whyItMatters: "Highlights an intense corporate drive to centralize administrative costs and infuse RPA/agentic AI workflows into back-office friction points.",
        impact: "Strategy consulting firms have immediate mandates to design large-scale GCC operating models and transition management programmes."
      },
      {
        id: "db_7", priority: "Important",
        title: "Nifty Infrastructure Index M&A: Conglomerates Bid for Cold-Chain and Q-Commerce Logistics Operators",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListingAll=yes&cid=3",
        rawGazetteLabel: "SEBI Takeover Filings",
        marketLens: "https://economictimes.indiatimes.com/industry/transportation/shipping-/-transport/logistics-companies-acquisitions-and-funding/articleshow/111891009.cms",
        marketLensLabel: "ET Logistics M&A",
        sourceTier: 1,
        whatHappened: "Major Nifty 500 infrastructure developers initiated acquisition bids for mid-sized cold-chain operators to scale quick-commerce delivery networks.",
        whyItMatters: "Strategic consolidation driven by the realization that last-mile logistics bottlenecks limit top-line scaling for organized retail and D2C brands.",
        impact: "PE/VC strategy associates must perform target screening for warehousing, multi-modal transit, and temperature-controlled asset portfolios."
      },
      {
        id: "db_8", priority: "Watchlist",
        title: "Gold and Silver Rally as Institutional Demand for Hard-Asset Hedges Surges Against Sovereign Debt Expansion",
        image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.imf.org/en/Publications/WEO",
        rawGazetteLabel: "IMF World Economic Outlook",
        marketLens: "https://www.ft.com/gold",
        marketLensLabel: "FT Gold Markets",
        sourceTier: 1,
        whatHappened: "Gold advanced to $2,348 and Silver to $30.42, reflecting accelerating central bank physical purchases and investor demand for tangible inflation hedges.",
        whyItMatters: "Highlights structural concern over persistent fiscal deficits and paper-currency dilution in Western developed markets.",
        impact: "Wealth managers should maintain a structural 8–12% precious metals allocation as a portfolio tail-risk hedge."
      },
      {
        id: "db_9", priority: "Watchlist",
        title: "Deloitte-ICAI Joint Advisory Flags Segment Disclosure Gaps for Multi-Divisional Conglomerates Under Ind AS 108",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://www.icai.org/post.html?post_id=18984",
        rawGazetteLabel: "ICAI Technical Advisory",
        marketLens: "https://www.taxmann.com/research/company-and-sebi/top-story/105010000000022762/audit-trail-management-auditors-responsibilities-compliance-requirements-%E2%80%93analysis-with-reference-to-amendments-effective-from-1-4-2023-experts-opinion",
        marketLensLabel: "Taxmann Expert Commentary",
        sourceTier: 2,
        whatHappened: "Deloitte released enhanced guidance on Segment Reporting under Ind AS 108, requiring detailed disclosure of inter-segment SPV financing profiles.",
        whyItMatters: "Aims to expose off-balance sheet SPV structures and related-party financing loops to primary market investors and auditors.",
        impact: "Audit managers must adjust internal checklists to trace segment allocation formulas and verify management's aggregation criteria."
      },
      {
        id: "db_10", priority: "Important",
        title: "Airbnb Expands Gurugram Footprint: 46,437 sq ft Office Lease Signals Grade-A Demand Surge in Cyber City",
        image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=80&q=80",
        rawGazette: "https://nfra.gov.in/notifications",
        rawGazetteLabel: "NFRA Notifications",
        marketLens: "https://realty.economictimes.indiatimes.com/news/commercial/airbnb-expands-presence-in-gurugram-with-new-46437-sq-ft-office-lease/131420010",
        marketLensLabel: "ET Realty Tracking",
        sourceTier: 1,
        whatHappened: "Airbnb signed a significant 46,437 sq ft Grade-A commercial lease in Gurugram's Cyber City micro-market, reinforcing the corridor's position as a prime office destination.",
        whyItMatters: "Validates institutional rental yield projections of 8.2–8.6% cap rates in the Golf Course Road–Cyber City belt, drawing global sovereign fund interest.",
        impact: "Real estate advisory teams can use this benchmark to structure pitch-books for commercial office investment mandates in Delhi NCR."
      }
    ]
  },

  // ── SECTION 3: REGULATORY & AUDIT DESK ────────────────────
  section3: {
    title: "REGULATORY & AUDIT DESK",
    articles: [
      {
        id: "reg_1",
        span: "hero",
        priority: "Critical",
        title: "MCA Mandates Tamper-Proof Audit Trail (Edit Logs) for All Companies Under CARO 2020 — Auditors Must Verify Full-Year Operational Continuity",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
        rawGazette: "https://www.mca.gov.in/content/mca/global/en/notifications-orders/circulars.html",
        rawGazetteLabel: "MCA Circulars & Orders",
        marketLens: "https://www.taxmann.com/research/company-and-sebi/top-story/105010000000022762/audit-trail-management-auditors-responsibilities-compliance-requirements-%E2%80%93analysis-with-reference-to-amendments-effective-from-1-4-2023-experts-opinion",
        marketLensLabel: "Taxmann Expert Commentary",
        sourceTier: 1,
        details: "The Ministry of Corporate Affairs' strict mandate requires every company to employ accounting software with a built-in, tamper-proof audit trail that records every change to accounting entries — including the editor identity, timestamp, and original pre-edit values. Statutory auditors must explicitly verify that the audit trail was operational throughout the entire fiscal period without interruption and report exceptions under CARO 2020 Clause (xvi).",
        impact: "Forensic auditors must design automated database query scripts (SQL / Python) to validate continuous audit trail uptime and identify suspicious periods where edit-log controls were deactivated."
      },
      {
        id: "reg_2",
        span: "feature",
        priority: "Important",
        title: "ICAI Restricts Arbitrary Incremental Borrowing Rates Under Ind AS 116 — Lease Liability Recalculations Required",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.icai.org/post.html?post_id=18984",
        rawGazetteLabel: "ICAI Technical Committee",
        marketLens: "https://www.taxmann.com/research/company-and-sebi/top-story/105010000000022762/audit-trail-management-auditors-responsibilities-compliance-requirements-%E2%80%93analysis-with-reference-to-amendments-effective-from-1-4-2023-experts-opinion",
        marketLensLabel: "Taxmann Ind AS Portal",
        sourceTier: 2,
        details: "The revised guidance note restricts corporate finance divisions from applying generic or group-wide borrowing rates to lease liability calculations. Companies must document an Incremental Borrowing Rate (IBR) matching the exact currency, lease term, and credit profile of the specific lessee entity.",
        impact: "Audit managers must build standardized Excel/Python recalculation templates to independently verify Right-of-Use (ROU) asset balances and challenge management's IBR assumptions."
      },
      {
        id: "reg_3",
        span: "mini",
        priority: "Watchlist",
        title: "GST Council Proposes 28% Rate on Online Real-Money Gaming Platforms — Industry Seeks Judicial Review",
        rawGazette: "https://www.gst.gov.in/",
        rawGazetteLabel: "GST Portal",
        marketLens: "https://economictimes.indiatimes.com/news/economy/policy/gst-council-meet-key-decisions-tax-rates/articleshow/111891009.cms",
        marketLensLabel: "ET GST Decisions",
        sourceTier: 1,
        details: "The GST Council recommended applying 28% tax on the full face value of bets placed on online gaming platforms, a dramatic escalation from the previous 18% on gross gaming revenue."
      }
    ]
  },

  // ── SECTION 4: FRAUD & FORENSICS WATCH ────────────────────
  section4: {
    title: "GLOBAL CORPORATE FRAUD & COMPLIANCE WATCH",
    articles: [
      {
        id: "fraud_1",
        span: "feature",
        priority: "Critical",
        title: "Forensic Audit Unmasks Multi-Billion Off-Balance Sheet Leverage Loop at Mid-Cap Infrastructure Developer",
        image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListingAll=yes&cid=3",
        rawGazetteLabel: "SEBI Enforcement Orders",
        marketLens: "https://www.newslaundry.com/latest",
        marketLensLabel: "Newslaundry Governance Desk",
        sourceTier: 1,
        fraudBullets: [
          { label: "1. THE ALLEGED ANOMALY", text: "The promoter group routed ₹1,400 crore of high-yield debt through 14 unconsolidated shell partnership LLPs. The shell units purchased fictitious consulting deliverables from the parent entity, which was then capitalized as operating cash flow on the consolidated books." },
          { label: "2. THE INTERNAL CONTROL / AUDIT FAILURE", text: "Statutory auditors failed to physically verify the LLP partners' operational offices, match bank escrow pipelines, or determine ultimate beneficial ownership. Related-party transaction registers were signed off without substantive testing of address duplication." },
          { label: "3. SYSTEMIC RISK / BNS CORPORATE LIABILITY", text: "Exposes a systemic vulnerability where real estate developers deploy project SPVs to mask structural leverage, artificially inflating EBITDA ratios to secure bank consortium credit lines. BNS Section 318 (Criminal Breach of Trust) proceedings initiated." }
        ]
      },
      {
        id: "fraud_2",
        span: "feature",
        priority: "Critical",
        title: "SEC Crackdown: Software Vendor Charged with Systematic R&D Capitalization Overstatement Under IAS 38",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.sec.gov/litigation/admin.htm",
        rawGazetteLabel: "SEC Enforcement Portal",
        marketLens: "https://www.bloomberg.com/markets",
        marketLensLabel: "Bloomberg Law",
        sourceTier: 1,
        fraudBullets: [
          { label: "1. THE ALLEGED ANOMALY", text: "The corporation capitalized routine software debugging and standard maintenance payroll expenses as 'Proprietary Intangible Assets under Development' under IAS 38, overstating net profit margins by 18% over three consecutive fiscal periods." },
          { label: "2. THE INTERNAL CONTROL / AUDIT FAILURE", text: "Timesheet management databases lacked technical segregation rules. Development engineers logged standard debugging hours into product R&D asset accounts without validation by project directors or finance controllers." },
          { label: "3. SYSTEMIC RISK / BNS CORPORATE LIABILITY", text: "Highlights incentives for VC-backed tech firms to artificially lower perceived cash burn rates and inflate operating EBITDA multiples to meet venture funding benchmark targets." }
        ]
      }
    ]
  },

  // ── SECTION 5: STRATEGY, AI & CAPITAL MARKETS ─────────────
  section5: {
    title: "STRATEGY, AI & CAPITAL MARKETS DESK",
    articles: [
      {
        id: "strat_1",
        type: "pe_metrics",
        span: "feature",
        title: "PE/VC Transaction Benchmarks: B2B SaaS Valuations Re-Base to 6.5× EV/ARR with Strict EBITDA Hurdles",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.bain.com/insights/topics/private-equity/",
        rawGazetteLabel: "Bain PE Insights",
        marketLens: "https://www.wsj.com/business/deals",
        marketLensLabel: "WSJ Deals Desk",
        sourceTier: 2,
        details: "Global late-stage PE software transaction multiples have established a new floor at 6.0×–7.5× EV/ARR, with syndicates demanding 1.5× non-participating liquidation preferences, board-level budget veto rights, and strict 18% EBITDA margin transition timelines.",
        metrics: { "Median EV/ARR": "6.5×", "Liq. Pref.": "1.5× Non-Part.", "EBITDA Hurdle": "18%", "Median Deal Size": "$85M" }
      },
      {
        id: "strat_2",
        type: "consulting_case",
        span: "feature",
        title: "BCG Turnaround Playbook: Restructuring Leverage at a Tier-1 Automotive Components OEM",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.bcg.com/industries/automotive/insights",
        rawGazetteLabel: "BCG Automotive Insights",
        marketLens: "https://economictimes.indiatimes.com/industry/auto/auto-components",
        marketLensLabel: "ET Auto Components",
        sourceTier: 2,
        details: "BCG executed a 14-month operational restructuring for a heavily leveraged tier-1 auto components manufacturer. Three strategic pivots: 1) Divesting a low-margin legacy foundry casting division; 2) Consolidating vendor pipelines using custom RPA automation software; 3) Shifting tooling production to hybrid/EV drivetrain value chains.",
        metrics: { "EBITDA Margin Lift": "+420 bps", "Working Capital Cut": "22%", "Debt Payoff Timeline": "18 months", "Headcount Redeployment": "1,400 roles" }
      },
      {
        id: "strat_3",
        type: "b2b_radar",
        span: "hero",
        title: "B2B Startup Opportunity Radar: Automating Multi-Channel Retail Reconciliation Friction with Agentic AI",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
        rawGazette: "https://www.mckinsey.com/industries/retail/our-insights",
        rawGazetteLabel: "McKinsey Retail Tech",
        marketLens: "https://techcrunch.com/tag/fintech/",
        marketLensLabel: "TechCrunch Fintech",
        sourceTier: 2,
        details: "Enterprise multi-channel retailers are experiencing severe margin leakages due to manual ledger reconciliation across payment gateways, COD networks, and reverse-logistics partners. Retailers absorb up to 1.8% of top-line revenue in administrative friction.",
        radar: {
          problem: "Retailers lose ~1.8% of top-line revenue to manual gateway reconciliation, chargeback dispute delays, and reverse logistics invoice mismatches across 12+ payment rails.",
          solution: "An agentic AI SaaS integration that automatically fetches payment gateway settlement files, matches invoices against ERP entries, auto-initiates chargeback dispute filings, and updates financial ledgers in real-time — eliminating manual human reconciliation entirely."
        }
      },
      {
        id: "strat_4",
        type: "banking_telemetry",
        span: "mini",
        title: "Indian Banking Price Action: HDFC Bank & SBI Volume Metrics via Upstox Charts",
        rawGazette: "https://www.nseindia.com/get-quotes/equity?symbol=HDFCBANK",
        rawGazetteLabel: "NSE HDFC Bank Quote",
        marketLens: "https://upstox.com/stocks/hdfc-bank-ltd/NSE-INE040A01034/",
        marketLensLabel: "Upstox HDFC Bank Chart",
        sourceTier: 1,
        details: "HDFC Bank holds firm above the ₹1,540 support level with rising delivery volumes. SBI shows consolidation near ₹820 on profit booking after the PSU rally. Institutional accumulation signals remain strong for both counters.",
        telemetry: { "HDFC Bank CMP": "₹1,542", "SBI CMP": "₹822", "HDFC Delivery %": "42%", "SBI Delivery %": "38%" }
      },
      {
        id: "strat_5",
        type: "sports_economics",
        span: "mini",
        title: "Sports Economics: Evaluating Manchester United's Enterprise Value Through Moneyball Analytical Models",
        rawGazette: "https://www.imf.org/en/Publications/WEO",
        rawGazetteLabel: "IMF Global Data",
        marketLens: "https://www.forbes.com/lists/soccer-valuations/",
        marketLensLabel: "Forbes Football Valuations",
        sourceTier: 3,
        details: "Manchester United's EV stands at $6.3B. Moneyball-inspired expected goals (xG) models suggest the club's squad productivity lags its wage bill by 22%. Revenue per match-day seat outperforms EPL median by 31%, but broadcasting revenue concentration risk remains elevated.",
        telemetry: { "Enterprise Value": "$6.3B", "Wage/Revenue Ratio": "62%", "xG Efficiency Gap": "-22%", "Matchday Rev Premium": "+31%" }
      },
      {
        id: "strat_6",
        type: "wealth_telemetry",
        span: "mini",
        title: "Sovereign Debt & Real Estate Telemetry: Yield Curves, Credit Spreads & Cyber City Rentals",
        rawGazette: "https://www.rbi.org.in/Scripts/WSSView.aspx",
        rawGazetteLabel: "RBI Weekly Statistical Supplement",
        marketLens: "https://realty.economictimes.indiatimes.com/news/commercial/airbnb-expands-presence-in-gurugram-with-new-46437-sq-ft-office-lease/131420010",
        marketLensLabel: "ET Realty Tracking",
        sourceTier: 1,
        details: "Systemic banking liquidity has dipped into a minor deficit of ₹1.1 lakh crore. Sovereign liquidity yields track near 6.85%, while short-term corporate credit spreads over G-Secs widened by 12 bps.",
        telemetry: { "Sovereign Liq Yield": "6.85%", "ST Debt Yield": "7.28%", "AAA Spread / G-Sec": "55 bps", "Cyber City Rent": "₹165/sqft", "Golf Course Rd Rent": "₹185/sqft" }
      }
    ]
  },

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
