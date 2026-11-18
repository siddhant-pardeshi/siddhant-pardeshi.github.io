/* axe audit of OPEN states: byte menu, settings, palette, lightbox, mobile menu. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-ax2-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9344", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
let id = 0; const pending = new Map(); let ws;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const send = (m, p = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { resolve: res, reject: rej });
  ws.send(JSON.stringify({ id: i, method: m, params: p }));
});
async function runAxe(label) {
  const res = await send("Runtime.evaluate", {
    expression: `(async () => {
      const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return JSON.stringify(r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length,
        s: v.nodes.slice(0, 2).map(n => n.target.join('>')) })));
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log("== " + label + " ==");
  console.log(res.result.value);
}
(async () => {
  let list;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try { list = await (await fetch("http://127.0.0.1:9344/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: "http://localhost:8137/index.html" });
  await sleep(2400);
  await send("Runtime.evaluate", {
    expression: `(async () => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
      document.head.appendChild(s);
      await new Promise(r => { s.onload = r; s.onerror = r; });
      return typeof window.axe;
    })()`,
    returnByValue: true, awaitPromise: true
  });
  /* byte menu open */
  await send("Runtime.evaluate", { expression: `document.getElementById('byte-dock').hidden = false; document.querySelector('.byte-dock__btn').click();` });
  await sleep(400);
  await runAxe("byte menu open (1280x720)");
  await send("Runtime.evaluate", { expression: `document.getElementById('byte-menu').close()` });
  /* settings open */
  await send("Runtime.evaluate", { expression: `document.querySelector('[data-open-settings]').click()` });
  await sleep(400);
  await runAxe("settings open");
  await send("Runtime.evaluate", { expression: `document.getElementById('settings-dialog') && document.getElementById('settings-dialog').close(); document.querySelectorAll('dialog[open]').forEach(d=>d.close())` });
  /* palette open */
  await send("Runtime.evaluate", { expression: `document.querySelector('[data-open-palette]').click()` });
  await sleep(400);
  await runAxe("palette open");
  await send("Runtime.evaluate", { expression: `document.querySelectorAll('dialog[open]').forEach(d=>d.close())` });
  /* lightbox open */
  await send("Runtime.evaluate", { expression: `document.querySelector('[data-open-photo]').click()` });
  await sleep(500);
  await runAxe("lightbox open");
  await send("Runtime.evaluate", { expression: `document.querySelectorAll('dialog[open]').forEach(d=>d.close())` });
  /* mobile: menu open */
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(400);
  await send("Runtime.evaluate", { expression: `document.querySelector('.nav-toggle').click()` });
  await sleep(400);
  await runAxe("mobile menu open (390)");
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("AXE2 FAIL:", e.message); process.exit(1); });
