/* Quick mobile-overflow diagnostic via CDP. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-diag-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9334", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
  for (let i = 0; i < 30; i++) { await sleep(250); try { list = await (await fetch("http://127.0.0.1:9334/json/list")).json(); if (list.length) break; } catch (e) {} }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.navigate", { url: "http://localhost:8137/index.html" });
  await sleep(2500);
  if (process.argv[3]) {
    await send("Runtime.evaluate", { expression: `(() => { const el = document.getElementById('${process.argv[3]}'); const y = el.getBoundingClientRect().top + window.scrollY - 60; window.scrollTo({ top: y, behavior: 'instant' }); })()` });
    await sleep(1200);
  }
  const r = await send("Runtime.evaluate", { expression: `(() => {
    const d = document.documentElement;
    const wide = [...document.querySelectorAll('*')]
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(x => x.r.right > d.clientWidth + 1)
      .map(x => ({
        tag: x.el.tagName,
        cls: String((x.el.className && x.el.className.baseVal !== undefined) ? x.el.className.baseVal : x.el.className).slice(0, 48),
        right: Math.round(x.r.right),
        clipped: (() => { let p = x.el.parentElement; while (p) { const o = getComputedStyle(p).overflow; if (o === 'hidden' || o === 'clip') return true; p = p.parentElement; } return false; })()
      }))
      .filter(x => !x.clipped)
      .slice(0, 12);
    return { sw: d.scrollWidth, cw: d.clientWidth, wide };
  })()`, returnByValue: true });
  console.log(JSON.stringify(r.result.value, null, 1));
  if (process.argv[2]) {
    const shot = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(process.argv[2], Buffer.from(shot.data, "base64"));
    console.log("saved", process.argv[2]);
  }
  ws.close(); chrome.kill(); process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
