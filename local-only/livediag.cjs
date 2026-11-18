/* Emotion verification against PRODUCTION — what a real visitor sees. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-live-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9346", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
    try { list = await (await fetch("http://127.0.0.1:9346/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: "https://siddhant-pardeshi.github.io/" });
  await sleep(3200);
  /* 1: served assets check from within the live page */
  const assets = await send("Runtime.evaluate", {
    expression: `(async () => {
      const [js, css] = await Promise.all([
        fetch('js/byte.js?v=9').then(r => r.text()),
        fetch('css/byte.css?v=9').then(r => r.text())
      ]);
      return JSON.stringify({
        jsHasEmote: js.includes('emote: function'),
        jsHasDefaultOn: js.includes('!== "off"'),
        jsHasRoam: js.includes('startRoam'),
        cssHasAngry: css.includes('byte--angry'),
        cssHasHyped: css.includes('byte--hyped'),
        cssHasSteam: css.includes('byte-steam'),
        menuBtns: document.querySelectorAll('[data-byte-action]').length,
        emotionBtns: [...document.querySelectorAll('[data-byte-action]')].filter(b => ['happy','angry','curious','hyped'].includes(b.dataset.byteAction)).length
      });
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log("SERVED ASSETS:", assets.result.value);
  /* 2: trigger each emote on the live page and verify class + capture */
  for (const emo of ["angry", "hyped"]) {
    const r = await send("Runtime.evaluate", {
      expression: `(async () => {
        if (typeof window.Byte === 'undefined' || typeof window.Byte.emote !== 'function') return 'NO EMOTE API';
        window.Byte.emote("${emo}");
        await new Promise(r2 => setTimeout(r2, 200));
        const inst = document.querySelector('.byte-instance');
        const cs = getComputedStyle(document.querySelector('.byte-eyes-g') || inst);
        return JSON.stringify({ cls: inst.className.includes('byte--${emo}'),
          steamShown: getComputedStyle(document.querySelector('.byte-steam') || inst).opacity });
      })()`,
      returnByValue: true, awaitPromise: true
    });
    console.log("emote " + emo + ":", r.result.value);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync("local-only/live-emo-" + emo + ".png", Buffer.from(shot.data, "base64"));
  }
  /* 3: open the menu and measure what's visible WITHOUT scrolling */
  const menu = await send("Runtime.evaluate", {
    expression: `(async () => {
      document.querySelectorAll('dialog[open]').forEach(d => d.close());
      document.getElementById('builds').scrollIntoView();
      await new Promise(r => setTimeout(r, 600));
      const dock = document.getElementById('byte-dock');
      if (dock.hidden) return 'dock hidden';
      document.querySelector('.byte-dock__btn').click();
      await new Promise(r => setTimeout(r, 350));
      const card = document.querySelector('.byte-menu__card');
      const cr = card.getBoundingClientRect();
      const emoBtns = [...card.querySelectorAll('[data-byte-action]')].filter(b => ['happy','angry','curious','hyped'].includes(b.dataset.byteAction));
      const vis = emoBtns.filter(b => { const br = b.getBoundingClientRect(); return br.top >= 0 && br.bottom <= window.innerHeight; }).length;
      return JSON.stringify({ vh: window.innerHeight, top: Math.round(cr.top), bottom: Math.round(cr.bottom),
        emotionBtns: emoBtns.length, visibleWithoutScroll: vis });
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log("MENU GEOMETRY:", menu.result.value);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("local-only/live-menu.png", Buffer.from(shot.data, "base64"));
  console.log("screenshots saved");
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("LIVE FAIL:", e.message); process.exit(1); });
