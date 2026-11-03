/* Settled-geometry check: force-reveal all gallery tiles at 390px, measure every class. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-v-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9336", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
let id = 0; const pending = new Map(); let ws;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const send = (m, p = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { resolve: res, reject: rej });
  ws.send(JSON.stringify({ id: i, method: m, params: p }));
});
(async () => {
  let list;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try { list = await (await fetch("http://127.0.0.1:9336/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: "http://localhost:8137/index.html" });
  await sleep(2200);
  const evalExpr = `(function () {
    const tiles = document.querySelectorAll('#gallery .sheet-item');
    tiles.forEach(function (t) { t.classList.add('is-in'); });
    const el = document.getElementById('gallery');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'instant' });
    return tiles.length;
  })()`;
  const n = await send("Runtime.evaluate", { expression: evalExpr, returnByValue: true });
  await sleep(1000);
  const r = await send("Runtime.evaluate", {
    expression: `(function () {
      const tiles = Array.from(document.querySelectorAll('#gallery .sheet-item'));
      const w = tiles.filter(t => t.classList.contains('sheet-item--wide')).map(t => Math.round(t.getBoundingClientRect().width));
      const nrm = tiles.filter(t => !t.classList.contains('sheet-item--wide') && !t.classList.contains('sheet-item--tall')).map(t => Math.round(t.getBoundingClientRect().width));
      const tl = tiles.filter(t => t.classList.contains('sheet-item--tall')).map(t => Math.round(t.getBoundingClientRect().width));
      const allVisible = tiles.every(t => getComputedStyle(t).opacity === '1');
      return { wideMin: Math.min.apply(null, w), wideMax: Math.max.apply(null, w),
               normalMin: Math.min.apply(null, nrm), normalMax: Math.max.apply(null, nrm),
               tallMin: Math.min.apply(null, tl), tallMax: Math.max.apply(null, tl),
               allVisible: allVisible };
    })()`,
    returnByValue: true
  });
  console.log(JSON.stringify(r.result.value));
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(process.argv[2] || "local-only/shot-gal-final.png", Buffer.from(shot.data, "base64"));
  console.log("shot saved");
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
