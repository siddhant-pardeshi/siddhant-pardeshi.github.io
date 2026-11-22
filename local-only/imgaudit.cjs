/* Image audit against PRODUCTION: every <img> + CSS/failed requests + README images. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-img-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9355", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
    try { list = await (await fetch("http://127.0.0.1:9355/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable"); await send("Network.enable");
  const failed = [];
  ws.onmessage = wrap(ws.onmessage);
  function wrap(prev) {
    return ev => {
      const m = JSON.parse(ev.data);
      if (m.method === "Network.loadingFailed") failed.push(m.params.errorText + " " + (m.params.blockedReason || ""));
      if (m.method === "Network.responseReceived") {
        const s = m.params.response.status;
        if (s >= 400 && /\.(jpg|jpeg|png|svg|webp|gif)(\?|$)/i.test(m.params.response.url)) failed.push("HTTP " + s + " " + m.params.response.url);
      }
      prev(ev);
    };
  }
  await send("Page.navigate", { url: "https://siddhant-pardeshi.github.io/" });
  await sleep(6000);
  const r = await send("Runtime.evaluate", {
    expression: `(async () => {
      const imgs = [...document.querySelectorAll('img')];
      const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'));
      const unloaded = imgs.filter(i => !i.complete).length;
      /* also probe every gallery src from CONTENT */
      const missing = [];
      if (window.CONTENT) {
        const probe = u => fetch(u, { method: 'HEAD' }).then(r2 => { if (!r2.ok) missing.push(r2.status + ' ' + u); }).catch(() => missing.push('ERR ' + u));
        const srcs = window.CONTENT.galleryItems.map(g => g.src).filter(Boolean);
        await Promise.all(srcs.map(probe));
        await probe('assets/og-image.png');
        await probe('assets/resume/Siddhant_Pardeshi_General_Resume.pdf');
      }
      return JSON.stringify({ total: imgs.length, broken: broken, unloaded: unloaded, missing: missing });
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log("PAGE:", r.result.value);
  console.log("network failures:", JSON.stringify(failed));
  /* README images */
  for (const u of ["https://siddhant-pardeshi.github.io/readme/banner.svg", "https://siddhant-pardeshi.github.io/readme/byte-emotions.svg", "https://siddhant-pardeshi.github.io/readme/handfx.svg", "https://siddhant-pardeshi.github.io/readme/sim-transfer.svg", "https://siddhant-pardeshi.github.io/readme/footer.svg"]) {
    const s = await fetch(u).then(x => x.status).catch(() => "ERR");
    console.log(u.split("/").pop() + ": " + s);
  }
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("IMG FAIL:", e.message); process.exit(1); });
