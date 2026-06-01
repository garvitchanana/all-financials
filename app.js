// app.js — ALL FINANCIALS Reactive Core Engine v2
// Enhanced ticker scroll + RSS CORVAL feed engine via rss2json.com

(function () {
  'use strict';

  /* ── 1. STATE ───────────────────────────────────────── */
  let D = null;           // master data object
  let query = '';         // active search filter
  let rssCache = [];      // aggregated RSS items
  let rssFetchTimer = null;
  let sliderHorizonHrs = 0; // time-travel horizon offset in hours
  let activeTickerName = null; // clicked ticker name
  let pinnedArticles = new Set(); // set of pinned article IDs
  let activeSimulatedArticle = null; // article currently loaded in risk simulator
  let activeDesk = 'all'; // active top navigation desk filter tab
  let tickerHistories = {}; // rolling price histories for tickers (30 points each)

  /* ── 2. DOM CACHE ───────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const tickerTrack = $('ticker-track');
  const refreshBtn = $('refresh-btn');
  const refreshIcon = $('refresh-icon');
  const themeBtn = $('theme-btn');
  const themeLabel = $('theme-label');
  const iconSun = $('icon-sun');
  const iconMoon = $('icon-moon');
  const searchInput = $('search-input');
  const dateEl = $('masthead-date');
  const lastUpdatedEl = $('last-updated');
  const sec1 = $('sec-1-grid');
  const sec2 = $('sec-2-grid');
  const sec3 = $('sec-3-grid');
  const sec4 = $('sec-4-grid');
  const sec5 = $('sec-5-grid');
  const rssGrid = $('rss-grid');
  const rssPulse = $('rss-pulse');
  const rssStatus = $('rss-status');
  const fwTag = $('fw-tag');
  const fwBody = $('fw-body');

  const horizonSlider = $('horizon-slider');
  const sliderLabel = $('slider-label');
  const tickerAnalytics = $('ticker-analytics');
  const tickerAnalyticsTitle = $('ticker-analytics-title');
  const tickerAnalyticsCmp = $('ticker-analytics-cmp');
  const tickerAnalyticsChg = $('ticker-analytics-chg');
  const tickerAnalyticsHigh = $('ticker-analytics-high');
  const tickerAnalyticsLow = $('ticker-analytics-low');
  const sparklinePath = $('sparkline-path');
  const sparklineArea = $('sparkline-area');
  const tickerAnalyticsClose = $('ticker-analytics-close');

  const gaugeFill = $('gauge-fill');
  const gaugeValue = $('gauge-value');
  const gaugeDesc = $('gauge-desc');
  const metricExposure = $('metric-exposure');
  const metricFailProb = $('metric-fail-prob');
  const metricCritCount = $('metric-crit-count');
  const metricRepricing = $('metric-repricing');

  const simulatorDrawer = $('simulator-drawer');
  const simulatorDrawerClose = $('simulator-drawer-close');
  const simContextTitle = $('sim-context-title');
  const simContextDesc = $('sim-context-desc');
  const simSlider1 = $('sim-slider-1');
  const simSlider2 = $('sim-slider-2');
  const simSlider3 = $('sim-slider-3');
  const simVal1 = $('sim-val-1');
  const simVal2 = $('sim-val-2');
  const simVal3 = $('sim-val-3');
  const simResMargin = $('sim-res-margin');
  const simResProvision = $('sim-res-provision');
  const simResPenalty = $('sim-res-penalty');
  const simStatusFill = $('sim-status-fill');
  const simStatusText = $('sim-status-text');

  const pdfTemplateSelect = $('pdf-template-select');
  const pdfParseBtn = $('pdf-parse-btn');
  const consoleBox = $('console-box');
  const consoleLog = $('console-log');
  const crawlProgressBar = $('crawl-progress-bar');
  const deskTabs = $('desk-tabs');
  const ingestToggleBtn = $('ingest-toggle-btn');
  const collapsibleIntake = $('collapsible-intake');

  /* ── 3. BOOT ────────────────────────────────────────── */
  function boot() {
    setDate();
    loadTheme();

    // Load pinned state
    const savedPins = localStorage.getItem('af_pins');
    if (savedPins) {
      try {
        pinnedArticles = new Set(JSON.parse(savedPins));
      } catch (_) { }
    }

    loadData();
    wire();
    initTickerScroll();
    setInterval(tickerPulse, 4000);
    setInterval(schedulerCheck, 5 * 60000);
    // RSS: first fetch immediately, then every 5 minutes
    rssBootstrap();

    // Setup Ticker Analytic Sparkline drawer closing
    tickerAnalyticsClose.addEventListener('click', closeTickerSparkline);

    // Setup Simulator drawer closing & slider listeners
    simulatorDrawerClose.addEventListener('click', closeSimulatorDrawer);
    [simSlider1, simSlider2, simSlider3].forEach(s => {
      s.addEventListener('input', runRiskSimulation);
    });
  }

  function setDate() {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function weekNum() {
    const d = new Date(); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - y) / 864e5 + 1) / 7);
  }

  /* ── 4. THEME ───────────────────────────────────────── */
  function loadTheme() {
    const t = localStorage.getItem('af_theme') || 'light';
    document.body.classList.toggle('dark', t === 'dark');
    syncThemeUI(t === 'dark');
  }
  function toggleTheme() {
    const dark = document.body.classList.toggle('dark');
    localStorage.setItem('af_theme', dark ? 'dark' : 'light');
    syncThemeUI(dark);
  }
  function syncThemeUI(dark) {
    themeLabel.textContent = dark ? 'Light Mode' : 'Dark Mode';
    iconSun.classList.toggle('hidden', !dark);
    iconMoon.classList.toggle('hidden', dark);
  }

  /* ── 5. TIME-DECAY RANKING & SIMULATION ENGINE ───────── */
  const SIMULATED_NEWS = [
    {
      section: "section1",
      article: {
        id: "sim_1",
        priority: "Critical",
        title: "RBI Imposes ₹2.5 Crore Penalty on Private Sector Bank Over Non-Compliance with KYC and AML Guidelines",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx",
        rawGazetteLabel: "RBI Press Releases",
        marketLens: "https://bfsi.economictimes.indiatimes.com/news/rbi-imposes-monetary-penalty-on-major-bank/13149870",
        marketLensLabel: "ET Banking Watch",
        sourceTier: 1,
        whatHappened: "The Reserve Bank of India imposed a monetary penalty of ₹2.5 crore on a prominent private sector bank for structural lapses in KYC verification processes and failure to monitor high-risk transaction patterns under the Prevention of Money Laundering Act.",
        whyItMatters: "Signal of escalating regulatory enforcement on digital onboarding workflows and operational KYC backlogs, setting a precedent for auditing compliance frameworks.",
        impact: "Audit leads must review digital onboarding verification logs. Wealth managers should monitor private banking entities for operational compliance audits."
      }
    },
    {
      section: "section1",
      article: {
        id: "sim_2",
        priority: "Critical",
        title: "GST Authority Issues Show-Cause Notice to E-Commerce Giant: DRC-01 Demands ₹840 Crore Over Disputed Input Tax Credits",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.cbic.gov.in/htdocs-cbec/gst",
        rawGazetteLabel: "CBIC GST Portal",
        marketLens: "https://www.taxmann.com/research/gst",
        marketLensLabel: "Taxmann GST Insights",
        sourceTier: 1,
        whatHappened: "The Directorate General of GST Intelligence (DGGI) served a draft GST DRC-01 demand notice to a multinational e-commerce conglomerate over alleged mismatch of input tax credit (ITC) claims with Form GSTR-2A records.",
        whyItMatters: "Direct warning to digital enterprises utilizing multi-tiered vendor supply lines. Re-reconciliation of past corporate tax filings is highly recommended.",
        impact: "Tax consultants must implement instant ledger matching tools to trace downstream vendor filings before closing audits."
      }
    },
    {
      section: "section3",
      article: {
        id: "sim_3",
        priority: "Important",
        title: "SEBI Proposes T+0 Instant Settlement Cycle Pilot for Highly Liquid Equities to Boost Capital Rotation Uptime",
        rawGazette: "https://www.sebi.gov.in/reports-and-comments/consultation-papers.html",
        rawGazetteLabel: "SEBI Consultation Papers",
        marketLens: "https://www.livemint.com/market/stock-market-news/sebi-proposes-t-0-settlement-from-march-instant-settlement-by-october-2024-11703248384218.html",
        marketLensLabel: "Livemint Stock Market Desk",
        sourceTier: 1,
        details: "The Securities and Exchange Board of India released a detailed consultation paper proposing a voluntary T+0 instant clearing and settlement cycle pilot for liquid securities alongside the current T+1 framework. SEBI aims to enhance asset rotational velocity and lower retail trading leverage risk.",
        impact: "Brokerage operations managers must adapt transaction settlement software and back-office clearing APIs to handle sub-hour trade settlement cycles."
      }
    },
    {
      section: "section5",
      article: {
        id: "sim_4",
        type: "b2b_radar",
        priority: "Important",
        title: "B2B Startup Opportunity Radar: Automating Audit Trail Continuous Compliance for BNS Liability Protection",
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
      }
    },
    {
      section: "section5",
      article: {
        id: "sim_5",
        type: "pe_metrics",
        priority: "Important",
        title: "PE Activity Surge: Sovereign Funds Acquire Strategic Stake in Gurgaon Grade-A Corporate Hubs",
        image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
        rawGazette: "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListingAll=yes&cid=3",
        rawGazetteLabel: "SEBI Investment Filings",
        marketLens: "https://realty.economictimes.indiatimes.com/news/commercial",
        marketLensLabel: "ET Realty Commercial",
        sourceTier: 1,
        details: "A syndicate of Singaporean and Middle Eastern sovereign wealth funds completed a ₹3,800 crore acquisition of Grade-A office buildings in Gurugram, aiming to pool assets into an upcoming public REIT listing in late 2026.",
        metrics: { "Transaction Value": "₹3,800 Crore", "Target Cap Rate": "8.45%", "Total Leasable Area": "1.2M sqft", "Target REIT Date": "Q3 2026" }
      }
    }
  ];

  function getPriorityScore(priority) {
    const p = (priority || '').toLowerCase();
    if (p === 'critical') return 100;
    if (p === 'important') return 70;
    if (p === 'watchlist' || p === 'forensics') return 50;
    return 30;
  }

  function computeDecayScore(article) {
    if (pinnedArticles.has(article.id)) {
      return 999999; // Pinned items stay locked at the top
    }
    const base = getPriorityScore(article.priority);
    if (!article.pubDate) return base;

    // Decay is calculated relative to the time-travel slider horizon offset!
    const timeRef = Date.now() - (sliderHorizonHrs * 3600000);
    const ageHrs = Math.max(0, (timeRef - new Date(article.pubDate).getTime()) / 3600000);
    return base * Math.exp(-0.02 * ageHrs); // half-life ~35h
  }

  function sortArticlesByDecay(articles) {
    if (!Array.isArray(articles)) return [];
    return [...articles].sort((a, b) => computeDecayScore(b) - computeDecayScore(a));
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Pinning Toggle
  function togglePin(id, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (pinnedArticles.has(id)) {
      pinnedArticles.delete(id);
    } else {
      pinnedArticles.add(id);
    }

    try {
      localStorage.setItem('af_pins', JSON.stringify(Array.from(pinnedArticles)));
    } catch (_) { }

    render();
  }

  // Injects simulated news local fallback from news_pool.js
  function injectSimulatedArticleLocal() {
    if (!D) return;
    const existingIds = new Set();
    ["section1", "section2", "section3", "section4", "section5"].forEach(s => {
      if (D[s] && D[s].articles) {
        D[s].articles.forEach(a => existingIds.add(a.id));
      }
    });

    const pool = window.ALL_FINANCIALS_POOL || [];
    const candidates = pool.filter(item => !existingIds.has(item.id));
    if (candidates.length === 0) return;

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const clone = JSON.parse(JSON.stringify(picked));
    // DONT overwrite clone.pubDate - decay is strictly based on original news template dates!

    const sec = picked.section;
    if (!D[sec]) D[sec] = { articles: [] };
    if (!D[sec].articles) D[sec].articles = [];
    D[sec].articles.unshift(clone);
  }

  function injectSimulatedArticleBatchLocal(count) {
    for (let i = 0; i < count; i++) {
      injectSimulatedArticleLocal();
    }
  }

  /* ── 6. DATA LOAD (API → localStorage → seed) ───────── */
  async function loadData() {
    // 1) try server API
    try {
      const r = await fetch('/api/news');
      if (r.ok) { D = await r.json(); render(); stamp(D.lastUpdated); return; }
    } catch (_) { }

    // 2) try localStorage (validate schema)
    const raw = localStorage.getItem('af_cache');
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (p && p.section1 && p.section2) { D = p; render(); stamp(D.lastUpdated); return; }
      } catch (_) { }
    }

    // 3) seed from templates
    if (window.ALL_FINANCIALS_DATA) {
      D = JSON.parse(JSON.stringify(window.ALL_FINANCIALS_DATA));
      D.lastUpdated = new Date().toISOString();
      persist();
      render();
      stamp(D.lastUpdated);
    }
  }

  function persist() {
    try { localStorage.setItem('af_cache', JSON.stringify(D)); localStorage.setItem('af_last', D.lastUpdated); } catch (_) { }
  }
  function stamp(iso) {
    if (!iso) return;
    lastUpdatedEl.textContent = 'Last updated: ' + new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  /* ── 7. SCHEDULER (12 h) ────────────────────────────── */
  function schedulerCheck() {
    const last = localStorage.getItem('af_last') || (D && D.lastUpdated);
    if (!last) return;
    if (Date.now() - new Date(last).getTime() >= 432e5) doRefresh(true);
  }

  /* ── 8. REFRESH ─────────────────────────────────────── */
  /* ── 8. REFRESH ─────────────────────────────────────── */
  function fetchWithTimeout(url, options = {}, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Request timed out')), timeout);
      fetch(url, options)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  async function syncCrawlToServer(data) {
    try {
      const response = await fetchWithTimeout('/api/news/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }, 6000);
      if (response.ok) {
        console.log('[SYNC] Successfully synchronized crawled news with the server.');
      }
    } catch (err) {
      console.warn('[SYNC] Server sync failed (offline or server not running):', err.message);
    }
  }

  function ensureTickerHistory() {
    if (!D || !D.ticker) return;
    D.ticker.forEach(t => {
      if (!t || !t.name) return;
      const name = t.name;
      const numericVal = parseFloat((t.value || '').replace(/[^0-9.-]/g, '')) || 100;
      if (!tickerHistories[name]) {
        const history = [];
        let current = numericVal * 0.98;
        for (let pt = 0; pt < 30; pt++) {
          current += (Math.random() - 0.48) * (numericVal * 0.004);
          history.push(current);
        }
        history[history.length - 1] = numericVal;
        tickerHistories[name] = history;
      }
    });
  }

  async function crawlRealInternetNews() {
    console.log('[CRAWLER] Initiating parallel real-world internet crawl...');
    const feeds = [
      { label: 'RBI Press Release', url: 'https://www.rbi.org.in/Scripts/RSSPr.aspx', category: 'Banking', sourceTier: 1 },
      { label: 'SEBI Notification', url: 'https://www.sebi.gov.in/sebiweb/rss/RssAction.do?boardId=1', category: 'Markets', sourceTier: 1 },
      { label: 'PIB Finance', url: 'https://pib.gov.in/Rss/Rss.aspx', category: 'Macro', sourceTier: 1 },
      { label: 'ET Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'Markets', sourceTier: 2 },
      { label: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets', category: 'Markets', sourceTier: 2 }
    ];

    // Parallel fetch with built-in timeouts
    const results = await Promise.allSettled(feeds.map(async (feed) => {
      try {
        const proxyUrl = RSS_PROXY + encodeURIComponent(feed.url);
        const response = await fetchWithTimeout(proxyUrl, {}, 10000);
        if (!response.ok) return [];
        const data = await response.json();
        if (data.status !== 'ok' || !data.items || !Array.isArray(data.items)) return [];
        return data.items
          .filter(item => item && item.title && item.title.trim().length > 10)
          .map(item => ({
            title: rssCleanText(item.title),
            description: rssCleanText(item.description || ''),
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            thumbnail: item.thumbnail || item.enclosure?.link || '',
            source: feed.label,
            category: feed.category,
            guid: item.guid || item.link || item.title
          }));
      } catch (e) {
        console.warn(`[CRAWLER] Feed fetch failed for ${feed.label}:`, e.message);
        return [];
      }
    }));

    let allItems = [];
    results.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        allItems = allItems.concat(res.value);
      }
    });

    if (allItems.length === 0) {
      throw new Error("No fresh articles could be retrieved from direct RSS feeds");
    }

    // Deduplicate
    allItems = rssDedup(allItems);

    // Sort by publication date
    allItems.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

    // Clear old articles in master data and initialize sections
    const freshData = {
      ticker: D ? D.ticker : (window.ALL_FINANCIALS_DATA ? window.ALL_FINANCIALS_DATA.ticker : []),
      section1: { title: "THE FRONT PAGE", articles: [] },
      section2: { title: "THE DAILY BRIEF", subtitle: "10 developments parsed for maximum executive leverage", articles: [] },
      section3: { title: "REGULATORY & AUDIT DESK", articles: [] },
      section4: { title: "GLOBAL CORPORATE FRAUD & COMPLIANCE WATCH", articles: [] },
      section5: { title: "STRATEGY, AI & CAPITAL MARKETS DESK", articles: [] },
      frameworks: D ? D.frameworks : (window.ALL_FINANCIALS_DATA ? window.ALL_FINANCIALS_DATA.frameworks : []),
      lastUpdated: new Date().toISOString()
    };

    // Keyword router
    allItems.forEach((item, idx) => {
      if (!item || !item.title) return; // Skip malformed items
      const titleText = item.title || "";
      const descText = item.description || "";
      const text = (titleText + " " + descText).toLowerCase();
      const sourceName = item.source || "Regulatory Desk";
      
      let section = 'section2'; // default: Daily Brief
      let priority = 'Standard';

      // 1. Global Corporate Fraud & Compliance
      if (/enforcement|penalty|penalties|court|pmla|nclt|scam|forensics|fraud|investigation|laundering|sfio|seize|arrest/.test(text)) {
        section = 'section4';
        priority = 'Critical';
      }
      // 2. Regulatory & Audit
      else if (/tax|gst|mca|nfra|caro|audit|auditor|ind as|accounting|compliance|cbic|regulatory|guideline|directives|framework|icai|cbdt|itr|incometax|corporate law/.test(text)) {
        section = 'section3';
        priority = /audit|nfra|compliance|directives/.test(text) ? 'Critical' : 'Important';
      }
      // 3. The Front Page (Banking/Credit/RBI)
      else if (/banking|credit|nbfc|rbi|interest rate|repo rate|monetary|lending|bank|borrowing/.test(text)) {
        section = 'section1';
        priority = /rbi|monetary|interest rate|repo rate/.test(text) ? 'Critical' : 'Important';
      }
      // 4. Strategy, AI & Capital Markets
      else if (/equity|stocks|clearing|beneficial ownership|reit|sebi|startup|b2b|ai|saas|capital market|ipo|acquisition|merger|fundraise/.test(text)) {
        section = 'section5';
        priority = /sebi|ipo|acquisition|reit/.test(text) ? 'Important' : 'Watchlist';
      }
      // 5. Daily Brief (default catch-all)
      else {
        section = 'section2';
        priority = /fiscal|macro|gdp|inflation|budget/.test(text) ? 'Important' : 'Standard';
      }

      // Generate UI details dynamically
      const articleId = `c_${Date.now()}_${idx}`;
      const image = item.thumbnail || guessFallback(titleText);
      const cleanDesc = descText || titleText;

      const whatHappened = cleanDesc;
      const whyItMatters = `Signals dynamic changes in regulatory and operational corridors. This announcement requires close evaluation of potential downstream legal and financial workflows.`;
      const impact = `Compliance leads must review internal operational logs and align internal policy frameworks with these updated guidelines within 15 days.`;

      const mappedArticle = {
        id: articleId,
        priority: priority,
        title: titleText,
        pubDate: item.pubDate || new Date().toISOString(),
        image: image,
        rawGazette: item.link || '#',
        rawGazetteLabel: `${sourceName} Gazette`,
        marketLens: item.link || '#',
        marketLensLabel: "Market Lens Watch",
        sourceTier: sourceName.includes('RBI') || sourceName.includes('SEBI') || sourceName.includes('PIB') ? 1 : 2,
        whatHappened: whatHappened,
        whyItMatters: whyItMatters,
        impact: impact,
        details: cleanDesc
      };

      // Add specialized fields for section-specific layouts
      if (section === 'section4') {
        mappedArticle.fraudBullets = [
          { label: "Entity Flagged: ", text: sourceName },
          { label: "Stated Violation: ", text: titleText.substring(0, 90) + (titleText.length > 90 ? "..." : "") },
          { label: "Remediation Mandate: ", text: "Corporate audit leads must implement forensic reconciliations immediately." }
        ];
      } else if (section === 'section5') {
        if (/ai|startup|b2b/.test(text)) {
          mappedArticle.radar = {
            problem: `Enterprise officers face manual processing lag and compliance risks trying to match new operational changes manually.`,
            solution: `Integrate a dedicated compliance agentic SaaS daemon to continually validate transaction workflows against ${sourceName} guidelines.`
          };
        } else {
          mappedArticle.metrics = {
            "Reporting Authority": sourceName,
            "Market Stance": priority === 'Critical' ? "Under Surveillance" : "Nominal",
            "Action Urgency": priority === 'Critical' ? "Immediate Review" : "Next Audit Cycle"
          };
        }
      }

      freshData[section].articles.push(mappedArticle);
    });

    // Ensure we keep at least some articles in each desk by back-filling from news_pool if any section is empty (Fallback Corridor)
    const pools = window.ALL_FINANCIALS_POOL || [];
    ['section1', 'section2', 'section3', 'section4', 'section5'].forEach(sec => {
      if (freshData[sec].articles.length === 0) {
        console.log(`[CRAWLER] Section ${sec} has no crawled matches. Hydrating fallback articles from news_pool.`);
        const secFallbacks = pools.filter(p => p && p.section === sec);
        // Take up to 2 items
        secFallbacks.slice(0, 2).forEach(fbItem => {
          const clone = JSON.parse(JSON.stringify(fbItem));
          clone.pubDate = new Date(Date.now() - Math.random() * 24 * 3600000).toISOString();
          freshData[sec].articles.push(clone);
        });
      }
    });

    // Replace master D
    D = freshData;
    persist();
    stamp(D.lastUpdated);
    render();

    // Trigger local server synchronization
    await syncCrawlToServer(D);
  }

  async function doRefresh(silent) {
    if (!silent) { 
      refreshIcon.classList.add('spinning'); 
      refreshBtn.disabled = true; 
      refreshBtn.querySelector('.btn__label').textContent = 'Refreshing…';
      
      // Animate Crawl Progress Bar
      if (crawlProgressBar) {
        crawlProgressBar.style.transition = 'none';
        crawlProgressBar.style.opacity = '1';
        crawlProgressBar.style.width = '0%';
        setTimeout(() => {
          crawlProgressBar.style.transition = 'width 0.9s cubic-bezier(0.1, 0.8, 0.25, 1)';
          crawlProgressBar.style.width = '100%';
        }, 10);
      }
    }

    try {
      // Shifting fully to live internet crawling directly!
      await crawlRealInternetNews();
      ensureTickerHistory();
      endRefresh();
      // also re-fetch RSS on manual refresh
      if (!silent) rssFetchAll();
      return;
    } catch (crawlErr) {
      console.warn('[CRAWLER] Live crawling failed. Falling back to API/local simulation:', crawlErr.message);
    }

    try {
      const r = await fetchWithTimeout('/api/refresh', { method: 'POST' }, 8000);
      if (r.ok) { D = await r.json(); ensureTickerHistory(); render(); stamp(D.lastUpdated); endRefresh(); return; }
    } catch (_) { }
    
    // local sim fallback
    setTimeout(() => {
      try {
        if (D && D.ticker) D.ticker = D.ticker.map(microShift);
        injectSimulatedArticleBatchLocal(4); // Pull a batch of 4 articles relative to original templates
        if (D) D.lastUpdated = new Date().toISOString();
        persist(); render(); if (D) stamp(D.lastUpdated);
      } catch (simErr) {
        console.error('[SIMULATION] Fallback simulation crash:', simErr.message);
      }
      endRefresh();
    }, silent ? 0 : 900);
    
    // also re-fetch RSS on manual refresh
    if (!silent) rssFetchAll();
  }
  function endRefresh() { 
    refreshIcon.classList.remove('spinning'); 
    refreshBtn.disabled = false; 
    refreshBtn.querySelector('.btn__label').textContent = 'Refresh Now'; 
    if (crawlProgressBar) {
      setTimeout(() => {
        crawlProgressBar.style.transition = 'opacity 0.4s';
        crawlProgressBar.style.opacity = '0';
        setTimeout(() => {
          crawlProgressBar.style.width = '0%';
          crawlProgressBar.style.opacity = '1';
          crawlProgressBar.style.transition = 'none';
        }, 400);
      }, 500);
    }
  }


  /* ═══════════════════════════════════════════════════════
     SECTION A: ENHANCED TICKER ENGINE
     Seamless infinite scroll with real-time variable injection
     ═══════════════════════════════════════════════════════ */

  /**
   * initTickerScroll — Build the ticker DOM with duplicated content
   * for a visually seamless CSS-driven infinite marquee.
   * The track contains [items][items] so when the first half scrolls
   * out of view (translate -50%), the second half is already showing
   * the exact same sequence → no visible gap.
   */
  function initTickerScroll() {
    if (!D || !D.ticker) return;
    buildTickerDOM(D.ticker);
    calibrateTickerSpeed();
  }

  function buildTickerDOM(arr) {
    // Build one full pass of ticker items
    const onePass = arr.map(t => {
      const cls = t.positive ? 'up' : 'dn';
      const arrow = t.positive ? '▲' : '▼';
      return `<span class="ticker-item" data-ticker-name="${t.name}">` +
        `<span class="ticker-name">${t.name}</span>` +
        `<span class="ticker-val">${t.value}</span>` +
        `<span class="ticker-chg ${cls}">${arrow} ${t.change}</span>` +
        `</span>`;
    }).join('');

    // Duplicate the entire pass for seamless CSS loop
    tickerTrack.innerHTML = onePass + onePass;
  }

  /**
   * calibrateTickerSpeed — Dynamically set the animation duration
   * based on actual content width so speed remains consistent
   * regardless of how many items are in the ticker.
   */
  function calibrateTickerSpeed() {
    requestAnimationFrame(() => {
      const trackW = tickerTrack.scrollWidth;
      // Target: ~80px per second scroll speed
      const duration = Math.max(30, trackW / 80);
      tickerTrack.style.animationDuration = duration + 's';
    });
  }

  /**
   * renderTicker — Re-render ticker with current data.
   * Called on data load and after micro-shifts.
   */
  function renderTicker(arr) {
    if (!arr || !tickerTrack) return;
    buildTickerDOM(arr);
    calibrateTickerSpeed();
  }

  /**
   * tickerPulse — Simulate real-time price micro-movements
   * by randomly shifting 1-2 ticker values every cycle.
   * Updates the DOM in-place for smooth visual continuity.
   */
  function tickerPulse() {
    if (!D || !D.ticker) return;
    // Shift 1-2 random ticker items
    const shifts = 1 + (Math.random() > 0.6 ? 1 : 0);
    for (let s = 0; s < shifts; s++) {
      const i = Math.random() * D.ticker.length | 0;
      const oldItem = D.ticker[i];
      D.ticker[i] = microShift(oldItem);

      // Record in rolling histories
      const name = D.ticker[i].name;
      const newVal = parseFloat(String(D.ticker[i].value || '').replace(/[^0-9.-]/g, '')) || 100;
      if (tickerHistories[name]) {
        tickerHistories[name].push(newVal);
        tickerHistories[name].shift(); // maintain 30 points
      }
    }
    // In-place DOM update (avoids full re-render for smoother scrolling)
    updateTickerValues(D.ticker);

    // If the active ticker in the analytics drawer was updated, redraw its sparkline in real-time!
    if (activeTickerName && tickerHistories[activeTickerName]) {
      showTickerSparkline(activeTickerName);
    }
  }

  /**
   * updateTickerValues — Surgically update value/change spans
   * in-place without rebuilding the entire ticker DOM,
   * preserving the current scroll position.
   */
  function updateTickerValues(arr) {
    const items = tickerTrack.querySelectorAll('.ticker-item');
    items.forEach(el => {
      const name = el.getAttribute('data-ticker-name');
      const match = arr.find(t => t.name === name);
      if (!match) return;
      const valEl = el.querySelector('.ticker-val');
      const chgEl = el.querySelector('.ticker-chg');
      if (valEl) valEl.textContent = match.value;
      if (chgEl) {
        const arrow = match.positive ? '▲' : '▼';
        chgEl.textContent = arrow + ' ' + match.change;
        chgEl.className = 'ticker-chg ' + (match.positive ? 'up' : 'dn');
      }
    });
  }

  function microShift(t) {
    let v = parseFloat(String(t.value || '').replace(/[^0-9.\-]/g, '')); let p = parseFloat(String(t.change || '').replace(/[^0-9.\-]/g, ''));
    const f = (Math.random() - .5) * .08; v *= 1 + f / 100; p += f;
    let s;
    if (/Nifty/.test(t.name)) s = v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    else if (/Yield|10Y|Liquid|ST Debt/.test(t.name)) s = v.toFixed(3) + '%';
    else if (/Gold|Silver/.test(t.name)) s = '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    else if (/DXY/.test(t.name)) s = v.toFixed(2);
    else s = v.toFixed(2);
    return { ...t, value: s, change: (p >= 0 ? '+' : '') + p.toFixed(2) + '%', positive: p >= 0 };
  }


  /* ═══════════════════════════════════════════════════════
     SECTION B: RSS CORVAL ENGINE
     Async fetch loop via rss2json.com public proxy
     Bypasses CORS by converting XML RSS → JSON
     ═══════════════════════════════════════════════════════ */

  /**
   * RSS_FEEDS — High-signal financial reporting streams.
   * Each entry has a label, the raw RSS URL, and a category tag.
   */
  const RSS_FEEDS = [
    {
      label: 'ET Markets',
      url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
      category: 'Markets'
    },
    {
      label: 'ET Banking & Finance',
      url: 'https://economictimes.indiatimes.com/industry/banking/finance/rssfeeds/13358259.cms',
      category: 'Banking'
    },
    {
      label: 'ET Economy',
      url: 'https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms',
      category: 'Macro'
    },
    {
      label: 'Livemint',
      url: 'https://www.livemint.com/rss/markets',
      category: 'Markets'
    },
    {
      label: 'Business Standard',
      url: 'https://www.business-standard.com/rss/markets-106.rss',
      category: 'Markets'
    },
    {
      label: 'Moneycontrol',
      url: 'https://www.moneycontrol.com/rss/latestnews.xml',
      category: 'Wire'
    },
    {
      label: 'Taxguru Compliance',
      url: 'https://taxguru.in/feed',
      category: 'Audit'
    },
    {
      label: 'CAClubIndia News',
      url: 'https://www.caclubindia.com/rss/news.asp',
      category: 'Audit'
    }
  ];

  const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';
  const RSS_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const RSS_MAX_ITEMS = 25;            // max items to display
  const RSS_MEM_LIMIT = 100;           // max items to hold in cache

  /**
   * rssBootstrap — Kickstart the RSS engine.
   * Load from localStorage cache first (instant UI), then fetch live.
   */
  function rssBootstrap() {
    // Hydrate from cache for instant render
    const cached = localStorage.getItem('af_rss_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rssCache = parsed;
          renderRSS();
        }
      } catch (_) { }
    }

    // Fetch live data
    rssFetchAll();

    // Schedule recurring fetch loop
    rssFetchTimer = setInterval(rssFetchAll, RSS_INTERVAL);
  }

  /**
   * rssFetchAll — Fan-out parallel requests to all RSS feeds.
   * Aggregates, deduplicates, sorts by date, and renders.
   */
  async function rssFetchAll() {
    rssStatus.textContent = 'Fetching live wire data…';
    rssPulse.classList.remove('live');

    const results = await Promise.allSettled(
      RSS_FEEDS.map(feed => rssFetchOne(feed))
    );

    let items = [];
    let successCount = 0;

    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        items = items.concat(result.value);
        successCount++;
      }
    });

    if (items.length === 0) {
      rssStatus.textContent = 'Wire services unavailable — displaying cached data';
      rssPulse.classList.remove('live');
      // Keep showing cached data if available
      if (rssCache.length > 0) renderRSS();
      return;
    }

    // Merge newly fetched items with the existing cache!
    let merged = items.concat(rssCache);

    // Deduplicate by title similarity
    merged = rssDedup(merged);

    // Sort by publication date (newest first)
    merged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Cap at max cache size
    merged = merged.slice(0, RSS_MEM_LIMIT);

    rssCache = merged;
    renderRSS();

    // Persist to localStorage
    try { localStorage.setItem('af_rss_cache', JSON.stringify(merged)); } catch (_) { }

    // Update status
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    rssStatus.textContent = `${successCount}/${RSS_FEEDS.length} feeds connected · ${merged.length} articles · Last sync: ${ts}`;
    rssPulse.classList.add('live');
  }

  /**
   * rssFetchOne — Fetch a single RSS feed through the rss2json proxy.
   * Returns an array of normalized article objects.
   */
  async function rssFetchOne(feed) {
    try {
      const proxyUrl = RSS_PROXY + encodeURIComponent(feed.url);
      const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });

      if (!response.ok) return [];

      const data = await response.json();

      if (data.status !== 'ok' || !data.items || !Array.isArray(data.items)) return [];

      return data.items
        .filter(item => item.title && item.title.trim().length > 10)
        .map(item => ({
          title: rssCleanText(item.title),
          description: rssCleanText(item.description || ''),
          link: item.link || '#',
          pubDate: item.pubDate || new Date().toISOString(),
          thumbnail: item.thumbnail || item.enclosure?.link || '',
          source: feed.label,
          category: feed.category,
          guid: item.guid || item.link || item.title
        }));

    } catch (err) {
      console.warn(`[RSS] Feed failed: ${feed.label}`, err.message);
      return [];
    }
  }

  /**
   * rssCleanText — Strip HTML tags and decode entities
   * from RSS feed content strings.
   */
  function rssCleanText(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    // Trim excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Cap description length
    if (text.length > 400) text = text.substring(0, 397) + '…';
    return text;
  }

  /**
   * rssDedup — Remove duplicate articles by normalizing
   * titles and comparing the first 60 characters.
   */
  function rssDedup(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * rssTimeAgo — Human-readable relative time from pubDate.
   */
  function rssTimeAgo(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  /**
   * getImpactScore — Compute regulatory/market impact score for an RSS item
   * to enable sorting by high-impact developments.
   */
  function getImpactScore(item) {
    if (!item) return 0;
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const text = title + " " + desc;
    
    let score = 0;
    
    // High regulatory triggers
    if (/rbi|reserve bank|sebi|mca|nfra|pmla|drc-01|gst|tax|cbic/i.test(text)) score += 30;
    if (/penalty|penalties|fine|court|nclt|enforcement|sfio|fraud|scam/i.test(text)) score += 25;
    if (/clearing|settlement|audit|reconciliation|compliance|directives/i.test(text)) score += 20;
    if (/banking|credit|nbfc|equity|ipo|reit/i.test(text)) score += 10;
    
    // Direct regulator source bonus
    if (/RBI|SEBI|PIB/i.test(item.source || '')) score += 15;
    
    return score;
  }

  /**
   * renderRSS — Inject RSS articles into the Live Wire mosaic grid.
   * First article gets the lead (span-8) treatment,
   * remaining articles get standard span-4 wire cards.
   */
  function renderRSS() {
    if (!rssGrid) return;

    if (rssCache.length === 0) {
      rssGrid.innerHTML = '<div class="wire-empty">No live wire data available. Feeds will retry automatically.</div>';
      return;
    }

    const sortSelect = $('rss-sort-select');
    const sortCriteria = sortSelect ? sortSelect.value : 'recency';

    let sortedItems = [...rssCache];

    if (sortCriteria === 'regulatory') {
      sortedItems.sort((a, b) => getImpactScore(b) - getImpactScore(a));
    } else if (sortCriteria === 'regulators_first') {
      const isRegulator = source => /rbi|sebi|pib|mca|nfra|cbic|tax/i.test(source || '');
      sortedItems.sort((a, b) => {
        const regA = isRegulator(a.source) ? 1 : 0;
        const regB = isRegulator(b.source) ? 1 : 0;
        if (regA !== regB) return regB - regA;
        return new Date(b.pubDate) - new Date(a.pubDate);
      });
    } else if (sortCriteria === 'density') {
      sortedItems.sort((a, b) => {
        const lenA = (a.title || '').length + (a.description || '').length;
        const lenB = (b.title || '').length + (b.description || '').length;
        return lenB - lenA;
      });
    } else {
      // default: recency
      sortedItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    }

    const slicedItems = sortedItems.slice(0, RSS_MAX_ITEMS);

    rssGrid.innerHTML = slicedItems.map((item, i) => {
      const isLead = i === 0;
      const cls = isLead ? 'wire-card wire-card--lead' : 'wire-card';
      const timeAgo = rssTimeAgo(item.pubDate);
      const localDate = new Date(item.pubDate);
      const exactTimeStr = localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeDisplay = `${exactTimeStr} (${timeAgo})`;
      const desc = item.description || '';
      const searchStr = (item.title + ' ' + desc + ' ' + item.source).replace(/"/g, '&quot;');

      return `<div class="${cls}" data-s="${searchStr}">
        <div class="wire-card__source">
          <span class="wire-card__source-badge">${item.category}</span>
          ${item.source}
          <span class="wire-card__time">${timeDisplay}</span>
        </div>
        <a href="${item.link}" target="_blank" rel="noopener" class="wire-card__hl">${item.title}</a>
        ${desc ? `<p class="wire-card__desc">${desc}</p>` : ''}
        <div class="wire-card__foot" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <a href="${item.link}" target="_blank" rel="noopener" style="text-decoration:none; font-weight:700;">Read Full Article →</a>
          <a href="#" onclick="openSimulatorDrawer('${item.guid || item.link}', event)" style="color:var(--accent); font-weight:800; text-decoration:none; margin-left:auto;">Explain Like I'm 10 →</a>
        </div>
      </div>`;
    }).join('');

    // Apply active search filter to new RSS cards
    if (query) applySearch(query);
  }


  /* ═══════════════════════════════════════════════════════
     SECTION C: EXISTING RENDER ENGINE (unchanged)
     ═══════════════════════════════════════════════════════ */

  /* ── 9. IMAGE FALLBACK ENGINE ───────────────────────── */
  const FALLBACKS = {
    default: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    rbi: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    realty: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
    fraud: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'
  };

  function imgTag(src, alt, cls) {
    const fb = guessFallback(alt);
    return `<img src="${src || fb}" class="${cls}" alt="" loading="lazy"
      onerror="this.onerror=null;this.src='${fb}';if(this.naturalWidth===0){this.style.display='none';}">`;
  }

  function guessFallback(text) {
    if (!text) return FALLBACKS.default;
    const t = text.toLowerCase();
    if (/rbi|reserve bank|fed|monetary/.test(t)) return FALLBACKS.rbi;
    if (/semi|chip|fab|tech|saas|ai/.test(t)) return FALLBACKS.tech;
    if (/gurgaon|cyber|realty|office|lease/.test(t)) return FALLBACKS.realty;
    if (/fraud|forensic|sec |anomaly/.test(t)) return FALLBACKS.fraud;
    return FALLBACKS.default;
  }

  /* ── 10. RENDER ENGINE ──────────────────────────────── */
  function render() {
    renderTicker(D.ticker);
    renderSec1(D.section1);
    renderSec2(D.section2);
    renderSec3(D.section3);
    renderSec4(D.section4);
    renderSec5(D.section5);
    renderFw(D.frameworks);
    renderFrictionTelemetry();
    wireAccordions();

    // Bind global methods for inline clicks
    window.togglePin = togglePin;
    window.openSimulatorDrawer = openSimulatorDrawer;

    // Filter active desks by horizontal tabs
    filterDeskSections();

    updateExecutiveBriefing();

    if (query) applySearch(query);
  }

  /* ── 10b. DYNAMIC EXECUTIVE SUMMARY COLUMN ────────────── */
  function updateExecutiveBriefing() {
    const birdseyeEl = $('briefing-birdseye');
    const storyEl = $('briefing-story');
    const marketEl = $('briefing-market-impact');
    const startupEl = $('briefing-startup-impact');
    const takeawayEl = $('briefing-takeaway');
    
    if (!storyEl || !marketEl || !startupEl || !takeawayEl) return;

    // Compile all currently visible articles on the page (at this particular moment!)
    const activeBlocks = [];

    // 1) Find all visible cards in main editorial grids
    document.querySelectorAll('.workspace__main-desks .block:not(.hidden)').forEach(el => {
      const hlEl = el.querySelector('.block__hl');
      if (hlEl && el.offsetParent !== null) { // verify it's physically visible
        const title = hlEl.textContent.trim();
        const pEl = el.querySelector('.seg p') || el.querySelector('.seg__label + p') || el.querySelector('p');
        const desc = pEl ? pEl.textContent.trim() : '';
        activeBlocks.push({ title, desc });
      }
    });

    // 2) Find all visible accordions in Daily Brief section
    document.querySelectorAll('.workspace__main-desks .acc:not(.hidden)').forEach(el => {
      const hlEl = el.querySelector('.acc__title');
      if (hlEl && el.offsetParent !== null) {
        const title = hlEl.textContent.trim();
        const pEl = el.querySelector('.acc__drawer-inner p') || el.querySelector('.seg p');
        const desc = pEl ? pEl.textContent.trim() : '';
        activeBlocks.push({ title, desc });
      }
    });

    // 3) Find all visible wire-cards in RSS section
    document.querySelectorAll('#rss-grid .wire-card:not(.hidden)').forEach(el => {
      const hlEl = el.querySelector('.wire-card__hl');
      if (hlEl && el.offsetParent !== null) {
        const title = hlEl.textContent.trim();
        const pEl = el.querySelector('.wire-card__desc');
        const desc = pEl ? pEl.textContent.trim() : '';
        activeBlocks.push({ title, desc });
      }
    });

    if (activeBlocks.length === 0) {
      if (birdseyeEl) birdseyeEl.innerHTML = "No active corporate updates match the selected Desk tab or keyword search filters.";
      storyEl.innerHTML = "No compliance news loaded. Change search keywords or click 'Refresh Now'.";
      marketEl.innerHTML = "Awaiting compliance news...";
      startupEl.innerHTML = "Awaiting compliance news...";
      takeawayEl.innerHTML = "Awaiting compliance news...";
      return;
    }

    // Extract categories, count matches and pick specific highlights
    let bankingCount = 0;
    let taxCount = 0;
    let marketCount = 0;
    let fraudCount = 0;
    let techCount = 0;

    const visibleTitles = [];

    activeBlocks.forEach(a => {
      const text = (a.title + " " + a.desc).toLowerCase();
      visibleTitles.push(a.title);

      if (/bank|credit|nbfc|rbi|lending|monetary/.test(text)) bankingCount++;
      if (/tax|gst|audit|nfra|accounting|mca|cbic/.test(text)) taxCount++;
      if (/equity|stock|sebi|clearing|settlement|reit|ipo/.test(text)) marketCount++;
      if (/fraud|scam|enforcement|penalty|pmla|nclt|sfio/.test(text)) fraudCount++;
      if (/ai|tech|saas|startup|b2b/.test(text)) techCount++;
    });

    // Determine representative samples to list in Bird's-Eye View
    const sampleHl1 = visibleTitles[0] || "";
    const sampleHl2 = visibleTitles[1] || "";

    // Determine connections
    const connections = [];
    if (bankingCount > 0) connections.push("RBI credit channel controls");
    if (taxCount > 0) connections.push("CBIC tax reconciliation audits");
    if (marketCount > 0) connections.push("SEBI instant settlement cycles");
    if (fraudCount > 0) connections.push("forensic anti-fraud policing");
    if (techCount > 0) connections.push("B2B compliance SaaS automation");

    // Compose dynamic Bird's-Eye connecting summary
    let birdseyeText = "";
    if (connections.length > 0) {
      const themesJoined = connections.length === 1 
        ? connections[0] 
        : connections.slice(0, -1).join(", ") + " and " + connections[connections.length - 1];
        
      birdseyeText = `Currently tracking a live compliance nexus across ${activeBlocks.length} active developments on your screen. This view directly synthesizes <strong>${themesJoined}</strong> to enforce financial safety. `;
      
      if (sampleHl1) {
        birdseyeText += `Specifically, headlines like <em style="color:var(--accent); font-family:var(--sans); font-size:11.5px; font-weight:700;">"${sampleHl1.substring(0, 80)}${sampleHl1.length > 80 ? '...' : ''}"</em> `;
      }
      if (sampleHl2) {
        birdseyeText += `interact with reports such as <em style="color:var(--accent); font-family:var(--sans); font-size:11.5px; font-weight:700;">"${sampleHl2.substring(0, 80)}${sampleHl2.length > 80 ? '...' : ''}"</em>, `;
      }
      birdseyeText += `revealing a coordinated push by Indian regulators to digitize audit trails while tightening capital rotation corridors.`;
    } else {
      birdseyeText = `Currently displaying ${activeBlocks.length} financial and market developments. Telemetry reports standard operational flows and stable liquidity cycles across Indian corporate desks.`;
    }

    if (birdseyeEl) birdseyeEl.innerHTML = birdseyeText;

    // Determine dominant theme for ELI10 logic
    let dominantTheme = "general regulatory shifts";
    const counts = [
      { name: "credit", val: bankingCount },
      { name: "tax", val: taxCount },
      { name: "capital", val: marketCount },
      { name: "fraud", val: fraudCount },
      { name: "tech", val: techCount }
    ];
    counts.sort((a, b) => b.val - a.val);
    if (counts[0].val > 0) {
      if (counts[0].name === "credit") dominantTheme = "tightening credit channels and banking regulations";
      else if (counts[0].name === "tax") dominantTheme = "increased corporate tax auditing and compliance checks";
      else if (counts[0].name === "capital") dominantTheme = "capital markets velocity and investment policy adjustments";
      else if (counts[0].name === "fraud") dominantTheme = "intensified anti-fraud policing and forensic audits";
      else if (counts[0].name === "tech") dominantTheme = "enterprise B2B continuous compliance opportunities";
    }

    // Extract visible entity names and rupee amounts from active screen blocks per category
    let playfulStory = "Imagine our neighborhood society ground where all kids gather. ";
    const storyParts = [];

    // Categorize active blocks to extract their individual company names and money values on the fly
    let bankingArticle = activeBlocks.find(b => /bank|credit|nbfc|rbi|lending|monetary/.test((b.title + " " + b.desc).toLowerCase()));
    let taxArticle = activeBlocks.find(b => /tax|gst|audit|nfra|accounting|mca|cbic/.test((b.title + " " + b.desc).toLowerCase()));
    let marketArticle = activeBlocks.find(b => /equity|stock|sebi|clearing|settlement|reit|ipo/.test((b.title + " " + b.desc).toLowerCase()));
    let fraudArticle = activeBlocks.find(b => /fraud|scam|enforcement|penalty|pmla|nclt|sfio/.test((b.title + " " + b.desc).toLowerCase()));
    let techArticle = activeBlocks.find(b => /ai|tech|saas|startup|b2b/.test((b.title + " " + b.desc).toLowerCase()));

    if (bankingCount > 0 && bankingArticle) {
      const ent = extractDynamicEntity(bankingArticle.title, bankingArticle.desc);
      const moneyMatch = bankingArticle.title.match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i) || (bankingArticle.desc || "").match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i);
      const money = moneyMatch ? moneyMatch[0] : "a massive stack of candies";
      storyParts.push(`The society uncle (RBI Governor) tells <strong>${ent}</strong> that if they want to borrow the premium society bat to build their project, they must deposit <strong>${money}</strong> worth of safety backup balls in the locker so the game doesn't halt!`);
    }
    if (taxCount > 0 && taxArticle) {
      const ent = extractDynamicEntity(taxArticle.title, taxArticle.desc);
      const moneyMatch = taxArticle.title.match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i) || (taxArticle.desc || "").match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i);
      const money = moneyMatch ? moneyMatch[0] : "an extra sweet tax";
      storyParts.push(`Meanwhile, the school supervisor demands <strong>${ent}</strong> pay <strong>${money}</strong> because the halwai forgot to register the receipt slips in the centralized register book!`);
    }
    if (marketCount > 0 && marketArticle) {
      const ent = extractDynamicEntity(marketArticle.title, marketArticle.desc);
      storyParts.push(`But the good news is that <strong>${ent}</strong> has set up a new high-speed ATVM phone scanner (SEBI T+0) on the Dadar platform so you get your train ticket instantly in seconds without any lines!`);
    }
    if (fraudCount > 0 && fraudArticle) {
      const ent = extractDynamicEntity(fraudArticle.title, fraudArticle.desc);
      const moneyMatch = fraudArticle.title.match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i) || (fraudArticle.desc || "").match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i);
      const money = moneyMatch ? moneyMatch[0] : "a massive sweet debt";
      storyParts.push(`Also, a kid named <strong>${ent}</strong> hid a huge sweet debt of <strong>${money}</strong> in 5 secret paper boxes with friends, but the smart grandmother (Forensic Watchdog) tracked the gulab jamun crumbs!`);
    }
    if (techCount > 0 && techArticle) {
      const ent = extractDynamicEntity(techArticle.title, techArticle.desc);
      storyParts.push(`And Sharma Uncle's kirana shop bahi-khata notebook for <strong>${ent}</strong> is now written in magical permanent ink so nobody can scribble pencil edits in secret anymore!`);
    }

    if (storyParts.length > 0) {
      // take at most 3 parts for readability
      playfulStory += storyParts.slice(0, 3).join(" ") + " Even though it feels like a lot of rules, it keeps our society ground super safe and fair so that the games never get stopped and no one can cheat!";
    } else {
      playfulStory = "The neighborhood elders have set simple guidelines for our local lemonade stand, making sure we write down every cup sold and keep a backup jar of sugar in our back room. It takes a little more notebook writing, but keeps our stand running smoothly!";
    }

    // Market Impact
    let marketComments = [];
    if (bankingCount > 0) marketComments.push("big banks (like SBI) locking safety buffers, which shifts rupee borrowing rates slightly higher");
    if (taxCount > 0) marketComments.push("tax matching routines where accountants verify every single rupee invoice to avoid tax freezes");
    if (marketCount > 0) marketComments.push("high-velocity capital swaps where cash from share sales lands in your bank account on the same day");
    if (fraudCount > 0) marketComments.push("regulatory crackdowns on corporate promoters routing funds through shell companies");
    if (techCount > 0) marketComments.push("auditors verifying continuous ERP tracking logs to shield directors from legal liabilities");

    let marketThemesJoined = marketComments.length > 0
      ? marketComments.slice(0, 3).join(", leading to ")
      : "standard volume consolidation and steady trade flows";
    
    let marketImpact = `<p>Because of these visible shifts, we are seeing <strong>${marketThemesJoined}</strong>. This keeps the Indian capital corridor stable, but demands immediate high-fidelity audits for businesses.</p>`;

    // Startups/B2B Impact
    let startupComments = [];
    if (bankingCount > 0) startupComments.push("fintechs building automated credit scoring calculators");
    if (taxCount > 0) startupComments.push("SaaS developers designing e-invoicing matching bots to save crores in penalties");
    if (marketCount > 0) startupComments.push("wealth-techs upgrading their trading settlement APIs to support real-time sweeps");
    if (fraudCount > 0) startupComments.push("forensic transaction scanners to flag security anomalies");
    if (techCount > 0) startupComments.push("continuous compliance tracking systems to automate bahi-khata logs");

    let startupThemesJoined = startupComments.length > 0
      ? startupComments.slice(0, 3).join(" or ")
      : "smart automation dashboards to streamline operations";

    let startupImpact = `<p>For young Indian founders, this complex compliance landscape is a huge opportunity! You can build automated software bots for <strong>${startupThemesJoined}</strong>, helping traditional businesses save time and massive penalties.</p>`;

    // Takeaway
    let takeawayBrief = `<p style="font-weight: 600; color: var(--accent);">Even though the government's rulebooks are getting thicker, it keeps our financial system safe. Indian businesses should automate their bahi-khatas, verify their vendor invoices, and keep a backup box of cash ready!</p>`;

    storyEl.innerHTML = playfulStory;
    marketEl.innerHTML = marketImpact;
    startupEl.innerHTML = startupImpact;
    takeawayEl.innerHTML = takeawayBrief;
  }

  /* helpers */
  function tag(priority) {
    const p = (priority || '').toLowerCase();
    return `<span class="tag tag--${p}">${priority}</span>`;
  }
  function tierBadge(n) { return `<span class="tag--tier">T${n}</span>`; }
  function footBlock(a) {
    const simulatorLink = `<span style="margin-left:auto;"><a href="#" onclick="openSimulatorDrawer('${a.id}', event)" style="color:var(--accent);font-weight:800;text-decoration:none;">Explain Like I'm 10 →</a></span>`;
    const gazetteUrl = a.rawGazette || '#';
    const gazetteLabel = a.rawGazetteLabel || 'Gazette Source';
    const lensUrl = a.marketLens || '#';
    const lensLabel = a.marketLensLabel || 'Market Media';
    return `<div class="foot">
      <span>Raw Gazette: <a href="${gazetteUrl}" target="_blank" rel="noopener">${gazetteLabel}</a></span>
      <span>Market Lens: <a href="${lensUrl}" target="_blank" rel="noopener">${lensLabel}</a></span>
      ${simulatorLink}
    </div>`;
  }
  function getPinBtn(a) {
    const pinActive = pinnedArticles.has(a.id) ? 'active' : '';
    return `<button class="pin-btn ${pinActive}" onclick="togglePin('${a.id}', event)" title="Pin to top"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:2px;vertical-align:middle;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></button>`;
  }
  function searchable(a) {
    return (a.title + ' ' + (a.whatHappened || '') + ' ' + (a.whyItMatters || '') + ' ' + (a.impact || '') + ' ' + (a.details || '')).replace(/"/g, '&quot;');
  }

  /* Section 1: Front Page */
  function renderSec1(s) {
    if (!s || !s.articles || s.articles.length === 0) {
      sec1.innerHTML = '<div class="wire-empty">ALL FINANCIALS Terminal online. Awaiting private intelligence feed synchronization. Click \'Refresh Now\' to sync wire services.</div>';
      return;
    }
    const sorted = sortArticlesByDecay(s.articles);
    sec1.innerHTML = sorted.map((a, i) => {
      // Dynamically make index 0 hero, others feature
      const span = i === 0 ? 'hero' : 'feature';
      const isPinned = pinnedArticles.has(a.id) ? 'block--pinned' : '';
      const cls = (span === 'hero' ? 'block--hero' : 'block--feature') + ' ' + isPinned;
      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${imgTag(a.image, a.title, 'block__img')}
        <div class="block__meta">
          ${getPinBtn(a)}
          ${tag(a.priority)}${tierBadge(a.sourceTier)}
          <span class="block__date">${formatDateTime(a.pubDate)}</span>
        </div>
        <a href="${a.rawGazette}" target="_blank" class="block__hl">${a.title}</a>
        <div class="seg"><span class="seg__label">[What Happened]</span><p>${a.whatHappened}</p></div>
        <div class="seg"><span class="seg__label">[Why It Matters]</span><p>${a.whyItMatters}</p></div>
        <div class="seg"><span class="seg__label">[Business & Investment Impact]</span><p>${a.impact}</p></div>
        ${footBlock(a)}
      </div>`;
    }).join('');
  }

  /* Section 2: Daily Brief (accordions) */
  function renderSec2(s) {
    if (!s || !s.articles || s.articles.length === 0) {
      sec2.innerHTML = '<div class="wire-empty">No daily brief records loaded. Sync terminal feed.</div>';
      return;
    }
    const sorted = sortArticlesByDecay(s.articles);
    sec2.innerHTML = sorted.map(a => `
      <div class="acc" data-s="${searchable(a)}">
        <div class="acc__head">
          <img src="${a.image || guessFallback(a.title)}" class="acc__thumb" alt="" loading="lazy"
            onerror="this.onerror=null;this.src='${guessFallback(a.title)}';if(this.naturalWidth===0)this.style.display='none';">
          <span class="acc__title">${a.title}</span>
          <div class="acc__tags">
            <span class="acc__date">${formatDateTime(a.pubDate)}</span>
            ${getPinBtn(a)}
            ${tag(a.priority)}${tierBadge(a.sourceTier)}
            <svg class="acc__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="acc__drawer"><div class="acc__drawer-inner">
          <div class="seg"><span class="seg__label">[What Happened]</span><p>${a.whatHappened}</p></div>
          <div class="seg"><span class="seg__label">[Why It Matters]</span><p>${a.whyItMatters}</p></div>
          <div class="seg"><span class="seg__label">[Business & Investment Impact]</span><p>${a.impact}</p></div>
          ${footBlock(a)}
        </div></div>
      </div>`).join('');
  }

  /* Section 3: Regulatory & Audit */
  function renderSec3(s) {
    if (!s || !s.articles || s.articles.length === 0) {
      sec3.innerHTML = '<div class="wire-empty">No regulatory logs sync\'d.</div>';
      return;
    }
    const sorted = sortArticlesByDecay(s.articles);
    sec3.innerHTML = sorted.map((a, i) => {
      // Index 0 gets hero, index 1 gets feature, others get mini
      const span = i === 0 ? 'hero' : (i === 1 ? 'feature' : 'mini');
      const isPinned = pinnedArticles.has(a.id) ? 'block--pinned' : '';
      const cls = (span === 'hero' ? 'block--hero' : (span === 'feature' ? 'block--feature' : 'block--mini')) + ' ' + isPinned;
      const hasImg = a.image && span !== 'mini';
      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${hasImg ? imgTag(a.image, a.title, 'block__img') : ''}
        <div class="block__meta">
          ${getPinBtn(a)}
          ${tag(a.priority || 'Important')}${tierBadge(a.sourceTier)}
          <span class="block__date">${formatDateTime(a.pubDate)}</span>
        </div>
        <a href="${a.rawGazette}" target="_blank" class="block__hl">${a.title}</a>
        <div class="seg"><p>${a.details || a.whatHappened || ''}</p></div>
        ${a.whyItMatters ? `<div class="seg"><span class="seg__label">[Why It Matters]</span><p>${a.whyItMatters}</p></div>` : ''}
        ${a.impact ? `<div class="seg"><span class="seg__label">[Systemic & Audit Impact]</span><p>${a.impact}</p></div>` : ''}
        ${footBlock(a)}
      </div>`;
    }).join('');
  }

  /* Section 4: Fraud (dark ledger) */
  function renderSec4(s) {
    if (!s || !s.articles || s.articles.length === 0) {
      sec4.innerHTML = '<div class="wire-empty">Forensic watches offline. Sync required.</div>';
      return;
    }
    const sorted = sortArticlesByDecay(s.articles);
    sec4.innerHTML = sorted.map((a, i) => {
      const isPinned = pinnedArticles.has(a.id) ? 'block--pinned' : '';
      const cls = 'block--feature ' + isPinned;
      const bulletsHtml = a.fraudBullets 
        ? `<ul class="fraud-list">${a.fraudBullets.map(b => `<li class="fraud-item"><strong>${b.label}</strong>${b.text}</li>`).join('')}</ul>`
        : `<div class="seg"><p>${a.whatHappened || ''}</p></div>${a.whyItMatters ? `<div class="seg"><span class="seg__label">[Why It Matters]</span><p>${a.whyItMatters}</p></div>` : ''}${a.impact ? `<div class="seg"><span class="seg__label">[Systemic Impact]</span><p>${a.impact}</p></div>` : ''}`;
      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${a.image ? imgTag(a.image, a.title, 'block__img') : ''}
        <div class="block__meta">
          ${getPinBtn(a)}
          <span class="tag tag--forensics">Forensics</span>${tierBadge(a.sourceTier)}
          <span class="block__date block__date--light">${formatDateTime(a.pubDate)}</span>
        </div>
        <a href="${a.rawGazette}" target="_blank" class="block__hl">${a.title}</a>
        ${bulletsHtml}
        ${footBlock(a)}
      </div>`;
    }).join('');
  }

  /* Section 5: Strategy & Capital Markets */
  function renderSec5(s) {
    if (!s || !s.articles || s.articles.length === 0) {
      sec5.innerHTML = '<div class="wire-empty">Corporate strategy telemetry offline.</div>';
      return;
    }
    const sorted = sortArticlesByDecay(s.articles);
    sec5.innerHTML = sorted.map((a, i) => {
      // Index 0 gets hero, index 1 gets feature, others get mini
      const span = i === 0 ? 'hero' : (i === 1 ? 'feature' : 'mini');
      const isPinned = pinnedArticles.has(a.id) ? 'block--pinned' : '';
      const cls = (span === 'hero' ? 'block--hero' : (span === 'feature' ? 'block--feature' : 'block--mini')) + ' ' + isPinned;
      const hasImg = a.image && span !== 'mini';
      let extra = '';

      if (a.metrics) {
        extra = `<div class="metrics">${Object.entries(a.metrics).map(([k, v]) => `<div class="metric"><span class="metric__k">${k}</span><span class="metric__v">${v}</span></div>`).join('')}</div>`;
      }
      if (a.telemetry) {
        extra = `<div class="metrics">${Object.entries(a.telemetry).map(([k, v]) => `<div class="metric"><span class="metric__k">${k}</span><span class="metric__v">${v}</span></div>`).join('')}</div>`;
      }
      if (a.radar) {
        extra = `<div class="radar"><div class="radar__sub"><strong>[Unmet Corporate Friction]</strong><p>${a.radar.problem}</p></div><div class="radar__sub"><strong>[B2B Agentic AI Solution]</strong><p>${a.radar.solution}</p></div></div>`;
      }

      const typeLabel = ({ pe_metrics: 'PE Valuation', consulting_case: 'Consulting Case', b2b_radar: 'B2B Radar', banking_telemetry: 'Banking', sports_economics: 'Sports Econ', wealth_telemetry: 'Telemetry' })[a.type] || 'Strategy';

      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${hasImg ? imgTag(a.image, a.title, 'block__img') : ''}
        <div class="block__meta">
          ${getPinBtn(a)}
          <span class="tag tag--important">${typeLabel}</span>${tierBadge(a.sourceTier)}
          <span class="block__date">${formatDateTime(a.pubDate)}</span>
        </div>
        <a href="${a.rawGazette}" target="_blank" class="block__hl">${a.title}</a>
        <div class="seg"><p>${a.details || a.whatHappened || ''}</p></div>
        ${extra}
        ${footBlock(a)}
      </div>`;
    }).join('');
  }

  /* Framework Matrix */
  function renderFw(arr) {
    if (!arr || !arr.length) return;
    const w = weekNum();
    const fw = arr[w % arr.length];
    fwTag.textContent = `WEEK ${w}`;
    fwBody.innerHTML = `<div class="fw-title">${fw.name}</div><ul class="fw-list">${fw.steps.map(s => `<li class="fw-step">${s}</li>`).join('')}</ul>`;
  }

  /* ── 14. TICKER SPARKLINE DRAWER ────────────────────── */
  function showTickerSparkline(name) {
    if (!D || !D.ticker) return;
    const match = D.ticker.find(t => t.name === name);
    if (!match) return;
    activeTickerName = name;

    tickerAnalyticsTitle.textContent = match.name + " Analytics Telemetry";
    tickerAnalyticsCmp.textContent = match.value;
    tickerAnalyticsChg.textContent = match.change;
    tickerAnalyticsChg.className = 'ticker-chg ' + (match.positive ? 'up' : 'dn');

    const numericVal = parseFloat(String(match.value || '').replace(/[^0-9.-]/g, '')) || 100;
    const isPercent = /%/.test(String(match.value || ''));

    // Initialize 30 points of history if not present
    if (!tickerHistories[name]) {
      const history = [];
      let current = numericVal * 0.98;
      for (let pt = 0; pt < 30; pt++) {
        // Soft random walk
        current += (Math.random() - 0.48) * (numericVal * 0.004);
        history.push(current);
      }
      history[history.length - 1] = numericVal; // lock last point to current value
      tickerHistories[name] = history;
    }

    const history = tickerHistories[name];
    const minVal = Math.min(...history);
    const maxVal = Math.max(...history);
    const valRange = maxVal - minVal || 1.0;

    const high = maxVal;
    const low = minVal;
    tickerAnalyticsHigh.textContent = high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (isPercent ? '%' : '');
    tickerAnalyticsLow.textContent = low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (isPercent ? '%' : '');

    // Map 30 points to SVG viewBox (400 x 100)
    const points = [];
    const step = 400 / 29;
    for (let i = 0; i < history.length; i++) {
      const x = i * step;
      // y scaled between 15 (high value = top of SVG) and 85 (low value = bottom of SVG)
      const y = 85 - ((history[i] - minVal) / valRange) * 70;
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }

    // Set stroke path
    sparklinePath.setAttribute('d', points.join(' '));
    sparklinePath.style.stroke = match.positive ? 'var(--green)' : 'var(--red)';

    // Set closed area path under the sparkline for smooth linear fills
    if (sparklineArea) {
      const areaPoints = [...points];
      areaPoints.push(`L 400 100`);
      areaPoints.push(`L 0 100`);
      areaPoints.push(`Z`);
      sparklineArea.setAttribute('d', areaPoints.join(' '));
      sparklineArea.setAttribute('fill', match.positive ? 'url(#sparkline-grad-up)' : 'url(#sparkline-grad-dn)');
      sparklineArea.setAttribute('display', 'block');
    }

    tickerAnalytics.classList.remove('collapsed');
  }

  function closeTickerSparkline() {
    tickerAnalytics.classList.add('collapsed');
    activeTickerName = null;
  }

  /* ── 15. B2B RISK SIMULATOR DRAWER ──────────────────── */
  /* Robust brand extraction algorithm */
  function extractDynamicEntity(title, desc) {
    const fullText = ((title || "") + " " + (desc || "")).trim();
    if (!fullText) return "a big firm";

    // 1. List of famous Indian/Global brands to look for exactly (word-boundary matches)
    const famousBrands = [
      "Tata", "Reliance", "Adani", "HDFC", "SBI", "ICICI", "Axis", "Infosys", "Wipro", "TCS", 
      "Airtel", "Jio", "ITC", "L&T", "Larsen & Toubro", "Mahindra", "Bajaj", "Kotak", "Paytm", 
      "PhonePe", "Zomato", "Swiggy", "Ola", "Uber", "Byju's", "Zepto", "Blinkit", "Groww", 
      "Zerodha", "LIC", "ONGC", "NTPC", "IOC", "BPCL", "HPCL", "GAIL", "SAIL", "HAL", 
      "SpiceJet", "IndiGo", "Air India", "Maruti", "Hyundai", "Vedanta", "Hindalco", "Jindal", 
      "JSW", "Biocon", "Cipla", "Sun Pharma", "Google", "Microsoft", "Apple", "Amazon", "Nvidia", "Meta"
    ];

    for (const brand of famousBrands) {
      const regex = new RegExp(`\\b${brand}\\b`, "i");
      if (regex.test(fullText)) {
        const exactMatch = fullText.match(regex);
        if (exactMatch) return exactMatch[0];
      }
    }

    // 2. Explicit capital phrases to avoid: publishers, agencies, or noise
    const excludeWords = [
      "Taxguru", "CAClubIndia", "Moneycontrol", "PTI", "Reuters", "Bloomberg", "Press", "Release",
      "Notification", "Circular", "Ministry", "Department", "Government", "Cabinet", "Board", 
      "Reserve", "Bank", "of", "India", "Securities", "and", "Exchange", "Union", "State", 
      "GST", "Authority", "Directorate", "General", "Supreme", "Court", "High", "National",
      "Company", "Law", "Tribunal", "PIB", "Official", "Weekly", "Monthly", "Annual", "Fiscal", 
      "Standard", "Chartered", "Federal", "Reserve", "FOMC", "Minutes", "Q1", "Q2", "Q3", "Q4", 
      "FY24", "FY25", "FY26", "FY27", "Crore", "Lakh", "Million", "Billion", "Rupees", "Rs", "INR",
      "What", "Happened", "Why", "It", "Matters", "Business", "Investment", "Impact", "Systemic", 
      "Audit", "Corporate", "The", "A", "An", "This", "That", "These", "Those", "Currently", "Tracking"
    ];

    // 3. Fallback to capitalized noun phrases (1-4 words starting with Capital letters)
    const matches = fullText.match(/\b[A-Z][a-zA-Z0-9&']*(?:\s+[A-Z][a-zA-Z0-9&']*){0,3}\b/g) || [];
    
    for (let match of matches) {
      match = match.trim();
      if (match.length < 3 || /^\d+$/.test(match)) continue;

      const words = match.split(/\s+/);
      const isExcluded = words.every(word => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
        return excludeWords.some(exc => exc.toLowerCase() === cleanWord);
      });

      if (!isExcluded) {
        if (/^(?:What Happened|Why It Matters|Business & Investment Impact|Systemic|Audit|Corporate|The|A|An|This|That|These|Those|Currently|Currently Tracking)$/i.test(match)) {
          continue;
        }
        return match;
      }
    }

    // 4. Match regulators as fallback
    const regMatch = fullText.match(/\b(RBI|SEBI|MCA|NFRA|CBIC|DGGI|NCLT|SEC|GST|CBDT)\b/);
    if (regMatch) return regMatch[0];

    return "a big firm";
  }

  /* Explain Like I'm 10 (ELI10) lookup registry for complex regulatory circulars */
  function getELI10Story(a) {
    if (!a) return { analogy: "Awaiting compliance news...", breakdown: "Awaiting news...", takeaway: "Awaiting..." };
    
    const id = (a.id || '').trim();
    const title = (a.title || '').trim();
    const desc = (a.whatHappened || a.details || a.description || '').trim();
    const text = (title + " " + desc).toLowerCase();

    // ── 1. PRE-SEEDED PREMIUM INTEL STORIES REGISTRY ──
    const PRE_SEEDED_STORIES = {
      "fp_hero": {
        analogy: "Imagine our gully cricket group where you want to borrow the premium society cricket bat to play. The ground keeper (RBI) says: 'If you want to borrow the bat to build a new treehouse (under-construction project), you must keep 5 extra tennis balls in the locker as a safety backup, instead of just half a ball!' This makes borrowing the bat a bit harder, but saves the game if the ball is lost.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Under-Construction Treehouse:</strong> Big infrastructure projects like roads, bridges, and power lines.</li>` +
          `<li><strong>Ground Keeper's Backup Balls:</strong> Provisioning jumping from 0.4% to 5.0% means banks must hold more cash as a safety buffer.</li>` +
          `<li><strong>Harder to Borrow:</strong> Getting credit becomes slightly more expensive, forcing projects to put in more of their own cash.</li>` +
          `</ul>`,
        takeaway: "RBI is making banks save up backup candy buffers so that our structural construction grounds stay solid and never collapse!"
      },
      "fp_feat1": {
        analogy: "Imagine all the kids in our society want to build awesome Lego toy robots, but we always have to import Lego blocks from the expensive store far away. The school headmistress (Cabinet) clears a huge box of 39,360 shiny golden coins to build two super Lego brick-making machines right here in our playground! Now, kids can make their own bricks instantly and build their robots locally.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Lego Bricks:</strong> Semiconductor chips that go inside our phones, computers, and cars.</li>` +
          `<li><strong>Golden Coins Subsidy:</strong> The government is paying 50% of the cost to build the factories so that big companies set up operations here.</li>` +
          `<li><strong>Playground Independence:</strong> India won't have to rely on foreign toy stores for chips anymore.</li>` +
          `</ul>`,
        takeaway: "India is building its own high-tech Lego brick factories to become a global chip playground leader!"
      },
      "fp_feat2": {
        analogy: "Imagine playing on a neighborhood merry-go-round. The big park coordinator (US Federal Reserve) decides to keep the ticket price very high for a long time, saying: 'We will not lower the price until all the kids stop running around and causing sticky dust storms!' This means borrowing pocket money stays expensive for everyone, making us play with extreme care.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>High Ticket Price:</strong> Interest rates staying high globally.</li>` +
          `<li><strong>Dust Storms:</strong> Sticky inflation that makes candies and chocolates expensive.</li>` +
          `<li><strong>Pocket Money Cautions:</strong> Companies must pay higher interest on loans, reducing easy spending.</li>` +
          `</ul>`,
        takeaway: "The Federal Reserve is holding borrowing rates high to cool down global spending and bring down chocolate prices!"
      },
      "sim_1": {
        analogy: "Imagine joining a secret playground club. The playground guardian (RBI) has a strict rule: you must check every kid's official ID and notebook to make sure they aren't using fake names to play. But one bank club let players join without checking their cards. The guardian caught them and fined them ₹2.5 Crore worth of penalty sweets!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>ID Checks (KYC):</strong> Banks must verify exactly who is opening accounts to prevent rule-breaking.</li>` +
          `<li><strong>Sweet Penalty:</strong> RBI's fine of ₹2.5 crore to teach the bank a lesson.</li>` +
          `</ul>`,
        takeaway: "RBI is proving that checking player IDs is essential to keep our financial playground clean and rule-abiding."
      },
      "sim_2": {
        analogy: "Imagine ordering a box of hot samosas for a big birthday party from a local halwai shop. You paid the tax candy, but when the headmistress reviews the GSTR-2A school register book, the halwai's slip is missing! The headmistress goes straight to the e-commerce delivery kid and demands ₹840 Crore worth of candy for the mismatched records!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Missing Slip:</strong> Invoices that suppliers forgot to file in the government portal.</li>` +
          `<li><strong>Tax Demand Notice:</strong> The government issued a GSTR demand notice demanding ₹840 Crore for the mismatched records.</li>` +
          `<li><strong>Perfect Receipt Matching:</strong> Companies must audit every sweet receipt so the accounts match exactly.</li>` +
          `</ul>`,
        takeaway: "The tax office is checking ledger books strictly to ensure every single sweet receipt matches perfectly."
      },
      "sim_3": {
        analogy: "Imagine you are traveling on the Mumbai local train. Normally, you have to buy a ticket, but the station office tells you that your ticket for HDFC Bank won't be printed until tomorrow afternoon! T+0 Instant Settlement is like the smart ATVM machine on the platform: you scan your phone, beep-beep, and the ticket drops into your hand immediately!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Instant Ticket:</strong> Share ownership and money are swapped instantly in Demat accounts.</li>` +
          `<li><strong>Dadar Speed:</strong> Capital is released in seconds instead of taking a whole day.</li>` +
          `<li><strong>No Gaps:</strong> Eliminates overnight trading risks.</li>` +
          `</ul>`,
        takeaway: "SEBI is speeding up the stock market gates so that cash and shares flow as fast as a Mumbai local train!"
      },
      "reg_1": {
        analogy: "Imagine Sharma Uncle's neighborhood kirana store bahi-khata notebook where he writes down monthly biscuit dues. The town council (MCA) makes a strict rule: you cannot use a pencil to write accounts anymore! If you change a number, the notebook must magically write in permanent red ink: 'Sharma Uncle edited this on Monday at 5 PM.' Turning off this log will result in big fines!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Permanent Ink Logs (Audit Trail):</strong> MCA mandates tamper-proof digital tracking logs for all accounting edits.</li>` +
          `<li><strong>Council Checks:</strong> MCA and NFRA review edit histories to prevent any balance sheet manipulations.</li>` +
          `<li><strong>Uncle's Direct Fine:</strong> Managers face direct legal penalties if logs are deleted or altered in secret.</li>` +
          `</ul>`,
        takeaway: "Regulators are forcing companies to maintain a tamper-proof bahi-khata log so that accounting books remain 100% honest."
      },
      "reg_2": {
        analogy: "Imagine renting different cycles in the colony. Previously, the renting shop applied the same generic rent rate for everyone. But ICAI's technical committee says: 'No! If a kid rents a mountain bike for 3 days, you must calculate a custom rate matching their weight, cycle type, and pocket money profile!' No more lazy calculations.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Lazy Rates:</strong> Generic corporate interest rates applied to all leases.</li>` +
          `<li><strong>Ind AS 116 Restructure:</strong> Forcing specific lease interest calculations for accuracy.</li>` +
          `<li><strong>Custom Balance Sheet:</strong> Right-of-Use assets are valued precisely to avoid balance sheet inflation.</li>` +
          `</ul>`,
        takeaway: "Finance managers must use exact interest rate measurements for leases to keep the colony's cycle books fair."
      },
      "fraud_1": {
        analogy: "Imagine a kid who borrows 10 delicious gulab jamuns from the kitchen jar. To hide this massive sweet debt from grandmother, the kid creates 5 secret 'hideout boxes' with neighborhood friends, divisionally placing 2 sweets in each box and claiming his main box is sweet-free! But the smart grandmother (Forensic Auditor) traces the sweet crumbs, opens the secret boxes, and penalizes the loop!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Secret Boxes:</strong> Hiding debt in multiple off-balance sheet paper companies to borrow more than allowed.</li>` +
          `<li><strong>Crumbs Tracing:</strong> Forensic investigators using transaction ledger telemetry to track money routing.</li>` +
          `<li><strong>Grandma's Grounding (PMLA Actions):</strong> Strict legal actions and property attachments by agencies for promoter fraud.</li>` +
          `</ul>`,
        takeaway: "Forensic watchdogs traced the financial crumbs of the company to unlock their secret sweet boxes and restore honesty."
      },
      "fraud_2": {
        analogy: "Imagine you are doing your standard homework (regular software debugging). To make your parents think you are inventing a magical science robot (R&D Propriary Intangible Asset), you write in your journal that all your normal homework hours were actually spent on the robot! This makes you look like a genius inventor, but the teacher (SEC) audits your timesheets and catches the exaggeration!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Standard Homework:</strong> Routine software debugging and maintenance expenses.</li>` +
          `<li><strong>Science Robot:</strong> Proprietary Intangible Assets capitalized under IAS 38.</li>` +
          `<li><strong>Exaggeration Charge:</strong> Regulators penalizing companies for inflating profit margins.</li>` +
          `</ul>`,
        takeaway: "SEC is enforcing strict boundaries to stop tech companies from capitalizing normal operating expenses to look artificially profitable."
      },
      "strat_3": {
        analogy: "Imagine running a huge school festival stall where you sell sweets using 12 different payment slips (online scans, cash, token cards, parent coupons). At the end of the day, sorting out which supplier gets what candy takes hours, and kids lose 2 sweets for every 100 sold in the confusion. This SaaS startup builds a little smart robot that sorts all slips instantly in real-time, saving all lost sweets!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>12 Slips:</strong> Multi-channel retail payment gateways, COD rails, and chargebacks.</li>` +
          `<li><strong>Lost Sweets:</strong> 1.8% of top-line revenue lost in administrative friction.</li>` +
          `<li><strong>Sorting Robot:</strong> Agentic AI SaaS that reconciles gateways and automates disputes.</li>` +
          `</ul>`,
        takeaway: "Young founders can build automated invoice-sorting software to stop multi-channel retailers from losing money in manual bookkeeping!"
      },
      "db_1": {
        analogy: "Imagine all the class representatives contributing a tiny piece of candy from every lunchbox to the school's central playground improvement chest. Because everyone worked hard and shared happily, the chest grows by a massive 17.7%! Now, the principal has plenty of candies to build new slides and swings without borrowing from the teacher's wallet!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Playground Improvement Chest:</strong> Gross direct tax collections.</li>` +
          `<li><strong>17.7% Surge:</strong> Record corporate profitability and compliance urban tax filing.</li>` +
          `<li><strong>New Slides and Swings:</strong> High infrastructure expenditure budget execution.</li>` +
          `</ul>`,
        takeaway: "India's tax coffers are overflowing, giving the government plenty of resources to build massive public works!"
      },
      "db_2": {
        analogy: "Imagine a high-stakes marble trading game where some big players hide behind masks so nobody knows they actually own almost all the marbles on the playground. The game master (SEBI) makes a strict rule: 'If your mask owns more than 50% of any group, you must show your real face!' This prevents sneaky market manipulation.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Masked Players:</strong> Concentrated Foreign Portfolio Investors (FPIs) holding secret shares.</li>` +
          `<li><strong>SEBI Rule:</strong> Granular disclosure requirements to target disguised promoter holdings.</li>` +
          `<li><strong>Face Disclosure:</strong> Restricting offshore shell structures from breaking public listing rules.</li>` +
          `</ul>`,
        takeaway: "SEBI is forcing masked foreign funds to reveal their true beneficial owners to keep stock markets clean."
      },
      "db_6": {
        analogy: "Imagine all the rich kids from the neighboring private school deciding to move their homework notebooks, drawing files, and bahi-khatas to our colony because our kids are super fast at math and use smart shortcut tools! They open 45 new study centers in our neighborhood, employing hundreds of our clever friends.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Study Centers:</strong> Global Capability Centers (GCCs) in India.</li>` +
          `<li><strong>Notebooks and Drawing Files:</strong> Back-office finance, accounting, and IT operations.</li>` +
          `<li><strong>Smart Shortcuts:</strong> Robotic Process Automation (RPA) and agentic AI.</li>` +
          `</ul>`,
        takeaway: "Fortune 500 companies are shifting their global offices to India to run operations using smart automation!"
      },
      "db_3": {
        analogy: "Imagine kids trading shiny, invisible magical cards in the school corridor. The school board decides: 'Invisible cards are fun, but if you trade them and make a profit, you must give exactly 3 out of 10 candy bars to the classroom fund! Also, the card supervisor must write down every single trade in the school diary so we can check it.'",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Invisible Cards:</strong> Virtual Digital Assets (Cryptocurrencies/NFTs).</li>` +
          `<li><strong>3 out of 10 candies:</strong> 30% flat tax on digital assets under Section 115BBH.</li>` +
          `<li><strong>School Diary:</strong> Stringent TDS tracking and audit trails for digital transactions.</li>` +
          `</ul>`,
        takeaway: "CBDT is placing firm tracking rules on cryptocurrency trading to bring digital assets into the formal tax system."
      },
      "db_4": {
        analogy: "Imagine a high-stakes coin flipping game on the playground where kids borrow massive bags of marbles to bet on who wins the next weekly round. The playground supervisor (SEBI) sounds a loud siren, warning: 'This game is too risky! Over 90% of kids are losing all their marbles, and borrowing too much leads to high playground debts!'",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Coin Flipping Game:</strong> Retail options trading premium volume spikes.</li>` +
          `<li><strong>Supervisor's Siren:</strong> SEBI's thematic risk warning advisory.</li>` +
          `<li><strong>Bags of Marbles:</strong> Speculative leverage and broker margin loans.</li>` +
          `</ul>`,
        takeaway: "SEBI is warning retail traders to stop speculative options betting before they lose their lifetime marble savings!"
      },
      "reg_3": {
        analogy: "Imagine you borrowed candies from Sharma Uncle's kirana shop 3 months ago. Instead of writing it down under 'Candy Bills We Must Pay Next Week', you write it under 'General Rainy-Day Savings' to make your piggy bank look like it has lots of spare money! The strict school auditor (NFRA) catches you and shouts: 'Reclassify this immediately! Uncle's bills must be listed clearly under unpaid debts!'",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Candy Bills:</strong> Outstanding trade payables to small MSME vendors.</li>` +
          `<li><strong>General Savings:</strong> Current operational provisions used to hide liabilities.</li>` +
          `<li><strong>Reclassify:</strong> NFRA demanding transparent liabilities reporting to protect small vendors.</li>` +
          `</ul>`,
        takeaway: "NFRA is forcing corporations to show exactly how much they owe small businesses, keeping their piggy banks honest."
      },
      "reg_4": {
        analogy: "Imagine the principal orders every classroom to plant trees. To ensure no one cheats or exaggerates how many trees they watered, you must write down each watering timestamp in a permanent 'Green Tree Log' that cannot be erased. The school auditor reviews these stamps before awarding the Green Medal!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Green Tree Log:</strong> Standardized ESG and Sustainability audit logs.</li>` +
          `<li><strong>Watering Timestamp:</strong> Tamper-proof system logs of environmental actions.</li>` +
          `<li><strong>Green Medal:</strong> Business Responsibility and Sustainability Reporting (BRSR) compliance.</li>` +
          `</ul>`,
        takeaway: "MCA is mandating transparent green reporting so that corporations can never fake their eco-friendly activities."
      },
      "fraud_3": {
        analogy: "Imagine a kid gets a budget from parents to build a beautiful toy road set in the backyard. Instead of buying tracks, the kid transfers the money to 6 small piggy banks of his friends (SPVs), who then transfer the cash right back to the kid's private candy box! The parent's council (NCLT) orders a detective to search the piggy banks and claw back the candy!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Toy Road Set:</strong> Central bank loans for public road development.</li>` +
          `<li><strong>6 Small Piggy Banks:</strong> Special Purpose Vehicles (SPVs) used to divert loans.</li>` +
          `<li><strong>Candy Box:</strong> Unconsolidated promoter shell LLPs receiving interest-free funds.</li>` +
          `</ul>`,
        takeaway: "NCLT is hunting down sneaky SPV loan diversions to protect the lenders' bank accounts from fraud."
      },
      "fraud_4": {
        analogy: "Imagine a ring of 42 kids in school who trade empty, clean lunchboxes with empty sheets of paper inside, pretending they are exchanging delicious cheese rolls! They write invoice slips claiming they paid tax on these imaginary rolls, generating fake 'Sweet Credit Tokens' to get free school meals! The school guard catches the paper-box ring and locks them up.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Empty Lunchboxes:</strong> Rs. 1,800 crore circular invoicing with zero physical goods delivery.</li>` +
          `<li><strong>Sweet Credit Tokens:</strong> Rs. 380 Crore fake Input Tax Credit (ITC) manufactured to lower tax liabilities.</li>` +
          `<li><strong>School Guard:</strong> Directorate General of GST Intelligence (DGGI) and PMLA legal action.</li>` +
          `</ul>`,
        takeaway: "GST inspectors busted a massive fake invoice ring that manufactured artificial tax credits using paper shell firms."
      },
      "strat_1": {
        analogy: "Imagine you have 14,000 candies locked in a high vault that you can't touch for 10 years. Because the neighborhood swings are getting rocky and prices are shifting fast, you decide to unlock the vault and move those candies into quick-zipper pouches that expire in 3 months! This way, if you need candies tomorrow to buy toys, you have them ready.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>14,000 Candies:</strong> Rs. 14,000 Crore moved out of long-maturity papers.</li>` +
          `<li><strong>Quick-Zipper Pouches:</strong> Short-term commercial CDs yielding 7.45% average.</li>` +
          `<li><strong>Rocky Swings:</strong> Yield curve inversion spread of 34 bps risking portfolio liquidity.</li>` +
          `</ul>`,
        takeaway: "Corporate financial officers are shifting capital into quick-access cash instruments to prepare for stormy market weather."
      },
      "strat_2": {
        analogy: "Imagine 4 steel-making groups that emit heavy smoke on the playground. To meet the classroom's net-zero rules, they pay Rs. 650 Crore to purchase 'Green balloons' from kids who plant trees, offsetting their smoke emissions before the strict auditor (E&Y ESG Desk) inspects their desks next semester.",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Heavy Smoke:</strong> Industrial carbon emissions from manufacturing.</li>` +
          `<li><strong>Green Balloons:</strong> Structured carbon credit offsets indexed at $24.50/ton.</li>` +
          `<li><strong>Auditor Inspection:</strong> Mandatory ESG sustainability compliance before late 2026.</li>` +
          `</ul>`,
        takeaway: "Industrial manufacturers are buying massive carbon offsets to pass their upcoming sustainability audits."
      },
      "strat_4": {
        analogy: "Imagine you are running a school store and there is a strict rule: you cannot buy supplies from your own cousins or family members without telling the teacher, because you might overpay them using the class fund! The school SaaS company builds a smart alarm that scans the name of every supplier, checks if they are related to you, and flags the trade before the coins are spent!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Cousins Trade:</strong> Related Party Transactions (RPT) governed by SEBI rules.</li>` +
          `<li><strong>Class Fund Abuse:</strong> Undeclared transfer pricing routing to family shell companies.</li>` +
          `<li><strong>Smart Alarm:</strong> Agentic SaaS scanning ultimate beneficial ownership (UBO) in real-time.</li>` +
          `</ul>`,
        takeaway: "Startups can build automatic scanners to audit vendor names and stop illegal related-party trades in real-time."
      },
      "strat_5": {
        analogy: "Imagine a group of ultra-rich sovereign collectors who pool together Rs. 5,200 Crore worth of rare marbles to buy three prime toy towers in Bangalore. They plan to split the towers into 10,000 tiny shares so that any kid in the school can buy a tiny piece of the toy tower and get rent marbles every month!",
        breakdown: `<ul class='eli10-list'>` +
          `<li><strong>Toy Towers:</strong> Grade-A commercial workspace IT developments.</li>` +
          `<li><strong>Rent Marbles:</strong> Real Estate Investment Trust (REIT) monthly yield distributions.</li>` +
          `<li><strong>Splitting into Shares:</strong> Public REIT listing on SEBI markets.</li>` +
          `</ul>`,
        takeaway: "Huge foreign investment syndicates are buying premium Indian tech parks to parcel them out as high-yield public REIT shares."
      }
    };

    if (PRE_SEEDED_STORIES[id]) {
      return PRE_SEEDED_STORIES[id];
    }

    // ── 2. DYNAMIC HEURISTIC METAPHOR GENERATOR ──
    const textLower = text.toLowerCase();
    
    // Extract entity name (company/regulator)
    const entityName = extractDynamicEntity(title, desc || a.source || '');

    // Extract monetary values if any
    const rupeeMatch = title.match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i) || desc.match(/₹\s*\d+(?:\.\d+)?\s*(?:Crore|Cr|Lakh|L)?/i);
    const moneyVal = rupeeMatch ? rupeeMatch[0] : "a huge sum of rupees";

    let analogyText = "";
    let breakdownList = "";
    let takeawayText = "";

    if (/bank|credit|nbfc|rbi|lending|borrow|deposit|interest/i.test(textLower)) {
      if (/infrastructure|under-construction|project/i.test(textLower)) {
        analogyText = `Imagine a popular kids' club where <strong>${entityName}</strong> wants to borrow the premium society cricket bat to build a brand new treehouse in the colony. The ground keeper (RBI) says: 'If you want to borrow the bat for this under-construction treehouse, you must deposit <strong>${moneyVal}</strong> worth of safety backup balls in the locker instead of just half a ball!' It makes building the treehouse harder, but saves the game if the ball is lost.`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Premium Bat:</strong> High-value project lending lines used by ${entityName}.</li>` +
          `<li><strong>Backup Balls:</strong> Capital provisioning buffers jumping from 0.4% to 5%.</li>` +
          `<li><strong>Treehouse Project:</strong> Long-term under-construction infrastructure developments.</li>` +
          `</ul>`;
        takeawayText = `RBI is making banks save up bigger candy buffers so that our structural project grounds stay solid!`;
      } else if (/kyc|aml|penalty|identity|lapses/i.test(textLower)) {
        analogyText = `Imagine a secret playground club run by <strong>${entityName}</strong>. The neighborhood guardian (RBI) has a strict rule: you must check every kid's official ID card to make sure they aren't using fake names to join. But <strong>${entityName}</strong> let players join without checking! The guardian caught them and fined them <strong>${moneyVal}</strong> worth of penalty sweets!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>ID Cards (KYC):</strong> Verifying player identity and documentation to prevent rule-breaking.</li>` +
          `<li><strong>Sweet Fine:</strong> The penalty of ${moneyVal} to enforce discipline.</li>` +
          `<li><strong>Club Rules:</strong> Protecting the financial system from anonymous bad actors.</li>` +
          `</ul>`;
        takeawayText = `RBI is proving that checking player IDs is absolutely essential to keep the playground safe and clean.`;
      } else if (/interest rate|repo|fed|monetary|fomc/i.test(textLower)) {
        analogyText = `Imagine playing on the colony cycle tracks. The chief park coordinator (US Federal Fed) decides to keep cycle rent tickets very high for a long time, saying to <strong>${entityName}</strong>: 'We will not lower the price until all the kids stop creating sticky dust storms!' This means borrowing cycles stays expensive, forcing everyone to spend very carefully.`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Cycle Rent:</strong> Benchmark global interest rates.</li>` +
          `<li><strong>Dust Storms:</strong> Sticky core inflation making daily chocolates expensive.</li>` +
          `<li><strong>Careful Spending:</strong> Higher loan costs squeeze profitability margins.</li>` +
          `</ul>`;
        takeawayText = `The central coordinators are holding interest rates high to cool down spending and bring chocolate prices under control.`;
      } else {
        analogyText = `Imagine a popular kids' club where <strong>${entityName}</strong> wants to borrow the premium society cricket bat to play. The ground keeper (RBI) just set a rule: 'If you want to borrow the bat, you must keep <strong>${moneyVal}</strong> worth of candy backup in the locker in case a storm hits!' It makes the bat a bit slower to borrow, but keeps our playground safe!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Premium Bat:</strong> High-value borrowing and lending lines used by ${entityName}.</li>` +
          `<li><strong>Candy Backup:</strong> Reserve assets and provisioning capital mandated by RBI.</li>` +
          `<li><strong>Storm Shield:</strong> Ensuring banks don't run out of cash if people suddenly want their deposits back.</li>` +
          `</ul>`;
        takeawayText = `RBI is making ${entityName} hold more backup safety candies to keep our economic playground secure.`;
      }

    } else if (/tax|gst|invoice|audit|nfra|accounting|ledger|edit log|cbic|drc|lessee|ind as/i.test(textLower)) {
      if (/audit trail|edit log|tamper/i.test(textLower)) {
        analogyText = `Imagine <strong>${entityName}</strong> running a neighborhood kirana store bahi-khata notebook. The town council (MCA) makes a strict rule: you cannot use a pencil to write accounts anymore! If you change a number, the notebook must magically write in permanent red ink: 'Edited this on Monday at 5 PM.' Turning off this log will result in <strong>${moneyVal}</strong> worth of big fines!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Permanent Ink Logs (Audit Trail):</strong> Mandating tamper-proof digital tracking logs for all accounting edits.</li>` +
          `<li><strong>Council Checks:</strong> MCA and NFRA review edit histories to prevent balance sheet manipulations.</li>` +
          `<li><strong>Direct Penalty:</strong> Strict corporate fines for deleting or altering logs.</li>` +
          `</ul>`;
        takeawayText = `Regulators are forcing ${entityName} to maintain a tamper-proof bahi-khata log so that accounting books remain 100% honest.`;
      } else if (/lease|liability|ind as 116|lessee/i.test(textLower)) {
        analogyText = `Imagine <strong>${entityName}</strong> renting cycles in the colony. Previously, the renting shop applied the same generic rate for everyone. But ICAI's technical committee says: 'No! If a kid rents a mountain bike, you must calculate a custom rate matching their weight, cycle type, and pocket money profile!' No more lazy calculations.`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Lazy Rates:</strong> Generic interest rates applied to all leases.</li>` +
          `<li><strong>Ind AS 116 Restructure:</strong> Forcing specific lease interest calculations for accuracy.</li>` +
          `<li><strong>Custom Balance Sheet:</strong> Right-of-Use assets valued precisely to avoid balance sheet inflation.</li>` +
          `</ul>`;
        takeawayText = `${entityName} must use exact interest rate measurements for leases to keep its cycle books fair.`;
      } else if (/gst|invoice|gstr|demand|mismatch/i.test(textLower)) {
        analogyText = `Imagine ordering a box of hot samosas for a big birthday party from <strong>${entityName}</strong>. You paid the tax candy, but when the headmistress reviews the GSTR-2A school register book, the slip is missing! The headmistress goes straight to <strong>${entityName}</strong> and demands <strong>${moneyVal}</strong> worth of candy for the mismatched records!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Missing Slip:</strong> Invoices that suppliers forgot to file in the government portal.</li>` +
          `<li><strong>Tax Demand Notice:</strong> The government issued a GSTR demand notice demanding ${moneyVal} for the mismatched records.</li>` +
          `<li><strong>Perfect Receipt Matching:</strong> Companies must audit every sweet receipt so the accounts match exactly.</li>` +
          `</ul>`;
        takeawayText = `The tax office is checking ledger books strictly to ensure every single sweet receipt matches perfectly.`;
      } else {
        analogyText = `Imagine buying delicious hot samosas from our local sweet maker, <strong>${entityName}</strong>, for a colony party. You paid the sweet tax, but the school supervisor checking the GSTR school notebook notices <strong>${entityName}</strong> forgot to write down the receipt slip! The supervisor demands a fine of <strong>${moneyVal}</strong> for that mismatch!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Missing Receipt Slip:</strong> Invoices that suppliers forgot to register in the central tax books.</li>` +
          `<li><strong>Sweet Tax Fine:</strong> Official demand notices (like DRC-01) for unpaid or mismatched tax credits.</li>` +
          `<li><strong>Notebook Auditing:</strong> Keeping all transactions in permanent ink so nobody can erase a debt in secret.</li>` +
          `</ul>`;
        takeawayText = `Regulators are demanding that ${entityName} keep a perfect, tamper-proof notebook so all tax accounts match exactly.`;
      }

    } else if (/equity|stock|sebi|clearing|settlement|reit|ipo|invest|share/i.test(textLower)) {
      if (/t\+0|instant|settlement/i.test(textLower)) {
        analogyText = `Imagine you are buying a train ticket for <strong>${entityName}</strong> at Dadar station. Normally, you have to buy a ticket, but the station office tells you that your ticket won't print until tomorrow! T+0 Instant Settlement is like the smart ATVM machine on the platform: you scan your phone, beep-beep, and the ticket drops into your hand immediately! No waiting and no overnight risks!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Instant Ticket:</strong> Share ownership and money are swapped instantly in Demat accounts.</li>` +
          `<li><strong>Dadar Speed:</strong> Capital is released in seconds instead of taking a whole day.</li>` +
          `<li><strong>No Gaps:</strong> Eliminates overnight trading risks.</li>` +
          `</ul>`;
        takeawayText = `SEBI is speeding up the stock market gates so that cash and shares of ${entityName} flow as fast as a Mumbai local train!`;
      } else if (/options|leverage|trading|retail/i.test(textLower)) {
        analogyText = `Imagine a high-stakes coin flipping game on the playground where <strong>${entityName}</strong> and other players borrow massive bags of marbles to bet on weekly rounds. The supervisor (SEBI) sounds a loud siren, warning: 'This game is too risky! Over 90% of kids are losing all their marbles, and borrowing too much leads to high playground debts!'`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Coin Flipping Game:</strong> Speculative retail options trading volume spikes.</li>` +
          `<li><strong>Supervisor's Siren:</strong> SEBI's thematic risk warning advisory.</li>` +
          `<li><strong>Bags of Marbles:</strong> Speculative leverage and broker margin loans.</li>` +
          `</ul>`;
        takeawayText = `SEBI is warning retail traders of ${entityName} to stop speculative options betting before they lose their lifetime marble savings!`;
      } else if (/beneficial ownership|fpi|masked/i.test(textLower)) {
        analogyText = `Imagine a high-stakes marble trading game where <strong>${entityName}</strong> and some big players hide behind masks so nobody knows who actually owns almost all the marbles. The game master (SEBI) makes a strict rule: 'If your mask owns more than 50% of any group, you must show your real face!' This prevents sneaky market manipulation.`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Masked Players:</strong> Concentrated Foreign Portfolio Investors (FPIs) holding secret shares.</li>` +
          `<li><strong>SEBI Rule:</strong> Granular disclosure requirements to target disguised promoter holdings.</li>` +
          `<li><strong>Face Disclosure:</strong> Restricting offshore shell structures from breaking public listing rules.</li>` +
          `</ul>`;
        takeawayText = `SEBI is forcing masked foreign funds to reveal their true beneficial owners to keep stock markets clean.`;
      } else {
        analogyText = `Imagine standing in a long line at the Dadar local train station to buy a ticket for <strong>${entityName}</strong>, but the ticket guy tells you that your ticket won't print until tomorrow! SEBI's new fast gate is like a smart ATVM phone scanner: beep-beep, you pay, and the ticket drops into your hand immediately! No waiting and no risk of losing your coins overnight!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Long Train Line:</strong> Traditional settlement cycles (like T+1) where trades take a day to clear.</li>` +
          `<li><strong>Smart Phone Scanner:</strong> Instant settlement (T+0) where shares and money are swapped in seconds.</li>` +
          `<li><strong>No Overnight Risk:</strong> Preventing traders from backing out of deals after the market closes.</li>` +
          `</ul>`;
        takeawayText = `SEBI is using high-speed transaction gates to make trading ${entityName} shares faster and safer for retail investors.`;
      }

    } else if (/fraud|scam|enforcement|penalty|pmla|nclt|sfio|shell|divert|circular/i.test(textLower)) {
      if (/shell|off-balance sheet|loop/i.test(textLower)) {
        analogyText = `Imagine <strong>${entityName}</strong> borrows 10 yummy gulab jamuns from the kitchen jar. To hide this huge sweet debt from grandmother, the kid hides 2 sweets each in 5 different 'secret boxes' with neighborhood friends, claiming his main box is empty! But the smart grandmother (Forensic watchdogs) traces the sweet crumbs, opens the secret boxes, and clawbacks the sweets!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Secret Boxes:</strong> Unconsolidated shell partnership firms used to hide debt and transfer funds in secret.</li>` +
          `<li><strong>Sweet Crumbs:</strong> Financial ledger footprints audited by forensic investigators to trace cash routing.</li>` +
          `<li><strong>Grandma's Grounding:</strong> Stringent penalties and PMLA property actions to recover resources.</li>` +
          `</ul>`;
        takeawayText = `Watchdogs traced the financial crumbs of ${entityName} to unlock the secret boxes and restore accountability.`;
      } else if (/diversion|spv|promoter/i.test(textLower)) {
        analogyText = `Imagine <strong>${entityName}</strong> gets a budget from parents to build a beautiful toy road set in the backyard. Instead of buying tracks, the kid transfers <strong>${moneyVal}</strong> to 6 small piggy banks of his friends (SPVs), who then transfer the cash right back to the kid's private candy box! The parent's council (NCLT) orders a detective to search the piggy banks and claw back the candy!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Toy Road Set:</strong> Central bank loans for public road development.</li>` +
          `<li><strong>6 Small Piggy Banks:</strong> Special Purpose Vehicles (SPVs) used to divert loans.</li>` +
          `<li><strong>Candy Box:</strong> Unconsolidated promoter shell LLPs receiving interest-free funds.</li>` +
          `</ul>`;
        takeawayText = `NCLT is hunting down SPV loan diversions to protect the lenders' bank accounts from fraud.`;
      } else if (/fake invoice|circular invoicing/i.test(textLower)) {
        analogyText = `Imagine a ring of 42 kids in school led by <strong>${entityName}</strong> who trade empty, clean lunchboxes with empty sheets of paper inside, pretending they are exchanging delicious cheese rolls! They write invoice slips claiming they paid tax, generating fake 'Sweet Credit Tokens' to get free school meals! The school guard catches the paper-box ring and locks them up.`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Empty Lunchboxes:</strong> Circular invoicing with zero physical goods delivery.</li>` +
          `<li><strong>Sweet Credit Tokens:</strong> Fake Input Tax Credit (ITC) manufactured to lower tax liabilities.</li>` +
          `<li><strong>School Guard:</strong> Directorate General of GST Intelligence (DGGI) and PMLA legal action.</li>` +
          `</ul>`;
        takeawayText = `GST inspectors busted a massive fake invoice ring that manufactured artificial tax credits using paper shell firms.`;
      } else if (/capitalization|ias 38/i.test(textLower)) {
        analogyText = `Imagine <strong>${entityName}</strong> is doing standard homework (routine software debugging). To make your parents think you are inventing a magical science robot (R&D Proprietary Intangible Asset), you write in your journal that all your normal homework hours were actually spent on the robot! This makes you look like a genius inventor, but the teacher (SEC) audits your timesheets and catches the exaggeration!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Standard Homework:</strong> Routine software debugging and maintenance expenses.</li>` +
          `<li><strong>Science Robot:</strong> Proprietary Intangible Assets capitalized under IAS 38.</li>` +
          `<li><strong>Exaggeration Charge:</strong> Regulators penalizing companies for inflating profit margins.</li>` +
          `</ul>`;
        takeawayText = `SEC is enforcing strict boundaries to stop tech companies from capitalizing normal operating expenses to look artificially profitable.`;
      } else {
        analogyText = `Imagine a kid named <strong>${entityName}</strong> who borrows 10 yummy gulab jamuns from the kitchen jar. To hide this huge sweet debt from grandmother, the kid hides 2 sweets each in 5 different 'secret boxes' with neighborhood friends, claiming his main box is empty! But the smart grandmother (Forensic watchdogs) traces the sweet crumbs, opens the secret boxes, and clawbacks the sweets!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Secret Boxes:</strong> Unconsolidated shell partnership firms used to hide debt and transfer funds in secret.</li>` +
          `<li><strong>Sweet Crumbs:</strong> Financial ledger footprints audited by forensic investigators to trace cash routing.</li>` +
          `<li><strong>Grandma's Grounding:</strong> Stringent penalties and PMLA property actions to recover resources.</li>` +
          `</ul>`;
        takeawayText = `Watchdogs traced the financial crumbs of ${entityName} to unlock the secret boxes and restore accountability.`;
      }

    } else if (/ai|tech|saas|startup|b2b|automation|reconcile/i.test(textLower)) {
      if (/related party|rpt|cousin/i.test(textLower)) {
        analogyText = `Imagine running a school store and there is a strict rule: you cannot buy supplies from your own cousins or family members without telling the teacher, because you might overpay them using the class fund! The school SaaS company <strong>${entityName}</strong> builds a smart alarm that scans the name of every supplier, checks if they are related to you, and flags the trade before the coins are spent!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Cousins Trade:</strong> Related Party Transactions (RPT) governed by SEBI rules.</li>` +
          `<li><strong>Class Fund Abuse:</strong> Undeclared transfer pricing routing to family shell companies.</li>` +
          `<li><strong>Smart Alarm:</strong> Agentic SaaS scanning ultimate beneficial ownership (UBO) in real-time.</li>` +
          `</ul>`;
        takeawayText = `Startups can build automatic scanners to audit vendor names and stop illegal related-party trades in real-time.`;
      } else if (/reconciliation|gateway/i.test(textLower)) {
        analogyText = `Imagine running a busy school festival stall where you sell toys using cash, coupons, and phone scans. Sorting which friend paid what takes hours, and you lose some coins in the mess. This smart startup <strong>${entityName}</strong> builds a little toy-sorting robot that matches every coin to its invoice instantly in real-time, saving all lost coins!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Multiple Slips:</strong> Multi-channel gateway payments, chargebacks, and cash-on-delivery channels.</li>` +
          `<li><strong>Lost Coins:</strong> Administrative margin leakages from doing tedious manual bookkeeping.</li>` +
          `<li><strong>Toy Sorting Robot:</strong> Agentic AI compliance SaaS that automates auditing and reconciliation.</li>` +
          `</ul>`;
        takeawayText = `${entityName} is building smart SaaS software to automate corporate bookkeeping and prevent cash leakages.`;
      } else {
        analogyText = `Imagine running a busy school festival stall where you sell toys using cash, coupons, and phone scans. Sorting which friend paid what takes hours, and you lose some coins in the mess. This smart startup <strong>${entityName}</strong> builds a little toy-sorting robot that matches every coin to its invoice instantly in real-time, saving all lost coins!`;
        breakdownList = `<ul class='eli10-list'>` +
          `<li><strong>Multiple Slips:</strong> Multi-channel gateway payments, chargebacks, and cash-on-delivery channels.</li>` +
          `<li><strong>Lost Coins:</strong> Administrative margin leakages from doing tedious manual bookkeeping.</li>` +
          `<li><strong>Toy Sorting Robot:</strong> Agentic AI compliance SaaS that automates auditing and reconciliation.</li>` +
          `</ul>`;
        takeawayText = `${entityName} is building smart SaaS software to automate corporate bookkeeping and prevent cash leakages.`;
      }

    } else {
      // Default dynamic metaphor (The Kirana Stand sugar reserve)
      analogyText = `Imagine running a neighborhood kirana shop named <strong>${entityName}</strong>. The municipality sets a rule: you must write down the ID of everyone who buys a biscuit pack and keep a backup cup of sugar in the storage room just in case! It takes a lot more notebook writing, but prevents sweet-shortages in our neighborhood!`;
      breakdownList = `<ul class='eli10-list'>` +
        `<li><strong>Sugar Jar Reserve:</strong> Saving backup assets (like capital adequacy) to survive sudden economic dry spells.</li>` +
        `<li><strong>Biscuit ID Log:</strong> Maintaining strict records to prevent rule-breaking in the colony.</li>` +
        `<li><strong>Notebook Writing:</strong> Operational compliance effort that keeps the whole neighborhood stable.</li>` +
        `</ul>`;
      takeawayText = `This update demands that ${entityName} maintain strict bahi-khata records to shield our local community from sudden failures.`;
    }

    return {
      analogy: analogyText,
      breakdown: breakdownList,
      takeaway: takeawayText
    };
  }

  function openSimulatorDrawer(id, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    let match = null;
    
    // 1. Search active editorial desks
    ["section1", "section2", "section3", "section4", "section5"].forEach(s => {
      if (D[s] && D[s].articles) {
        const found = D[s].articles.find(a => a.id === id);
        if (found) match = found;
      }
    });

    // 2. Search in RSS cache
    if (!match && typeof rssCache !== 'undefined' && rssCache) {
      match = rssCache.find(a => a.guid === id || a.link === id || a.title === id);
    }

    // 3. Search in global pool
    if (!match && typeof ALL_FINANCIALS_POOL !== 'undefined' && ALL_FINANCIALS_POOL) {
      match = ALL_FINANCIALS_POOL.find(a => a.id === id || a.title === id);
    }

    if (!match) return;

    activeSimulatedArticle = match;
    simContextTitle.textContent = match.title;

    // Fetch ELI10 Story and render dynamically!
    const story = getELI10Story(match);
    const eli10Analogy = document.getElementById('eli10-analogy');
    const eli10Breakdown = document.getElementById('eli10-breakdown');
    const eli10Takeaway = document.getElementById('eli10-takeaway');

    if (eli10Analogy) eli10Analogy.innerHTML = `<p style="font-style:italic; line-height:1.6; color:var(--muted); font-size:14px; font-family:var(--serif);">"${story.analogy}"</p>`;
    if (eli10Breakdown) eli10Breakdown.innerHTML = story.breakdown;
    if (eli10Takeaway) eli10Takeaway.innerHTML = `<p style="font-weight:600; color:var(--accent); line-height:1.5; font-size:13.5px;">${story.takeaway}</p>`;

    // Hydrate standard B2B sliders in hidden area to prevent app.js from failing on input actions
    if (simSlider1) simSlider1.value = 50;
    if (simSlider2) simSlider2.value = 650;
    if (simSlider3) simSlider3.value = 10;
    runRiskSimulation();

    simulatorDrawer.classList.remove('collapsed');
  }

  function closeSimulatorDrawer() {
    simulatorDrawer.classList.add('collapsed');
    activeSimulatedArticle = null;
  }

  function runRiskSimulation() {
    if (!activeSimulatedArticle) return;
    const lev = parseInt(simSlider1.value);
    const rate = parseInt(simSlider2.value);
    const pen = parseInt(simSlider3.value);

    simVal1.textContent = lev + '%';
    simVal2.textContent = (rate / 100).toFixed(2) + '%';
    simVal3.textContent = (pen / 10).toFixed(1) + 'x';

    let baseMargin = 19.5;
    baseMargin -= (lev * 0.12);
    baseMargin -= ((rate / 100) * 0.8);
    baseMargin -= ((pen / 10) * 0.6);
    const calculatedMargin = Math.max(1.0, baseMargin);

    const provisioningPercentage = activeSimulatedArticle.id === 'fp_hero' ? 0.05 : 0.004;
    const estimatedProvisioningCap = (lev * 4.2 * provisioningPercentage).toFixed(2);

    const repricingPenalty = Math.round((rate / 100) * 4.5 + (pen / 10) * 22);

    simResMargin.textContent = calculatedMargin.toFixed(2) + '%';
    simResProvision.textContent = estimatedProvisioningCap + ' Cr';
    simResPenalty.textContent = repricingPenalty + ' bps';

    simStatusFill.style.width = Math.min(100, (calculatedMargin / 20) * 100) + '%';
    if (calculatedMargin < 6.0) {
      simStatusFill.style.background = 'var(--red)';
      simStatusText.textContent = 'Stability Corridor: Severe Distress';
      simStatusText.style.color = 'var(--red)';
    } else if (calculatedMargin < 12.0) {
      simStatusFill.style.background = '#D68F23';
      simStatusText.textContent = 'Stability Corridor: Under Pressure';
      simStatusText.style.color = '#D68F23';
    } else {
      simStatusFill.style.background = 'var(--green)';
      simStatusText.textContent = 'Stability Corridor: Nominal';
      simStatusText.style.color = 'var(--green)';
    }
  }

  /* ── 16. RADIAL SYSTEMIC FRICTION TELEMETRY ────────── */
  function renderFrictionTelemetry() {
    if (!D) return;
    let critCount = 0;
    let frictionScore = 0;
    let totalArticles = 0;

    ["section1", "section2", "section3", "section4", "section5"].forEach(s => {
      if (D[s] && D[s].articles) {
        D[s].articles.forEach(a => {
          totalArticles++;
          if (a.priority === 'Critical') {
            critCount++;
            frictionScore += 18;
          } else if (a.priority === 'Important') {
            frictionScore += 9;
          } else if (a.priority === 'Watchlist' || a.priority === 'Forensics') {
            frictionScore += 4;
          } else {
            frictionScore += 2;
          }
        });
      }
    });

    const finalFriction = Math.min(100, frictionScore);
    const offset = 314 * (1 - finalFriction / 100);
    gaugeFill.style.strokeDashoffset = offset;
    gaugeValue.textContent = finalFriction + '%';

    if (finalFriction === 0) {
      gaugeFill.style.stroke = 'var(--border)';
      gaugeDesc.textContent = 'No private intelligence feeds sync\'d. Run a crawl sync.';
    } else if (finalFriction < 35) {
      gaugeFill.style.stroke = 'var(--green)';
      gaugeDesc.textContent = 'Systemic risk corridors remain fully stabilized. Credit channels operating at baseline.';
    } else if (finalFriction < 70) {
      gaugeFill.style.stroke = '#D68F23';
      gaugeDesc.textContent = 'Elevated regulatory audit loops detected. Marginal provisioning exposure observed.';
    } else {
      gaugeFill.style.stroke = 'var(--red)';
      gaugeDesc.textContent = 'Critical compliance violations active. Immediate capital buffer recalibration required.';
    }

    const exposure = (totalArticles * 0.85 + critCount * 1.45).toFixed(2);
    metricExposure.textContent = exposure + '%';

    let failProb = 'Low (0%)';
    if (totalArticles === 0) failProb = 'Low (0%)';
    else if (critCount === 1) failProb = 'Moderate (28%)';
    else if (critCount === 2) failProb = 'High (64%)';
    else if (critCount >= 3) failProb = 'Critical (89%)';
    metricFailProb.textContent = failProb;

    metricCritCount.textContent = critCount;

    let hasRBIpf = false;
    if (D.section1 && D.section1.articles) {
      hasRBIpf = D.section1.articles.some(a => a.id === 'fp_hero');
    }
    metricRepricing.textContent = hasRBIpf ? '75 bps' : '0 bps';
  }

  /* ── 11. ACCORDIONS ─────────────────────────────────── */
  function wireAccordions() {
    document.querySelectorAll('.acc__head').forEach(h => {
      const fresh = h.cloneNode(true);
      h.parentNode.replaceChild(fresh, h);
      fresh.addEventListener('click', () => fresh.closest('.acc').classList.toggle('open'));
    });
  }

  /* ── 12. SEARCH ─────────────────────────────────────── */
  function applySearch(q) {
    query = q.toLowerCase().trim();
    document.querySelectorAll('[data-s]').forEach(el => {
      el.classList.toggle('hidden', query.length > 0 && !el.getAttribute('data-s').toLowerCase().includes(query));
    });
    updateExecutiveBriefing();
  }

  function filterDeskSections() {
    const allSecIds = ['sec-1', 'sec-2', 'sec-3', 'sec-4', 'sec-5', 'sec-rss', 'sec-6'];
    allSecIds.forEach(id => {
      const el = $(id);
      if (!el) return;
      
      let shouldShow = false;
      if (activeDesk === 'all') {
        shouldShow = true;
      } else if (activeDesk === 'front' && id === 'sec-1') {
        shouldShow = true;
      } else if (activeDesk === 'brief' && id === 'sec-2') {
        shouldShow = true;
      } else if (activeDesk === 'audit' && (id === 'sec-3' || id === 'sec-6')) {
        shouldShow = true;
      } else if (activeDesk === 'fraud' && id === 'sec-4') {
        shouldShow = true;
      } else if (activeDesk === 'strategy' && id === 'sec-5') {
        shouldShow = true;
      } else if (activeDesk === 'livewire' && id === 'sec-rss') {
        shouldShow = true;
      }
      
      el.classList.toggle('hidden', !shouldShow);
    });
  }

  // Simulated Agentic PDF Ingestion OCR Typewriter Console Log Engine
  function runAgenticPDFParserSimulation() {
    const selectedTemplate = pdfTemplateSelect.value;
    if (!selectedTemplate) return;

    pdfTemplateSelect.disabled = true;
    pdfParseBtn.disabled = true;
    consoleBox.classList.remove('hidden');
    consoleLog.textContent = '';

    const logs = [
      { text: `[INTEL] Opening PDF stream: '${pdfTemplateSelect.options[pdfTemplateSelect.selectedIndex].text}' ...`, delay: 0 },
      { text: `[OCR RUN] Executing document layout analysis & structural text OCR ...`, delay: 600 },
      { text: `[LLM PASS] Extracting corporate compliance & provisioning vectors via Gemini pass ...`, delay: 1300 },
      { text: `[SUCCESS] Hydrated circular structured JSON. Prepending card to terminal feed.`, delay: 2000 }
    ];

    logs.forEach(log => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.textContent = log.text;
        if (log.text.startsWith('[SUCCESS]')) {
          line.style.color = '#4AF626';
          line.style.fontWeight = 'bold';
        } else {
          line.style.color = '#39FF14';
        }
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight;
      }, log.delay);
    });

    // Ingest and render circular card
    setTimeout(() => {
      if (!D) return;
      
      const pool = window.ALL_FINANCIALS_POOL || [];
      let articleId = 'fp_hero';
      if (selectedTemplate === 'pdf_rbi') articleId = 'fp_hero';
      else if (selectedTemplate === 'pdf_sebi') articleId = 'db_2';
      else if (selectedTemplate === 'pdf_mca') articleId = 'reg_1';
      else if (selectedTemplate === 'pdf_nclt') articleId = 'fraud_3';
      else if (selectedTemplate === 'pdf_nfra') articleId = 'reg_3';

      const matched = pool.find(item => item.id === articleId);
      if (matched) {
        const clone = JSON.parse(JSON.stringify(matched));
        clone.pubDate = new Date().toISOString();
        
        const sec = matched.section;
        if (!D[sec]) D[sec] = { articles: [] };
        if (!D[sec].articles) D[sec].articles = [];
        
        D[sec].articles = D[sec].articles.filter(a => a.id !== clone.id);
        D[sec].articles.unshift(clone);

        persist();
        render();

        // Flash visual highlight on the newly parsed card
        setTimeout(() => {
          const cardEl = document.querySelector(`[data-s*="${clone.id}"]`) || document.querySelector(`[data-s*="${clone.title.substring(0, 10)}"]`);
          if (cardEl) {
            cardEl.style.transition = 'none';
            cardEl.style.outline = '2px solid var(--accent)';
            cardEl.style.boxShadow = '0 0 15px var(--accent)';
            setTimeout(() => {
              cardEl.style.transition = 'outline 1.5s ease, box-shadow 1.5s ease';
              cardEl.style.outline = 'none';
              cardEl.style.boxShadow = 'none';
            }, 1500);
          }
        }, 100);
      }

      pdfTemplateSelect.disabled = false;
      pdfTemplateSelect.value = '';
      pdfParseBtn.disabled = true;

      const finishLine = document.createElement('div');
      finishLine.textContent = '\n> INGESTION COMPLETE. READY.';
      finishLine.style.color = '#888888';
      consoleLog.appendChild(finishLine);
      consoleLog.scrollTop = consoleLog.scrollHeight;
    }, 2600);
  }

  /* ── 13. EVENT WIRING ───────────────────────────────── */
  function wire() {
    themeBtn.addEventListener('click', toggleTheme);
    refreshBtn.addEventListener('click', () => doRefresh(false));
    searchInput.addEventListener('input', e => applySearch(e.target.value));

    // Wire Time Horizon Slider
    horizonSlider.addEventListener('input', e => {
      sliderHorizonHrs = parseInt(e.target.value);
      sliderLabel.textContent = `Horizon: ${sliderHorizonHrs === 0 ? 'Live' : sliderHorizonHrs + 'h ago'}`;
      render();
    });

    // Wire Ticker Click Analytics Drawer opening
    tickerTrack.addEventListener('click', e => {
      const itemEl = e.target.closest('.ticker-item');
      if (itemEl) {
        const name = itemEl.getAttribute('data-ticker-name');
        if (name) showTickerSparkline(name);
      }
    });

    // Wire horizontal desk tabs
    if (deskTabs) {
      deskTabs.addEventListener('click', e => {
        const tab = e.target.closest('.desk-tab');
        if (tab) {
          deskTabs.querySelectorAll('.desk-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          activeDesk = tab.getAttribute('data-desk');
          render();
        }
      });
    }

    // Wire RSS Sort Select Dropdown
    const rssSortSelect = $('rss-sort-select');
    if (rssSortSelect) {
      rssSortSelect.addEventListener('change', () => {
        renderRSS();
      });
    }

    // Wire PDF Ingestion
    if (pdfTemplateSelect) {
      pdfTemplateSelect.addEventListener('change', () => {
        pdfParseBtn.disabled = !pdfTemplateSelect.value;
      });
    }
    if (pdfParseBtn) {
      pdfParseBtn.addEventListener('click', runAgenticPDFParserSimulation);
    }

    // Wire Ingest Document Panel Toggle
    if (ingestToggleBtn && collapsibleIntake) {
      ingestToggleBtn.addEventListener('click', () => {
        const isCollapsed = collapsibleIntake.classList.toggle('collapsed');
        ingestToggleBtn.classList.toggle('active', !isCollapsed);
        if (!isCollapsed) {
          collapsibleIntake.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    // Wire Briefing Toggles with Tactile Spring Physics
    const briefingToggleBtn = $('briefing-toggle-btn');
    const briefingToggleLabel = $('briefing-toggle-label');
    const briefingPanel = $('briefing-panel');
    const briefingHandleBtn = $('briefing-handle-btn');
    const briefingHandleArrow = briefingHandleBtn ? briefingHandleBtn.querySelector('.briefing-handle__arrow') : null;
    const briefingGooeyContainer = $('briefing-gooey-container');

    // Euler integration spring variables
    let currentX = 0;
    let targetX = 0;
    let vx = 0;
    const stiffness = 160; // tension constant
    const damping = 15;    // friction constant
    let springActive = false;
    let isBriefingCollapsed = false;
    let lastTime = performance.now();

    function updateSpring(timestamp) {
      if (!springActive) return;
      let dt = (timestamp - lastTime) / 1000;
      if (dt > 0.1) dt = 0.1; // bound dt to prevent huge jumps on lag
      lastTime = timestamp;

      const dx = targetX - currentX;
      const ax = dx * stiffness - vx * damping;
      vx += ax * dt;
      currentX += vx * dt;

      if (briefingPanel) {
        briefingPanel.style.transform = `translate3d(${currentX}px, 0, 0)`;
      }

      // Check if settled
      if (Math.abs(targetX - currentX) < 0.05 && Math.abs(vx) < 0.05) {
        currentX = targetX;
        vx = 0;
        springActive = false;
        if (briefingPanel) {
          briefingPanel.style.transform = `translate3d(${currentX}px, 0, 0)`;
          if (isBriefingCollapsed) {
            briefingPanel.classList.add('collapsed');
          } else {
            briefingPanel.classList.remove('collapsed');
          }
        }
        if (briefingGooeyContainer) {
          briefingGooeyContainer.classList.remove('gooey-active');
        }
      } else {
        requestAnimationFrame(updateSpring);
      }
    }

    function triggerSpring(target) {
      targetX = target;
      if (briefingGooeyContainer) {
        briefingGooeyContainer.classList.add('gooey-active');
      }
      if (briefingPanel) {
        briefingPanel.classList.remove('collapsed');
      }
      if (!springActive) {
        springActive = true;
        lastTime = performance.now();
        requestAnimationFrame(updateSpring);
      }
    }

    function toggleBriefing() {
      if (!briefingPanel) return;
      isBriefingCollapsed = !isBriefingCollapsed;
      const target = isBriefingCollapsed ? 480 : 0;
      triggerSpring(target);

      if (briefingToggleLabel) {
        briefingToggleLabel.textContent = isBriefingCollapsed ? 'Show Briefing' : 'Hide Briefing';
      }
      if (briefingToggleBtn) {
        briefingToggleBtn.classList.toggle('active', !isBriefingCollapsed);
      }
      if (briefingHandleArrow) {
        briefingHandleArrow.textContent = isBriefingCollapsed ? '◀' : '▶';
      }
    }

    if (briefingToggleBtn) {
      briefingToggleBtn.addEventListener('click', toggleBriefing);
    }
    if (briefingHandleBtn) {
      briefingHandleBtn.addEventListener('click', toggleBriefing);
    }
  }

  /* ── INIT ───────────────────────────────────────────── */
  window.addEventListener('DOMContentLoaded', boot);
})();
