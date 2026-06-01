// server.js - Custom Zero-Dependency Financial Terminal Web Server
// Serves the ALL FINANCIALS terminal and implements background cache scheduling.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const CACHE_FILE = path.join(__dirname, 'news_cache.json');
const TEMPLATE_FILE = path.join(__dirname, 'data_templates.js');

// Helper to load templates if the cache file is empty or missing
function loadInitialData() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading cache file, falling back to templates:", err);
  }

  // Load from data_templates.js as fallback
  try {
    if (fs.existsSync(TEMPLATE_FILE)) {
      const templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf8');
      // Extract the object from the file content safely
      const match = templateContent.match(/const ALL_FINANCIALS_DATA = ([\s\S]+?);/);
      if (match && match[1]) {
        // Evaluate the object or parse it safely
        const dataObj = eval('(' + match[1] + ')');
        fs.writeFileSync(CACHE_FILE, JSON.stringify(dataObj, null, 2), 'utf8');
        return dataObj;
      }
    }
  } catch (err) {
    console.error("Critical error seeding data templates:", err);
  }

  return { error: "Database not seeded" };
}

// Generate slight variations in market ticker metrics during refresh to simulate live feeds
function refreshDataMetrics(currentData) {
  const data = JSON.parse(JSON.stringify(currentData)); // deep clone
  
  if (data.ticker) {
    data.ticker = data.ticker.map(item => {
      let val = parseFloat(item.value.replace(/[^0-9.-]/g, ''));
      let percent = parseFloat(item.change.replace(/[^0-9.-]/g, ''));
      
      // Random fluctuation factor between -0.05% and +0.05%
      const factor = (Math.random() - 0.5) * 0.1;
      val = val * (1 + factor / 100);
      percent = percent + factor;
      
      let valStr = "";
      if (item.name.includes("Nifty")) {
        valStr = val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (item.name.includes("US 10Y") || item.name.includes("Yield")) {
        valStr = val.toFixed(3) + "%";
      } else if (item.name.includes("Gold") || item.name.includes("Silver")) {
        valStr = "$" + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        valStr = val.toFixed(2);
      }
      
      const newPercent = (percent >= 0 ? "+" : "") + percent.toFixed(2) + "%";
      
      return {
        ...item,
        value: valStr,
        change: newPercent,
        positive: percent >= 0
      };
    });
  }
  
  // Set last updated time to current server time
  data.lastUpdated = new Date().toISOString();
  
  // Save updated cache
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write to news_cache.json:", err);
  }
  
  return data;
}

// Simulated breaking news articles library for live refresh injection
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

function injectServerSimulatedArticle(data) {
  if (!data) return data;
  const existingIds = new Set();
  ["section1", "section2", "section3", "section4", "section5"].forEach(s => {
    if (data[s] && data[s].articles) {
      data[s].articles.forEach(a => existingIds.add(a.id));
    }
  });

  const candidates = SIMULATED_NEWS.filter(item => !existingIds.has(item.article.id));
  if (candidates.length === 0) return data;

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  const clone = JSON.parse(JSON.stringify(picked.article));
  clone.pubDate = new Date().toISOString();

  const sec = picked.section;
  if (!data[sec]) data[sec] = { articles: [] };
  if (!data[sec].articles) data[sec].articles = [];
  data[sec].articles.unshift(clone);

  return data;
}

// Initial seeding
let cachedData = loadInitialData();

// Automated 12-hour background loop scheduler (12 hours = 43,200,000 milliseconds)
const SCHEDULER_INTERVAL_MS = 12 * 60 * 60 * 1000;
setInterval(() => {
  console.log(`[Scheduler] Executing 12-hour background loop crawl: ${new Date().toISOString()}`);
  cachedData = refreshDataMetrics(cachedData);
  cachedData = injectServerSimulatedArticle(cachedData);
  
  // Save updated cache file after injection
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedData, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to write to news_cache.json in background scheduler:", err);
  }
}, SCHEDULER_INTERVAL_MS);

// Create HTTP Server
const server = http.createServer((req, res) => {
  // Simple CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = req.url.split('?')[0];

  // API Endpoints
  if (parsedUrl === '/api/news' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cachedData));
    return;
  }

  if ((parsedUrl === '/api/refresh' || parsedUrl === '/api/news/refresh') && (req.method === 'GET' || req.method === 'POST')) {
    console.log(`[API] Manual refresh requested at: ${new Date().toISOString()}`);
    cachedData = refreshDataMetrics(cachedData);
    cachedData = injectServerSimulatedArticle(cachedData);

    // Save updated cache file after injection
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cachedData, null, 2), 'utf8');
    } catch (err) {
      console.error("Failed to write to news_cache.json after manual refresh injection:", err);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cachedData));
    return;
  }

  // Static File Router
  let filePath = path.join(__dirname, parsedUrl === '/' ? 'index.html' : parsedUrl);
  
  // Prevent directory traversal attacks
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  let contentType = 'text/html';

  switch (ext) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'application/javascript';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  ALL FINANCIALS: Premium Single-Page Financial Terminal Server  `);
  console.log(`  Access the terminal locally: http://localhost:${PORT}        `);
  console.log(`  API Feed endpoint: http://localhost:${PORT}/api/news           `);
  console.log(`  Background Scheduler: Active (Running every 12 hours)         `);
  console.log(`================================================================`);
});
