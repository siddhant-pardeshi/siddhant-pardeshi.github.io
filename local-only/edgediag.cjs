/* Edge probe: drag×open-menu, resize-after-park, axe on scrollable menu. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-edge-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9347", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
    try { list = await (await fetch("http://127.0.0.1:9347/json/list")).json(); if (list.length) break; } catch (e) {}
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
  const opts = (x, y) => ({ bubbles: true, clientX: x, clientY: y, pointerId: 1, button: 0 });

  /* 1: drag while the menu is open — what happens to the menu? */
  const r1 = await send("Runtime.evaluate", {
    expression: `(async () => {
      const dock = document.getElementById('byte-dock');
      document.getElementById('builds').scrollIntoView();
      await new Promise(r => setTimeout(r, 500));
      document.querySelector('.byte-dock__btn').click();
      await new Promise(r => setTimeout(r, 300));
      const menuOpenBefore = document.getElementById('byte-menu').open;
      dock.dispatchEvent(new PointerEvent('pointerdown', opts(1200, 800)));
      dock.dispatchEvent(new PointerEvent('pointermove', opts(1260, 800)));
      dock.dispatchEvent(new PointerEvent('pointermove', opts(700, 400)));
      dock.dispatchEvent(new PointerEvent('pointerup', opts(700, 400)));
      await new Promise(r => setTimeout(r, 250));
      return JSON.stringify({ menuOpenBefore, menuOpenAfterDrag: document.getElementById('byte-menu').open,
        dockMoved: Math.abs(dock.getBoundingClientRect().left - 1200) > 50 });
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log("drag×openMenu:", r1.result.value);
  await send("Runtime.evaluate", { expression: `document.querySelectorAll('dialog[open]').forEach(d=>d.close())` });

  /* 2: park near the bottom, then shrink the viewport — does Byte stay visible? */
  const r2 = await send("Runtime.evaluate", {
    expression: `(async () => {
      const dock = document.getElementById('byte-dock');
      dock.dispatchEvent(new PointerEvent('pointerdown', opts(640, 830)));
      dock.dispatchEvent(new PointerEvent('pointermove', opts(640, 850)));
      dock.dispatchEvent(new PointerEvent('pointerup', opts(640, 850)));
      await new Promise(r => setTimeout(r, 150));
      const parkedTop = Math.round(dock.getBoundingClientRect().top);
      window.resizeTo(1280, 500); /* no-op for pages, emulate instead below */
      return 'parkedTop=' + parkedTop + ' vh=' + window.innerHeight;
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log("park:", r2.result.value);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 500, deviceScaleFactor: 1, mobile: false });
  await sleep(300);
  const r3 = await send("Runtime.evaluate", {
    expression: `(() => {
      const dock = document.getElementById('byte-dock');
      const r = dock.getBoundingClientRect();
      return JSON.stringify({ afterResizeTop: Math.round(r.top), afterResizeBottom: Math.round(r.bottom), vh: window.innerHeight,
        visible: r.top >= 0 && r.bottom <= window.innerHeight });
    })()`,
    returnByValue: true
  });
  console.log("after shrink:", r3.result.value);
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  /* 3: axe on the scrollable menu state */
  await send("Runtime.evaluate", { expression: `document.querySelector('.byte-dock__btn').click()` });
  await sleep(350);
  const r4 = await send("Runtime.evaluate", {
    expression: `(async () => {
      const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return JSON.stringify(r.violations.map(v => ({ id: v.id, n: v.nodes.length })));
    })()`,
    returnByValue: true, awaitPromise: true
  });
  console.log("axe (menu open):", r4.result.value);
  await send("Runtime.evaluate", { expression: `document.querySelectorAll('dialog[open]').forEach(d=>d.close())` });
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("EDGE FAIL:", e.message); process.exit(1); });
