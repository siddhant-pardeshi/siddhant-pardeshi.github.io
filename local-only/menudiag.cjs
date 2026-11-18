/* Measure byte-menu geometry at several viewport heights — find the off-screen cutoff. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-menu-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9345", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
    try { list = await (await fetch("http://127.0.0.1:9345/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:8137/index.html" });
  await sleep(2200);
  for (const h of [720, 650, 560]) {
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: h, deviceScaleFactor: 1, mobile: false });
    await sleep(300);
    const r = await send("Runtime.evaluate", {
      expression: `(async () => {
        document.querySelectorAll('dialog[open]').forEach(d => d.close());
        document.getElementById('byte-dock').hidden = false;
        document.querySelector('.byte-dock__btn').click();
        await new Promise(r => setTimeout(r, 250));
        const card = document.querySelector('.byte-menu__card');
        const cr = card.getBoundingClientRect();
        const btns = [...card.querySelectorAll('.byte-menu__list button')];
        const offscreen = btns.filter(b => { const br = b.getBoundingClientRect(); return br.top < 0 || br.bottom > window.innerHeight; });
        return JSON.stringify({ vh: window.innerHeight, cardTop: Math.round(cr.top), cardBottom: Math.round(cr.bottom), cardH: Math.round(cr.height), btns: btns.length, offscreen: offscreen.length, first: offscreen[0] ? offscreen[0].textContent.trim().slice(0, 30) : null });
      })()`,
      returnByValue: true, awaitPromise: true
    });
    console.log("h=" + h + " → " + r.result.value);
    await send("Runtime.evaluate", { expression: `document.getElementById('byte-menu').close()` });
    await sleep(150);
  }
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("MENU FAIL:", e.message); process.exit(1); });
