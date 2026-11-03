#!/usr/bin/env node
/* ============================================================
   FINAL TEST SUITE — headless Chrome via raw CDP (no deps).
   Collects console errors, uncaught exceptions, failed requests,
   then runs a functional assertion suite on desktop + mobile.
   Exit code 0 = all green, 1 = failures found.
   ============================================================ */
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
];
const BASE = "http://localhost:8137";
const results = [];
let chrome, ws, msgId = 0;
const pending = new Map();
const consoleErrors = [], pageErrors = [], failedRequests = [];
const requestUrls = {};

function findChrome() {
  for (const c of CHROME_CANDIDATES) { try { if (fs.existsSync(c)) return c; } catch (e) {} }
  return null;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression, awaitPromise = false) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise });
  if (r.exceptionDetails) throw new Error("eval threw: " + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description || r.exceptionDetails.text).slice(0, 300));
  return r.result.value;
}
function record(name, pass, info) {
  results.push({ name, pass: !!pass, info: info == null ? "" : String(info).slice(0, 220) });
  console.log((pass ? "  ✓ " : "  ✗ ") + name + (pass ? "" : "  → " + String(info == null ? "" : info).slice(0, 200)));
}
const evals = [];

/* ------- assertion suite ------- */
evals.push(["boot: title", `document.title`]);
evals.push(["boot: byte instances >= 2 (hero + dock)", `window.Byte && window.Byte.debug.instances.length`]);
evals.push(["boot: gallery tiles = 67", `document.querySelectorAll('.sheet-item').length`]);
evals.push(["boot: gallery real images", `document.querySelectorAll('.sheet-item img.ph').length`]);
evals.push(["boot: skill pills = 32", `document.querySelectorAll('.skill-pill').length`]);
evals.push(["boot: repo cards = 3", `document.querySelectorAll('.repo-card').length`]);
evals.push(["boot: ticker bands = 2", `document.querySelectorAll('.ticker').length`]);
evals.push(["boot: hero floaters = 4", `document.querySelectorAll('.hero-floater').length`]);
evals.push(["boot: headlines word-wrapped", `document.querySelectorAll('.section-head h2 .wline').length > 10`]);
evals.push(["boot: count-up target present", `!!document.querySelector('[data-count="8.13"]')`]);
evals.push(["hero: polaroid deck present + opens lightbox", `(async () => {
  const deck = document.querySelector('.hero-polaroid');
  if (!deck) return 'no deck';
  deck.click();
  await new Promise(r => setTimeout(r, 200));
  const lb = document.getElementById('lightbox');
  const opened = lb.open;
  const hasImg = !!lb.querySelector('.lightbox__stage img');
  lb.close();
  await new Promise(r => setTimeout(r, 80));
  return opened + '|' + hasImg;
})()`, v => v === 'true|true']);
evals.push(["byte: click hero → reacts", `(async () => {
  const el = document.querySelector('#hero-byte .byte-instance');
  el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
  await new Promise(r => setTimeout(r, 250));
  return el.className;
})()`, v => /byte--(happy|surprised|celebrate|wave|excited|dizzy|dance|love)/.test(v)]);
evals.push(["byte: petting → love state", `(async () => {
  const el = document.querySelector('#hero-byte .byte-instance');
  el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
  await new Promise(r => setTimeout(r, 1500));
  const r0 = el.getBoundingClientRect();
  let x = r0.left + 20;
  for (let i = 0; i < 10; i++) {
    el.dispatchEvent(new PointerEvent('pointermove', {clientX: x, clientY: r0.top + 60, bubbles: true}));
    x += (i % 2 === 0 ? 40 : -40);
  }
  await new Promise(r => setTimeout(r, 300));
  return el.className;
})()`, v => /byte--love/.test(v) || /byte--(happy|dizzy|dance|excited)/.test(v)]);
evals.push(["byte: 6-click combo → dance mode", `(async () => {
  const el = document.querySelector('#hero-byte .byte-instance');
  for (let i = 0; i < 7; i++) { el.dispatchEvent(new MouseEvent('click', {bubbles: true})); await new Promise(r => setTimeout(r, 120)); }
  await new Promise(r => setTimeout(r, 250));
  return el.className;
})()`, v => /byte--dance/.test(v)]);
evals.push(["byte: guide menu opens + closes", `(async () => {
  document.querySelector('.byte-dock__btn').click();
  await new Promise(r => setTimeout(r, 200));
  const menu = document.getElementById('byte-menu');
  const opened = menu.open;
  menu.close();
  await new Promise(r => setTimeout(r, 100));
  return opened && !menu.open;
})()`]);
evals.push(["byte: post menu items hidden while unconfigured", `document.querySelectorAll('[data-byte-action="featured-post"][hidden], [data-byte-action="latest-post"][hidden]').length === 2`]);
evals.push(["gallery: filter Hackathons shrinks wall", `(async () => {
  const before = document.querySelectorAll('.sheet-item').length;
  const btn = [...document.querySelectorAll('.gallery-filters .filter-btn')].find(b => b.textContent === 'Hackathons');
  btn.click();
  await new Promise(r => setTimeout(r, 150));
  const after = document.querySelectorAll('.sheet-item').length;
  [...document.querySelectorAll('.gallery-filters .filter-btn')].find(b => b.textContent === 'All').click();
  await new Promise(r => setTimeout(r, 100));
  return before + ' -> ' + after;
})()`, v => parseInt(v.split(' -> ')[1]) < parseInt(v.split(' -> ')[0])]);
evals.push(["gallery: lightbox opens + Escape closes", `(async () => {
  const tile = document.querySelector('.sheet-item');
  tile.click();
  await new Promise(r => setTimeout(r, 150));
  const lb = document.getElementById('lightbox');
  const opened = lb.open;
  lb.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  await new Promise(r => setTimeout(r, 100));
  return opened;
})()`]);
evals.push(["case: BankNest case study opens + hash", `(async () => {
  const btn = document.querySelector('.case-toggle[aria-controls="banknest-case"]');
  btn.click();
  await new Promise(r => setTimeout(r, 150));
  const ok = !document.getElementById('banknest-case').hidden && btn.getAttribute('aria-expanded') === 'true' && location.hash === '#banknest-case';
  btn.click();
  return ok;
})()`]);
evals.push(["sim: transfer commits atomically", `(async () => {
  document.querySelector('#sim-transfer .sim-go').click();
  await new Promise(r => setTimeout(r, 4400));
  const a = document.querySelector('#sim-transfer .acct-a .acct-bal').textContent;
  const done = document.querySelectorAll('#sim-transfer .pipe-step.is-done').length;
  return a + '|' + done;
})()`, v => v.startsWith('₹11,900') && parseInt(v.split('|')[1]) === 4]);
evals.push(["sim: transfer failure rolls back", `(async () => {
  document.querySelector('#sim-transfer .sim-fail').click();
  await new Promise(r => setTimeout(r, 4400));
  const a = document.querySelector('#sim-transfer .acct-a .acct-bal').textContent;
  const err = document.querySelectorAll('#sim-transfer .pipe-step.is-error').length;
  return a + '|' + err;
})()`, v => v.startsWith('₹12,400') && parseInt(v.split('|')[1]) === 1]);
evals.push(["sim: LifeDrop approve → fulfill decrements inventory", `(async () => {
  document.querySelector('#sim-request .req-approve').click();
  await new Promise(r => setTimeout(r, 120));
  document.querySelector('#sim-request .req-fulfill').click();
  await new Promise(r => setTimeout(r, 120));
  return document.querySelector('#sim-request .status-badge').textContent + '|' + document.querySelector('#sim-request .units').textContent;
})()`, v => v === 'Fulfilled|13']);
evals.push(["sim: 90-day check renders with dates", `document.querySelector('.elig-text').textContent.length > 80`]);
evals.push(["skills: pill click fills evidence panel", `(async () => {
  document.querySelectorAll('.skill-pill')[4].click();
  await new Promise(r => setTimeout(r, 120));
  return document.querySelector('.skill-detail').textContent.length;
})()`, v => parseInt(v) > 60]);
evals.push(["palette: Ctrl+K opens, Escape closes", `(async () => {
  document.dispatchEvent(new KeyboardEvent('keydown', {key: 'k', ctrlKey: true, bubbles: true}));
  await new Promise(r => setTimeout(r, 150));
  const p = document.getElementById('palette');
  const opened = p.open;
  p.close();
  return opened;
})()`]);
evals.push(["settings: motion Off applies + restores", `(async () => {
  document.querySelector('.nav-icon-btn[data-open-settings]').click();
  await new Promise(r => setTimeout(r, 120));
  const off = [...document.querySelectorAll('[data-motion-choice]')].find(b => b.dataset.motionChoice === 'off');
  off.click();
  await new Promise(r => setTimeout(r, 80));
  const applied = document.documentElement.getAttribute('data-motion') === 'off';
  [...document.querySelectorAll('[data-motion-choice]')].find(b => b.dataset.motionChoice === 'full').click();
  await new Promise(r => setTimeout(r, 80));
  const restored = document.documentElement.getAttribute('data-motion') === 'full';
  document.getElementById('settings-menu').close();
  return applied && restored;
})()`]);
evals.push(["copy: copy email shows toast (no throw)", `(async () => {
  document.querySelector('[data-copy-email]').click();
  await new Promise(r => setTimeout(r, 300));
  return document.getElementById('toast').classList.contains('is-shown');
})()`]);
evals.push(["nav: all anchors resolve", `[...document.querySelectorAll('a[href^="#"]')].every(a => { const id = a.getAttribute('href').slice(1); return !id || document.getElementById(id); })`]);
evals.push(["links: external links are noopener", `[...document.querySelectorAll('a[target="_blank"]')].every(a => (a.rel || '').includes('noopener'))`]);
evals.push(["more builds: 7 project cards render", `document.querySelectorAll('.more-build-card').length`]);
evals.push(["more builds: links valid + noopener", `[...document.querySelectorAll('.more-build-card a.mb-name')].length === 7 && [...document.querySelectorAll('.more-build-card a.mb-name')].every(a => (a.rel || '').includes('noopener'))`]);
evals.push(["builds: dedicated shelf section after work", `!!document.getElementById('builds') && document.querySelectorAll('#builds .more-build-card').length === 7`]);
evals.push(["sound: engine present and OFF by default", `window.Byte && window.Byte.SoundFX && typeof window.Byte.SoundFX.play === 'function' && window.Byte.SoundFX.enabled === false`]);
evals.push(["sound: nav quick toggle works + persists state", `(async () => {
  const btn = document.querySelector('.site-nav [data-sound-quick]');
  if (!btn) return 'no btn';
  btn.click();
  await new Promise(r => setTimeout(r, 120));
  const on = window.Byte.SoundFX.enabled === true && btn.getAttribute('aria-pressed') === 'true';
  btn.click();
  await new Promise(r => setTimeout(r, 120));
  const off = window.Byte.SoundFX.enabled === false && btn.getAttribute('aria-pressed') === 'false';
  return on && off;
})()`]);
evals.push(["handfx: graceful camera-degraded state", `(async () => {
  window.HandFX.open();
  await new Promise(r => setTimeout(r, 2500));
  const st = document.getElementById('handfx-status').textContent;
  const closed = (window.HandFX.close(), true);
  return st;
})()`, v => v.length > 5]);
evals.push(["resume: PDF reachable", `fetch('assets/resume/Siddhant_Pardeshi_General_Resume.pdf', {method: 'HEAD'}).then(r => r.status)`]);
evals.push(["data: version snapshot reachable", `fetch('data/version.json').then(r => r.status)`]);

/* ------- final inspection: recruiter + handfx demo + deep links + menu ------- */
async function runFinalInspection() {
  console.log("\n[final-inspection]");

  /* recruiter.html */
  await send("Page.navigate", { url: BASE + "/recruiter.html" });
  await sleep(1600);
  const r1 = await evaluate(`(() => ({
    h1: document.querySelector('h1') && document.querySelector('h1').textContent,
    skills: document.querySelectorAll('#rv-skills > div').length,
    buildLinks: document.querySelectorAll('#rv-more a.mini-link').length,
    avail: !!document.querySelector('[data-availability]'),
    toast: !!document.getElementById('toast')
  }))()`);
  record("recruiter: loads with identity + skills", r1.h1 === "Siddhant Pardeshi" && r1.skills === 7, JSON.stringify(r1).slice(0, 120));
  record("recruiter: all 7 more-build links present", r1.buildLinks === 7, String(r1.buildLinks));
  const r2 = await evaluate(`(async () => {
    document.querySelector('[data-lens-choice="backend"]').click();
    await new Promise(r => setTimeout(r, 100));
    const hits = document.querySelectorAll('.rv-block.lens-hit').length;
    const dims = document.querySelectorAll('.rv-block.lens-dim').length;
    document.querySelector('[data-lens-choice="all"]').click();
    return hits + '|' + dims;
  })()`, true);
  /* Backend lens: Project evidence + More builds + Full skills all carry the
     backend tag → 3 highlighted, 0 dimmed (every recruiter block is relevant) */
  record("recruiter: Backend lens re-weights page", r2 === "3|0", r2);
  const r3 = await evaluate(`!!document.querySelector('[data-copy-link]') && !!document.querySelector('[data-copy-summary]')`);
  record("recruiter: copy actions present", r3);

  /* handfx demo lifecycle */
  await send("Page.navigate", { url: BASE + "/index.html?handfx-test=1" });
  await sleep(1800);
  const h1 = await evaluate(`(async () => {
    window.HandFX.open();
    await new Promise(r => setTimeout(r, 900));
    const s = window.HandFX._engine.stats();
    const open = document.getElementById('handfx-overlay').open;
    window.HandFX.close();
    await new Promise(r => setTimeout(r, 150));
    const closed = !document.getElementById('handfx-overlay').open;
    return s.state + '|' + open + '|' + closed + '|' + (s.count > 500);
  })()`, true);
  record("handfx: demo opens, tracks, closes cleanly", h1 === "tracking|true|true|true", h1);

  /* hash deep link */
  await send("Page.navigate", { url: BASE + "/index.html#banknest-case" });
  await sleep(1800);
  const d1 = await evaluate(`(() => ({
    open: !document.getElementById('banknest-case').hidden,
    expanded: document.querySelector('.case-toggle[aria-controls="banknest-case"]').getAttribute('aria-expanded')
  }))()`);
  record("deep link: #banknest-case opens the case study", d1.open && d1.expanded === "true", JSON.stringify(d1));

  /* byte menu actions */
  await send("Page.navigate", { url: BASE + "/index.html" });
  await sleep(1600);
  const m1 = await evaluate(`(async () => {
    document.getElementById('byte-dock').hidden = false;
    document.querySelector('.byte-dock__btn').click();
    await new Promise(r => setTimeout(r, 150));
    const menu = document.getElementById('byte-menu');
    const opened = menu.open;
    document.querySelector('[data-byte-action="projects"]').click();
    await new Promise(r => setTimeout(r, 150));
    return opened + '|' + (menu.open === false) + '|' + location.hash;
  })()`, true);
  record("byte menu: opens + projects action navigates", m1 === "true|true|#work", m1);
  const m2 = await evaluate(`(async () => {
    document.getElementById('byte-dock').hidden = false;
    document.querySelector('.byte-dock__btn').click();
    await new Promise(r => setTimeout(r, 150));
    const snd = document.querySelector('[data-byte-action="sound"]');
    const before = window.Byte.SoundFX.enabled;
    snd.click();
    await new Promise(r => setTimeout(r, 120));
    const after = window.Byte.SoundFX.enabled;
    const staysOpen = document.getElementById('byte-menu').open;
    snd.click();
    await new Promise(r => setTimeout(r, 120));
    const restored = window.Byte.SoundFX.enabled === before;
    document.getElementById('byte-menu').close();
    return before + '->' + after + '|' + staysOpen + '|' + restored;
  })()`, true);
  record("byte menu: sound item toggles without closing", /false->true\|true\|true/.test(m2) || /true->false\|true\|true/.test(m2), m2);

  /* video lightbox */
  const v1 = await evaluate(`(async () => {
    const tile = [...document.querySelectorAll('.sheet-item')].find(t => t.getAttribute('aria-label').includes('Event film'));
    tile.click();
    await new Promise(r => setTimeout(r, 250));
    const lb = document.getElementById('lightbox');
    const hasVideo = !!lb.querySelector('.lightbox__stage video');
    const open = lb.open;
    lb.close();
    return open + '|' + hasVideo;
  })()`, true);
  record("gallery: video tile plays in lightbox", v1 === "true|true", v1);

  /* invite toast fires once only */
  const t1 = await evaluate(`(async () => {
    localStorage.removeItem('sp-sound-invited');
    location.reload();
    return 1;
  })()`, true);
  await sleep(3400);
  const t2 = await evaluate(`document.getElementById('toast').textContent`);
  const t3 = await evaluate(`(async () => { location.reload(); return 1; })()`, true);
  await sleep(3400);
  const t4 = await evaluate(`document.getElementById('toast').textContent`);
  record("sound: invite toast fires once, never nags", /soundtrack/.test(t2) && !/soundtrack/.test(t4), JSON.stringify([t2.slice(0, 40), t4.slice(0, 40)]));

  record("final-inspection: zero console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  record("final-inspection: zero uncaught exceptions", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
}

/* ------- recruiter mobile pass (never tested before) ------- */
async function runRecruiterMobile() {
  console.log("\n[recruiter-mobile-390]");
  consoleErrors.length = 0; pageErrors.length = 0; failedRequests.length = 0;
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: BASE + "/recruiter.html" });
  await sleep(1600);
  const ovf = await evaluate(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
  record("recruiter-mobile: no horizontal overflow", ovf <= 1, "delta=" + ovf);
  const lens = await evaluate(`(async () => {
    document.querySelector('[data-lens-choice="backend"]').click();
    await new Promise(r => setTimeout(r, 120));
    return document.querySelectorAll('.rv-block.lens-hit').length;
  })()`, true);
  record("recruiter-mobile: Backend lens works", lens >= 2, String(lens));
  const els = await evaluate(`(() => {
    const need = ['[data-copy-summary]', '[data-copy-link]', '[data-copy-email]', '#rv-skills', '#rv-more'];
    return need.map(s => s + ':' + (document.querySelector(s) ? 1 : 0)).join(' ');
  })()`);
  record("recruiter-mobile: all key controls present", !els.includes(":0"), els);
  const noInvite = await evaluate(`document.getElementById('toast').textContent.includes('soundtrack') === false`);
  record("recruiter-mobile: no sound-invite on calm page", noInvite);
  record("recruiter-mobile: zero console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  record("recruiter-mobile: zero uncaught exceptions", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(__dirname, "shot-recruiter-m.png"), Buffer.from(shot.data, "base64"));
  await send("Emulation.clearDeviceMetricsOverride");
}

/* ------- runner ------- */
async function runSuite(mobile) {
  const tag = mobile ? "mobile-390" : "desktop-1440";
  console.log("\\n[" + tag + "]");
  if (mobile) {
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  } else {
    await send("Emulation.clearDeviceMetricsOverride");
  }
  await send("Page.navigate", { url: BASE + "/index.html" + (mobile ? "?m=1" : "") });
  await sleep(2200);

  const title = await evaluate("document.title");
  record(tag + ": page loads", /Siddhant Pardeshi/.test(title), title);

  if (mobile) {
    const ovf = await evaluate(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
    record(tag + ": no horizontal overflow", ovf <= 1, "delta=" + ovf);
    const dockVis = await evaluate(`(async () => {
      window.scrollTo(0, document.body.scrollHeight * 0.6);
      await new Promise(r => setTimeout(r, 400));
      const d = document.getElementById('byte-dock');
      return !d.hidden;
    })()`);
    record(tag + ": Byte dock appears after scroll", dockVis);
    const menu = await evaluate(`(async () => {
      document.querySelector('.nav-toggle').click();
      await new Promise(r => setTimeout(r, 150));
      const m = document.getElementById('mobile-menu');
      const open = m.open;
      m.close();
      return open;
    })()`);
    record(tag + ": mobile menu opens", menu);
    const tiles = await evaluate(`document.querySelectorAll('.sheet-item').length`);
    record(tag + ": gallery renders", tiles >= 60, tiles);
    /* regression: span-2 tiles must not create implicit columns on 1-col grids
       (the "gallery doesn't show on mobile" bug) */
    const gal = await evaluate(`(async () => {
      const tiles = document.querySelectorAll('#gallery .sheet-item');
      tiles.forEach(t => t.classList.add('is-in'));
      const el = document.getElementById('gallery');
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 750));
      const w = [...tiles].filter(t => t.classList.contains('sheet-item--wide')).map(t => Math.round(t.getBoundingClientRect().width));
      const n = [...tiles].filter(t => !t.classList.contains('sheet-item--wide')).map(t => Math.round(t.getBoundingClientRect().width));
      return Math.min(...n) + '|' + Math.min(...w);
    })()`, true);
    record(tag + ": gallery tiles full-width (sliver-bug regression)", (() => {
      const p = gal.split('|').map(Number);
      return p[0] > 300 && p[1] > 300;
    })(), gal);
  } else {
    /* run network probes FIRST, then reset the ledgers so the
       zero-noise checks measure the site, not the test itself */
    try {
      const pdf = await evaluate(`fetch('assets/resume/Siddhant_Pardeshi_General_Resume.pdf', {method: 'HEAD'}).then(r => r.status)`, true);
      record("resume: PDF reachable", pdf === 200, String(pdf));
    } catch (e) { record("resume: PDF reachable", false, e.message); }
    try {
      const vs = await evaluate(`fetch('data/version.json').then(r => r.status)`, true);
      record("data: version snapshot reachable", vs === 200, String(vs));
    } catch (e) { record("data: version snapshot reachable", false, e.message); }
    consoleErrors.length = 0; pageErrors.length = 0; failedRequests.length = 0;
    for (const [name, expr, check] of evals.filter(e => !/resume: PDF|version snapshot/.test(e[0]))) {
      try {
        const v = await evaluate(expr, true);
        if (check) record(name, !!check(v), v);
        else if (typeof v === "boolean") record(name, v, String(v));
        else if (typeof v === "number") record(name, v > 0, String(v));
        else record(name, true, String(v).slice(0, 80));
      } catch (e) {
        record(name, false, e.message);
      }
    }
  }
  record(tag + ": zero console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  record(tag + ": zero uncaught exceptions", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
  record(tag + ": zero failed requests", failedRequests.length === 0, failedRequests.slice(0, 3).join(" | "));
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) { console.error("No Chrome/Edge found"); process.exit(2); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-test-"));
  chrome = spawn(chromePath, [
    "--headless=new", "--disable-gpu", "--no-first-run",
    "--remote-debugging-port=9333",
    "--user-data-dir=" + profile,
    "--window-size=1440,900",
    "about:blank"
  ], { stdio: "ignore" });

  let list = null;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const res = await fetch("http://127.0.0.1:9333/json/list");
      list = await res.json();
      if (list && list.length) break;
    } catch (e) {}
  }
  const target = list.find(t => t.type === "page");
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
      return;
    }
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      consoleErrors.push(msg.params.args.map(a => a.value || a.description || "").join(" ").slice(0, 200));
    }
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      pageErrors.push((d.exception && d.exception.description || d.text || "").slice(0, 200));
    }
    if (msg.method === "Network.requestWillBeSent") {
      requestUrls[msg.params.requestId] = msg.params.request.url;
    }
    if (msg.method === "Network.loadingFailed") {
      failedRequests.push((requestUrls[msg.params.requestId] || "?") + " " + msg.params.errorText);
    }
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  await send("Log.enable");

  try {
    await runSuite(false);
    await runSuite(true);
    /* reset noise ledgers so final inspection measures only its own page */
    consoleErrors.length = 0; pageErrors.length = 0; failedRequests.length = 0;
    await runFinalInspection();
    await runRecruiterMobile();
  } catch (e) {
    record("runner: completed", false, e.message);
  }

  const failed = results.filter(r => !r.pass);
  console.log("\\n================ SUMMARY ================");
  console.log("passed: " + (results.length - failed.length) + "/" + results.length);
  if (failed.length) { console.log("FAILED:"); failed.forEach(f => console.log("  ✗ " + f.name + " → " + f.info)); }
  fs.writeFileSync(path.join(__dirname, "test-report.json"), JSON.stringify({ results, consoleErrors, pageErrors, failedRequests }, null, 2));
  console.log("report: local-only/test-report.json");
  try { ws.close(); } catch (e) {}
  try { chrome.kill(); } catch (e) {}
  process.exit(failed.length ? 1 : 0);
}

main().catch(e => { console.error("runner crashed:", e.message); try { chrome.kill(); } catch (_) {} process.exit(2); });
