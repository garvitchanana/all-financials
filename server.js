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

// Initial seeding
let cachedData = loadInitialData();

// Automated 12-hour background loop scheduler (12 hours = 43,200,000 milliseconds)
const SCHEDULER_INTERVAL_MS = 12 * 60 * 60 * 1000;
setInterval(() => {
  console.log(`[Scheduler] Executing 12-hour background loop crawl: ${new Date().toISOString()}`);
  cachedData = refreshDataMetrics(cachedData);
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
