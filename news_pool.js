// news_pool.js — ALL FINANCIALS Premium Intelligence Article Pool
// Contains high-signal financial and regulatory articles with realistic historical dates

const ALL_FINANCIALS_POOL = [
  // ── SECTION 1: THE FRONT PAGE (5 articles) ──────────────────
  {
    section: "section1",
    id: "fp_hero",
    priority: "Critical",
    title: "RBI Rewrites Infrastructure Lending Rulebook: Provisioning for Under-Construction Projects Jumps from 0.4% to 5%",
    pubDate: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
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
    section: "section1",
    id: "fp_feat1",
    priority: "Critical",
    title: "Cabinet Clears ₹39,360 Crore for Two New Semiconductor Fabrication Units Under India Semiconductor Mission",
    pubDate: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 hours ago
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
    section: "section1",
    id: "fp_feat2",
    priority: "Important",
    title: "Federal Reserve Minutes Confirm Extended 'Higher-for-Longer' Monetary Corridor Through 2026",
    pubDate: new Date(Date.now() - 10 * 3600000).toISOString(), // 10 hours ago
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    rawGazette: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    rawGazetteLabel: "Federal Reserve FOMC Portal",
    marketLens: "https://www.reuters.com/markets/us/fed-officials-worried-about-sticky-inflation-may-minutes-show-2024-05-22/",
    marketLensLabel: "Reuters Fed Analysis",
    sourceTier: 1,
    whatHappened: "FOMC minutes reveal deep-seated anxiety among board members regarding sticky core inflation vectors. Several participants expressed willingness to tighten further if upside risks materialize.",
    whyItMatters: "Postpones structural yield curve normalization, anchoring global borrowing costs at multi-decade highs. Debt service coverage ratios for leveraged corporate borrowers face severe compression.",
    impact: "Wealth desks should lock in high-quality yields in medium-duration bonds. Corporate advisory teams must advise clients to extend working capital facilities and hedge debt exposures."
  },
  {
    section: "section1",
    id: "sim_1",
    priority: "Critical",
    title: "RBI Imposes ₹2.5 Crore Penalty on Private Sector Bank Over Non-Compliance with KYC and AML Guidelines",
    pubDate: new Date(Date.now() - 1 * 3600000).toISOString(), // 1 hour ago
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    rawGazette: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
    rawGazetteLabel: "RBI Press Releases",
    marketLens: "https://bfsi.economictimes.indiatimes.com/news/rbi-imposes-monetary-penalty-on-major-bank/13149870",
    marketLensLabel: "ET Banking Watch",
    sourceTier: 1,
    whatHappened: "The Reserve Bank of India imposed a monetary penalty of ₹2.5 crore on a prominent private sector bank for structural lapses in KYC verification processes and failure to monitor high-risk transaction patterns under the Prevention of Money Laundering Act.",
    whyItMatters: "Signal of escalating regulatory enforcement on digital onboarding workflows and operational KYC backlogs, setting a precedent for auditing compliance frameworks.",
    impact: "Audit leads must review digital onboarding verification logs. Wealth managers should monitor private banking entities for operational compliance audits."
  },
  {
    section: "section1",
    id: "sim_2",
    priority: "Critical",
    title: "GST Authority Issues Show-Cause Notice to E-Commerce Giant: DRC-01 Demands ₹840 Crore Over Disputed Input Tax Credits",
    pubDate: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    rawGazette: "https://www.cbic.gov.in/htdocs-cbec/gst",
    rawGazetteLabel: "CBIC GST Portal",
    marketLens: "https://www.taxmann.com/research/gst",
    marketLensLabel: "Taxmann GST Insights",
    sourceTier: 1,
    whatHappened: "The Directorate General of GST Intelligence (DGGI) served a draft GST DRC-01 demand notice to a multinational e-commerce conglomerate over alleged mismatch of input tax credit (ITC) claims with Form GSTR-2A records.",
    whyItMatters: "Direct warning to digital enterprises utilizing multi-tiered vendor supply lines. Re-reconciliation of past corporate tax filings is highly recommended.",
    impact: "Tax consultants must implement instant ledger matching tools to trace downstream vendor filings before closing audits."
  },

  // ── SECTION 2: THE DAILY BRIEF (3 articles) ──────────────────
  {
    section: "section2",
    id: "db_1",
    priority: "Critical",
    title: "PIB: Direct Tax Collections Surge 17.7% YoY, Exceeding Revised Fiscal Estimates",
    pubDate: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
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
    section: "section2",
    id: "db_2",
    priority: "Important",
    title: "SEBI Mandates Enhanced Beneficial Ownership Disclosures for Concentrated FPIs",
    pubDate: new Date(Date.now() - 8 * 3600000).toISOString(), // 8 hours ago
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
    section: "section2",
    id: "db_6",
    priority: "Important",
    title: "Fortune 500 GCC Migration Accelerates: 45+ Companies Announce India Back-Office Relocations",
    pubDate: new Date(Date.now() - 16 * 3600000).toISOString(), // 16 hours ago
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

  // ── SECTION 3: REGULATORY & AUDIT (3 articles) ────────────────
  {
    section: "section3",
    id: "reg_1",
    priority: "Critical",
    title: "MCA Mandates Tamper-Proof Audit Trail (Edit Logs) for All Companies Under CARO 2020 — Auditors Must Verify Full-Year Operational Continuity",
    pubDate: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
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
    section: "section3",
    id: "reg_2",
    priority: "Important",
    title: "ICAI Restricts Arbitrary Incremental Borrowing Rates Under Ind AS 116 — Lease Liability Recalculations Required",
    pubDate: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
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
    section: "section3",
    id: "sim_3",
    priority: "Important",
    title: "SEBI Proposes T+0 Instant Settlement Cycle Pilot for Highly Liquid Equities to Boost Capital Rotation Uptime",
    pubDate: new Date(Date.now() - 24 * 3600000).toISOString(), // 24 hours ago
    rawGazette: "https://www.sebi.gov.in/reports-and-comments/consultation-papers.html",
    rawGazetteLabel: "SEBI Consultation Papers",
    marketLens: "https://www.livemint.com/market/stock-market-news/sebi-proposes-t-0-settlement-from-march-instant-settlement-by-october-2024-11703248384218.html",
    marketLensLabel: "Livemint Stock Market Desk",
    sourceTier: 1,
    details: "The Securities and Exchange Board of India released a detailed consultation paper proposing a voluntary T+0 instant clearing and settlement cycle pilot for liquid securities alongside the current T+1 framework. SEBI aims to enhance asset rotational velocity and lower retail trading leverage risk.",
    impact: "Brokerage operations managers must adapt transaction settlement software and back-office clearing APIs to handle sub-hour trade settlement cycles."
  },

  // ── SECTION 4: GLOBAL CORPORATE FRAUD (2 articles) ────────────
  {
    section: "section4",
    id: "fraud_1",
    priority: "Critical",
    title: "Forensic Audit Unmasks Multi-Billion Off-Balance Sheet Leverage Loop at Mid-Cap Infrastructure Developer",
    pubDate: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
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
    section: "section4",
    id: "fraud_2",
    priority: "Critical",
    title: "SEC Crackdown: Software Vendor Charged with Systematic R&D Capitalization Overstatement Under IAS 38",
    pubDate: new Date(Date.now() - 18 * 3600000).toISOString(), // 18 hours ago
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
  },

  // ── SECTION 5: STRATEGY & CAPITAL MARKETS (2 articles) ─────────
  {
    section: "section5",
    id: "strat_3",
    type: "b2b_radar",
    priority: "Important",
    title: "B2B Startup Opportunity Radar: Automating Multi-Channel Retail Reconciliation Friction with Agentic AI",
    pubDate: new Date(Date.now() - 1 * 3600000).toISOString(), // 1 hour ago
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
    section: "section5",
    id: "sim_4",
    type: "b2b_radar",
    priority: "Important",
    title: "B2B Startup Opportunity Radar: Automating Audit Trail Continuous Compliance for BNS Liability Protection",
    pubDate: new Date(Date.now() - 7 * 3600000).toISOString(), // 7 hours ago
    rawGazette: "https://nfra.gov.in/notifications",
    rawGazetteLabel: "NFRA Regulations Hub",
    marketLens: "https://techcrunch.com/tag/enterprise/",
    marketLensLabel: "TechCrunch Enterprise",
    sourceTier: 2,
    details: "With the Ministry of Corporate Affairs aggressively policing continuous audit trail edit log uptime, enterprise CEOs face direct liability risk under the new Bharatiya Nyaya Sanhita (BNS) for accounting manipulations. Corporate compliance managers lack automated, daily validation systems.",
    radar: {
      problem: "Corporate compliance officers currently perform manual or quarterly checkups to verify if their multi-instance ERP edit logs remain operational, leaving months-long exposure gaps.",
      solution: "An agentic compliance SaaS daemon that performs continuous, micro-transaction testing of accounting databases, automatically alerts the board of any edit-log deactivation, and creates a legally defensible cryptographic compliance ledger."
    }
  },

  // ── SECTION 2 EXTENSIONS (Daily Brief) ───────────────────────
  {
    section: "section2",
    id: "db_3",
    priority: "Important",
    title: "CBDT Publishes Comprehensive Audit Directives for Virtual Digital Assets Under Section 115BBH",
    pubDate: new Date(Date.now() - 18 * 3600000).toISOString(), // 18 hours ago
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=80&q=80",
    rawGazette: "https://incometaxindia.gov.in/Pages/communications/circulars.aspx",
    rawGazetteLabel: "CBDT Circulars Portal",
    marketLens: "https://www.taxmann.com/research/direct-tax-laws",
    marketLensLabel: "Taxmann Direct Tax",
    sourceTier: 2,
    whatHappened: "The Central Board of Direct Taxes released a stringent guidance circular detailing compliance procedures for the tracking, reporting, and 30% taxation of virtual digital asset transactions, instructing field auditors to verify matching TDS trails.",
    whyItMatters: "Closes the informal loop for corporate digital asset treasuries and sets clear balance-sheet disclosure rules for blockchain-based operations.",
    impact: "Tax officers must implement granular transactional mapping across multi-signature ledger nodes to avoid audit penalties."
  },
  {
    section: "section2",
    id: "db_4",
    priority: "Watchlist",
    title: "SEBI Sounds Leverage Warning as Retail Options Trading Premium Volumes Touch Record Highs",
    pubDate: new Date(Date.now() - 20 * 3600000).toISOString(), // 20 hours ago
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=80&q=80",
    rawGazette: "https://www.sebi.gov.in/reports-and-comments/consultation-papers.html",
    rawGazetteLabel: "SEBI Risk Advisory",
    marketLens: "https://www.bloomberg.com/markets",
    marketLensLabel: "Bloomberg India Markets",
    sourceTier: 1,
    whatHappened: "The markets regulator issued a thematic risk study flagging excessive short-term derivative concentration, warning retail brokers regarding rising household debt exposures driven by weekly index options speculation.",
    whyItMatters: "Signals upcoming structural curbs on broker margin lending limits and possible increases in transaction taxing rules.",
    impact: "Risk officers at digital brokerages should tighten intraday margin cushions and prepare for stricter disclosure overlays."
  },

  // ── SECTION 3 EXTENSIONS (Regulatory & Audit Desk) ───────────
  {
    section: "section3",
    id: "reg_3",
    priority: "Important",
    title: "NFRA Demands Immediate Reclassification of Arbitrary Current Liabilities and Outstanding Trade Payables",
    pubDate: new Date(Date.now() - 15 * 3600000).toISOString(), // 15 hours ago
    rawGazette: "https://nfra.gov.in/enforcement-orders",
    rawGazetteLabel: "NFRA Circular Library",
    marketLens: "https://www.taxmann.com/research/company-and-sebi",
    marketLensLabel: "Taxmann Company Law",
    sourceTier: 1,
    details: "The National Financial Reporting Authority issued a thematic audit check order criticizing companies for misclassifying aged MSME trade payables as standard 'current operational provisions', thereby artificially inflating liquidity ratios.",
    impact: "Statutory auditors must verify aging ledgers of outstanding invoices and cross-reference registered MSME declarations in detail."
  },
  {
    section: "section3",
    id: "reg_4",
    priority: "Watchlist",
    title: "MCA Directs Listed Enterprises to Establish Standardized ESG and Sustainability Audit Logs Under BRSR",
    pubDate: new Date(Date.now() - 22 * 3600000).toISOString(), // 22 hours ago
    rawGazette: "https://www.mca.gov.in/content/mca/global/en/notifications-orders",
    rawGazetteLabel: "MCA Notifications",
    marketLens: "https://www.livemint.com/industry",
    marketLensLabel: "Mint Sustainability",
    sourceTier: 2,
    details: "The Ministry of Corporate Affairs updated the Business Responsibility and Sustainability Reporting (BRSR) framework, requiring corporations to log green carbon offsets and social parameters in tamper-proof system logs subject to audit certification.",
    impact: "Corporate sustainability teams must configure ERP databases to continuously capture ESG variables with exact system timestamps."
  },

  // ── SECTION 4 EXTENSIONS (Corporate Fraud & Compliance) ───────
  {
    section: "section4",
    id: "fraud_3",
    priority: "Critical",
    title: "NCLT Orders Forensic Audit into Promoters' SPV Fund Transfers at Listed Infrastructure Conglomerate",
    pubDate: new Date(Date.now() - 12 * 3600000).toISOString(), // 12 hours ago
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    rawGazette: "https://nclt.gov.in/order-judgement",
    rawGazetteLabel: "NCLT Order Registry",
    marketLens: "https://www.bloomberg.com/markets",
    marketLensLabel: "Bloomberg Governance",
    sourceTier: 1,
    fraudBullets: [
      { label: "1. THE ANOMALY", text: "Promoters shifted Rs. 420 Crore from central bank loans into 6 special purpose vehicles (SPVs) ostensibly for road development, which then disbursed interest-free loans directly to promoter shell LLPs." },
      { label: "2. AUDIT LAPSE", text: "Auditors failed to flag the absence of physical project milestones or reconcile SPV balance sheets against actual site construction progress." },
      { label: "3. COMPLIANCE EXPOSURE", text: "Triggers immediate clawback and criminal proceedings under NCLT Insolvency Code Section 66 for fraudulent transactions, risking promoter board expulsion." }
    ]
  },
  {
    section: "section4",
    id: "fraud_4",
    priority: "Critical",
    title: "GST Intelligence Uncovers Rs. 380 Crore Fake Input Tax Credit Racket Powered by 42 Interconnected Shell Firms",
    pubDate: new Date(Date.now() - 26 * 3600000).toISOString(), // 26 hours ago
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    rawGazette: "https://www.cbic.gov.in/htdocs-cbec/gst",
    rawGazetteLabel: "CBIC Press Releases",
    marketLens: "https://www.taxmann.com/research/gst",
    marketLensLabel: "Taxmann Indirect Tax Portal",
    sourceTier: 1,
    fraudBullets: [
      { label: "1. THE ANOMALY", text: "A ring of 42 shell partnership firms issued circular invoices worth Rs. 1,800 crore with zero physical delivery of goods, manufacturing fake input tax credits (ITC) to lower aggregate liabilities." },
      { label: "2. AUDIT LAPSE", text: "Downstream purchasers accepted tax invoices without verifying physical delivery receipts, warehouse logs, or vehicle registration validations." },
      { label: "3. COMPLIANCE EXPOSURE", text: "DGGI served multi-state notices with severe penalty multiplier charges under PMLA guidelines, locking company cash accounts." }
    ]
  },

  // ── SECTION 5 EXTENSIONS (Strategy, AI & Capital Markets) ─────
  {
    section: "section5",
    id: "strat_1",
    type: "pe_metrics",
    priority: "Important",
    title: "Corporate Treasuries Restructure Debt Portfolios as Yield Curve Inversion Risks Deepen",
    pubDate: new Date(Date.now() - 14 * 3600000).toISOString(), // 14 hours ago
    rawGazette: "https://www.rbi.org.in/Scripts/BS_ViewBulletin.aspx",
    rawGazetteLabel: "RBI Bulletin",
    marketLens: "https://economictimes.indiatimes.com/markets",
    marketLensLabel: "ET Capital Markets",
    sourceTier: 2,
    details: "With persistent short-term debt yield spikes, Nifty corporate treasuries are shortening aggregate investment durations, moving Rs. 14,000 crore out of long-maturity papers into short-term commercial CDs to preserve liquidity margins.",
    metrics: { "Treasury Movement": "Rs. 14,000 Crore", "CD Yield Average": "7.45%", "Inversion Spread": "34 bps", "Hedge Duration": "90 Days" }
  },
  {
    section: "section5",
    id: "strat_2",
    type: "consulting_case",
    priority: "Watchlist",
    title: "Industrial Manufacturing Syndicate Structures Strategic ESG Carbon Offset Transaction Pipeline",
    pubDate: new Date(Date.now() - 30 * 3600000).toISOString(), // 30 hours ago
    rawGazette: "https://www.sebi.gov.in/sebiweb/home/HomeAction.do",
    rawGazetteLabel: "SEBI ESG Disclosures",
    marketLens: "https://www.business-standard.com/markets",
    marketLensLabel: "BS Carbon Trade",
    sourceTier: 2,
    details: "A consortium of steel and heavy manufacturing players completed a structured trade transaction of carbon credit offsets worth Rs. 650 Crore, aiming to meet net-zero carbon directives before their late 2026 ESG audits.",
    metrics: { "Transaction Size": "Rs. 650 Crore", "Carbon Price Index": "$24.50/ton", "Conglomerate Buyers": "4 Listed Entities", "Audit Agency": "E&Y ESG Desk" }
  },
  {
    section: "section5",
    id: "strat_4",
    type: "b2b_radar",
    priority: "Important",
    title: "B2B Startup Opportunity Radar: Automating Real-Time Related Party Transaction Audit Checks",
    pubDate: new Date(Date.now() - 36 * 3600000).toISOString(), // 36 hours ago
    rawGazette: "https://www.sebi.gov.in/legal/circulars.html",
    rawGazetteLabel: "SEBI Compliance Circulars",
    marketLens: "https://techcrunch.com/tag/enterprise/",
    marketLensLabel: "TechCrunch Enterprise SaaS",
    sourceTier: 2,
    details: "As SEBI mandates absolute disclosure uptime for related party transactions (RPT), corporate compliance officers lack tools to scan and verify cross-holdings, directors' shell companies, or promoter family trade transactions on a daily basis.",
    radar: {
      problem: "Enterprises face severe penalties for undeclared related party sales, while current systems only capture holdings on a quarterly or annual audit basis.",
      solution: "An agentic audit-compliance SaaS database engine that automatically ingests supplier listings, maps ultimate beneficial ownership (UBO) via national registry API integrations, and flags unregistered RPTs before payments are completed."
    }
  },
  {
    section: "section5",
    id: "strat_5",
    type: "pe_metrics",
    priority: "Important",
    title: "PE Activity Surge: Global Syndicate Acquires Strategic Stake in Bangalore IT Park Corridor",
    pubDate: new Date(Date.now() - 42 * 3600000).toISOString(), // 42 hours ago
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    rawGazette: "https://www.sebi.gov.in/sebiweb/home/HomeAction.do",
    rawGazetteLabel: "SEBI REIT Filings",
    marketLens: "https://realty.economictimes.indiatimes.com/news/commercial",
    marketLensLabel: "ET Realty Bangalore",
    sourceTier: 1,
    details: "A syndicate of pension funds and global private equity conglomerates finalized a Rs. 5,200 Crore deal to acquire three prime Grade-A commercial workspace developments in Bangalore, setting up a public REIT launch for late 2026.",
    metrics: { "Transaction Value": "Rs. 5,200 Crore", "Leasable Workspace": "1.8M sqft", "Target Cap Rate": "8.12%", "REIT Launch Target": "Q4 2026" }
  }
];


if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ALL_FINANCIALS_POOL };
} else {
  window.ALL_FINANCIALS_POOL = ALL_FINANCIALS_POOL;
}
