// app.js — ALL FINANCIALS Reactive Core Engine v2
// Enhanced ticker scroll + RSS CORVAL feed engine via rss2json.com

(function () {
  'use strict';

  /* ── 1. STATE ───────────────────────────────────────── */
  let D = null;           // master data object
  let query = '';         // active search filter
  let rssCache = [];      // aggregated RSS items
  let rssFetchTimer = null;

  /* ── 2. DOM CACHE ───────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const tickerTrack   = $('ticker-track');
  const refreshBtn    = $('refresh-btn');
  const refreshIcon   = $('refresh-icon');
  const themeBtn      = $('theme-btn');
  const themeLabel    = $('theme-label');
  const iconSun       = $('icon-sun');
  const iconMoon      = $('icon-moon');
  const searchInput   = $('search-input');
  const dateEl        = $('masthead-date');
  const lastUpdatedEl = $('last-updated');
  const sec1          = $('sec-1-grid');
  const sec2          = $('sec-2-grid');
  const sec3          = $('sec-3-grid');
  const sec4          = $('sec-4-grid');
  const sec5          = $('sec-5-grid');
  const rssGrid       = $('rss-grid');
  const rssPulse      = $('rss-pulse');
  const rssStatus     = $('rss-status');
  const fwTag         = $('fw-tag');
  const fwBody        = $('fw-body');

  /* ── 3. BOOT ────────────────────────────────────────── */
  function boot() {
    setDate();
    loadTheme();
    loadData();
    wire();
    initTickerScroll();
    setInterval(tickerPulse, 4000);
    setInterval(schedulerCheck, 5 * 60000);
    // RSS: first fetch immediately, then every 5 minutes
    rssBootstrap();
  }

  function setDate() {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  function weekNum() {
    const d = new Date(); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const y = new Date(Date.UTC(d.getUTCFullYear(),0,1));
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

  /* ── 5. DATA LOAD (API → localStorage → seed) ───────── */
  async function loadData() {
    // 1) try server API
    try {
      const r = await fetch('/api/news');
      if (r.ok) { D = await r.json(); render(); stamp(D.lastUpdated); return; }
    } catch (_) {}

    // 2) try localStorage (validate schema)
    const raw = localStorage.getItem('af_cache');
    if (raw) {
      try {
        const p = JSON.parse(raw);
        if (p && p.section1 && p.section2) { D = p; render(); stamp(D.lastUpdated); return; }
      } catch (_) {}
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
    try { localStorage.setItem('af_cache', JSON.stringify(D)); localStorage.setItem('af_last', D.lastUpdated); } catch(_){}
  }
  function stamp(iso) {
    if (!iso) return;
    lastUpdatedEl.textContent = 'Last updated: ' + new Date(iso).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }

  /* ── 6. SCHEDULER (12 h) ────────────────────────────── */
  function schedulerCheck() {
    const last = localStorage.getItem('af_last') || (D && D.lastUpdated);
    if (!last) return;
    if (Date.now() - new Date(last).getTime() >= 432e5) doRefresh(true);
  }

  /* ── 7. REFRESH ─────────────────────────────────────── */
  async function doRefresh(silent) {
    if (!silent) { refreshIcon.classList.add('spinning'); refreshBtn.disabled = true; refreshBtn.querySelector('.btn__label').textContent = 'Refreshing…'; }
    try {
      const r = await fetch('/api/refresh', {method:'POST'});
      if (r.ok) { D = await r.json(); render(); stamp(D.lastUpdated); endRefresh(); return; }
    } catch (_) {}
    // local sim
    setTimeout(() => {
      if (D.ticker) D.ticker = D.ticker.map(microShift);
      D.lastUpdated = new Date().toISOString();
      persist(); render(); stamp(D.lastUpdated); endRefresh();
    }, silent ? 0 : 900);
    // also re-fetch RSS on manual refresh
    if (!silent) rssFetchAll();
  }
  function endRefresh() { refreshIcon.classList.remove('spinning'); refreshBtn.disabled = false; refreshBtn.querySelector('.btn__label').textContent = 'Refresh Now'; }


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
      D.ticker[i] = microShift(D.ticker[i]);
    }
    // In-place DOM update (avoids full re-render for smoother scrolling)
    updateTickerValues(D.ticker);
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
    let v = parseFloat(t.value.replace(/[^0-9.\-]/g,'')); let p = parseFloat(t.change.replace(/[^0-9.\-]/g,''));
    const f = (Math.random()-.5)*.08; v *= 1+f/100; p += f;
    let s;
    if (/Nifty/.test(t.name)) s = v.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
    else if (/Yield|10Y|Liquid|ST Debt/.test(t.name)) s = v.toFixed(3)+'%';
    else if (/Gold|Silver/.test(t.name)) s = '$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    else if (/DXY/.test(t.name)) s = v.toFixed(2);
    else s = v.toFixed(2);
    return {...t, value:s, change:(p>=0?'+':'')+p.toFixed(2)+'%', positive:p>=0};
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
    }
  ];

  const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';
  const RSS_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const RSS_MAX_ITEMS = 18;            // max items to display

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
      } catch(_){}
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

    // Deduplicate by title similarity
    items = rssDedup(items);

    // Sort by publication date (newest first)
    items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Cap at max
    items = items.slice(0, RSS_MAX_ITEMS);

    rssCache = items;
    renderRSS();

    // Persist to localStorage
    try { localStorage.setItem('af_rss_cache', JSON.stringify(items)); } catch(_){}

    // Update status
    const ts = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    rssStatus.textContent = `${successCount}/${RSS_FEEDS.length} feeds connected · ${items.length} articles · Last sync: ${ts}`;
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
      const key = item.title.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0, 60);
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

    rssGrid.innerHTML = rssCache.map((item, i) => {
      const isLead = i === 0;
      const cls = isLead ? 'wire-card wire-card--lead' : 'wire-card';
      const timeAgo = rssTimeAgo(item.pubDate);
      const desc = item.description || '';
      const searchStr = (item.title + ' ' + desc + ' ' + item.source).replace(/"/g, '&quot;');

      return `<div class="${cls}" data-s="${searchStr}">
        <div class="wire-card__source">
          <span class="wire-card__source-badge">${item.category}</span>
          ${item.source}
          <span class="wire-card__time">${timeAgo}</span>
        </div>
        <a href="${item.link}" target="_blank" rel="noopener" class="wire-card__hl">${item.title}</a>
        ${desc ? `<p class="wire-card__desc">${desc}</p>` : ''}
        <div class="wire-card__foot">
          <a href="${item.link}" target="_blank" rel="noopener">Read Full Article →</a>
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
    rbi:     'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    tech:    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    realty:  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
    fraud:   'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'
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
    wireAccordions();
    if (query) applySearch(query);
  }

  /* helpers */
  function tag(priority) {
    const p = (priority||'').toLowerCase();
    return `<span class="tag tag--${p}">${priority}</span>`;
  }
  function tierBadge(n) { return `<span class="tag--tier">T${n}</span>`; }
  function footBlock(a) {
    return `<div class="foot">
      <span>Raw Gazette: <a href="${a.rawGazette}" target="_blank" rel="noopener">${a.rawGazetteLabel}</a></span>
      <span>Market Lens: <a href="${a.marketLens}" target="_blank" rel="noopener">${a.marketLensLabel}</a></span>
    </div>`;
  }
  function searchable(a) {
    return (a.title + ' ' + (a.whatHappened||'') + ' ' + (a.whyItMatters||'') + ' ' + (a.impact||'') + ' ' + (a.details||'')).replace(/"/g, '&quot;');
  }

  /* Section 1: Front Page */
  function renderSec1(s) {
    sec1.innerHTML = s.articles.map(a => {
      const cls = a.span === 'hero' ? 'block--hero' : 'block--feature';
      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${imgTag(a.image, a.title, 'block__img')}
        ${tag(a.priority)}${tierBadge(a.sourceTier)}
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
    sec2.innerHTML = s.articles.map(a => `
      <div class="acc" data-s="${searchable(a)}">
        <div class="acc__head">
          <img src="${a.image || guessFallback(a.title)}" class="acc__thumb" alt="" loading="lazy"
            onerror="this.onerror=null;this.src='${guessFallback(a.title)}';if(this.naturalWidth===0)this.style.display='none';">
          <span class="acc__title">${a.title}</span>
          <div class="acc__tags">${tag(a.priority)}${tierBadge(a.sourceTier)}<svg class="acc__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div>
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
    sec3.innerHTML = s.articles.map(a => {
      const cls = a.span === 'hero' ? 'block--hero' : a.span === 'feature' ? 'block--feature' : 'block--mini';
      const hasImg = a.image && a.span !== 'mini';
      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${hasImg ? imgTag(a.image, a.title, 'block__img') : ''}
        ${tag(a.priority||'Important')}${tierBadge(a.sourceTier)}
        <a href="${a.rawGazette}" target="_blank" class="block__hl">${a.title}</a>
        <div class="seg"><p>${a.details}</p></div>
        ${a.impact ? `<div class="seg"><span class="seg__label">[Systemic & Audit Impact]</span><p>${a.impact}</p></div>` : ''}
        ${footBlock(a)}
      </div>`;
    }).join('');
  }

  /* Section 4: Fraud (dark ledger) */
  function renderSec4(s) {
    sec4.innerHTML = s.articles.map(a => {
      const cls = a.span === 'hero' ? 'block--hero' : 'block--feature';
      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${a.image ? imgTag(a.image, a.title, 'block__img') : ''}
        <span class="tag tag--forensics">Forensics</span>${tierBadge(a.sourceTier)}
        <a href="${a.rawGazette}" target="_blank" class="block__hl">${a.title}</a>
        <ul class="fraud-list">${a.fraudBullets.map(b => `<li class="fraud-item"><strong>${b.label}</strong>${b.text}</li>`).join('')}</ul>
        ${footBlock(a)}
      </div>`;
    }).join('');
  }

  /* Section 5: Strategy & Capital Markets */
  function renderSec5(s) {
    sec5.innerHTML = s.articles.map(a => {
      const cls = a.span === 'hero' ? 'block--hero' : a.span === 'feature' ? 'block--feature' : 'block--mini';
      const hasImg = a.image && a.span !== 'mini';
      let extra = '';

      if (a.metrics) {
        extra = `<div class="metrics">${Object.entries(a.metrics).map(([k,v]) => `<div class="metric"><span class="metric__k">${k}</span><span class="metric__v">${v}</span></div>`).join('')}</div>`;
      }
      if (a.telemetry) {
        extra = `<div class="metrics">${Object.entries(a.telemetry).map(([k,v]) => `<div class="metric"><span class="metric__k">${k}</span><span class="metric__v">${v}</span></div>`).join('')}</div>`;
      }
      if (a.radar) {
        extra = `<div class="radar"><div class="radar__sub"><strong>[Unmet Corporate Friction]</strong><p>${a.radar.problem}</p></div><div class="radar__sub"><strong>[B2B Agentic AI Solution]</strong><p>${a.radar.solution}</p></div></div>`;
      }

      const typeLabel = ({pe_metrics:'PE Valuation',consulting_case:'Consulting Case',b2b_radar:'B2B Radar',banking_telemetry:'Banking',sports_economics:'Sports Econ',wealth_telemetry:'Telemetry'})[a.type]||'Strategy';

      return `<div class="block ${cls}" data-s="${searchable(a)}">
        ${hasImg ? imgTag(a.image, a.title, 'block__img') : ''}
        <span class="tag tag--important">${typeLabel}</span>${tierBadge(a.sourceTier)}
        <a href="${a.rawGazette}" target="_blank" class="block__hl">${a.title}</a>
        <div class="seg"><p>${a.details}</p></div>
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
  }

  /* ── 13. EVENT WIRING ───────────────────────────────── */
  function wire() {
    themeBtn.addEventListener('click', toggleTheme);
    refreshBtn.addEventListener('click', () => doRefresh(false));
    searchInput.addEventListener('input', e => applySearch(e.target.value));
  }

  /* ── INIT ───────────────────────────────────────────── */
  window.addEventListener('DOMContentLoaded', boot);
})();
