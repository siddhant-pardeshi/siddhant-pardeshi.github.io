/* axe-core accessibility audit on desktop 1440 + mobile 390. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-axe-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9343", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
    try { list = await (await fetch("http://127.0.0.1:9343/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:8137/index.html" });
  await sleep(2400);
  // load axe from CDN inside the page
  await send("Runtime.evaluate", {
    expression: `(async () => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
      document.head.appendChild(s);
      await new Promise(r => { s.onload = r; s.onerror = r; });
      return typeof window.axe;
    })()`,
    returnByValue: true, awaitPromise: true
  }).then(r => console.log("axe loaded:", r.result.value));
  const res = await send("Runtime.evaluate", {
    expression: `(async () => {
      const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return JSON.stringify(r.violations.map(v => ({
        id: v.id, impact: v.impact, nodes: v.nodes.length,
        sample: v.nodes.slice(0, 3).map(n => n.target.join('>') + (n.failureSummary ? ' :: ' + n.failureSummary.split('\\n')[0] : ''))
      })));
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log(res.result.value);
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("AXE FAIL:", e.message); process.exit(1); });
