/* Reproduce: mobile 390 — scroll to #gallery, inspect reveal state + grid layout. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-gal-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9335", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
let id = 0; const pending = new Map(); let ws;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const i = ++id; pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}
async function main() {
  let list;
  for (let i = 0; i < 30; i++) { await sleep(250); try { list = await (await fetch("http://127.0.0.1:9335/json/list")).json(); if (list.length) break; } catch (e) {} }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: "http://localhost:8137/index.html" });
  await sleep(2200);
  const r = await send("Runtime.evaluate", { expression: `(() => {
    const el = document.getElementById('gallery');
    const y = el.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: 'instant' });
    return y;
  })()`, returnByValue: true });
  await sleep(1500);
  const diag = await send("Runtime.evaluate", { expression: `(() => {
    const head = document.querySelector('#gallery .section-head');
    const sheet = document.querySelector('.contact-sheet');
    const tiles = [...document.querySelectorAll('#gallery .sheet-item')];
    const wide = tiles.filter(t => t.classList.contains('sheet-item--wide'));
    const first = tiles[0];
    return {
      headRevealed: head.classList.contains('is-revealed'),
      headOpacity: getComputedStyle(head).opacity,
      headWordsHidden: !!document.querySelector('#gallery .section-head .word') && getComputedStyle(document.querySelector('#gallery .section-head .word')).transform !== 'none',
      tiles: tiles.length,
      tilesIn: tiles.filter(t => t.classList.contains('is-in')).length,
      firstTileOpacity: first ? getComputedStyle(first).opacity : null,
      sheetW: Math.round(sheet.getBoundingClientRect().width),
      sheetScrollW: sheet.scrollWidth,
      wideCount: wide.length,
      firstWideW: wide[0] ? Math.round(wide[0].getBoundingClientRect().width) : null,
      normalW: tiles.filter(t => !t.classList.contains('sheet-item--wide'))[0] ? Math.round(tiles.filter(t => !t.classList.contains('sheet-item--wide'))[0].getBoundingClientRect().width) : null,
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      imgsLoaded: tiles.filter(t => { const i = t.querySelector('img.ph'); return i && i.complete && i.naturalWidth > 0; }).length
    };
  })()`, returnByValue: true });
  console.log(JSON.stringify(diag.result.value, null, 1));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(process.argv[2] || "local-only/shot-gal-m.png", Buffer.from(shot.data, "base64"));
  console.log("screenshot saved");
  ws.close(); chrome.kill(); process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
