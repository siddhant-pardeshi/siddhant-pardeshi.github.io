/* Focused probe: why is roam blocked + what's the real Paytm tile count? */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-probe-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9341", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
    try { list = await (await fetch("http://127.0.0.1:9341/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:8137/index.html" });
  await sleep(2000);
  const probe = await send("Runtime.evaluate", { expression: `(async () => {
    const out = {};
    out.hidden = document.hidden;
    out.visibility = document.visibilityState;
    out.dialogs = document.querySelectorAll('dialog[open]').length;
    const dock = document.getElementById('byte-dock');
    document.getElementById('builds').scrollIntoView();
    await new Promise(r => setTimeout(r, 700));
    out.dockHidden = dock.hidden;
    out.dockW = Math.round(dock.getBoundingClientRect().width);
    out.tiles = document.querySelectorAll('.sheet-item').length;
    out.paytm = [...document.querySelectorAll('.sheet-item figcaption')].filter(c => c.textContent.includes('Paytm')).length;
    out.hasRoam = typeof window.Byte.roam;
    window.Byte.roam(true);
    await new Promise(r => setTimeout(r, 500));
    out.walkClass = dock.className;
    out.leftStyle = dock.style.left;
    out.transitionDur = dock.style.transitionDuration;
    window.Byte.roamStop();
    return JSON.stringify(out);
  })()`, returnByValue: true, awaitPromise: true });
  console.log(probe.result.value);
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("PROBE FAIL:", e.message); process.exit(1); });
