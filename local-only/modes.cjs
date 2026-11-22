/* Visual acceptance: capture Thunder (mid-strike) and Hearts. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-modes-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9354", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
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
    try { list = await (await fetch("http://127.0.0.1:9354/json/list")).json(); if (list.length) break; } catch (e) {}
  }
  ws = new WebSocket(list.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url: "http://localhost:8137/index.html?handfx-test=1" });
  await sleep(2400);
  await send("Runtime.evaluate", { expression: `window.HandFX.open()` });
  await sleep(1200);
  /* thunder: switch + fire a strike via fist edge */
  await send("Runtime.evaluate", { expression: `window.HandFX._engine.setMode(4)` });
  await sleep(600);
  const s1 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("local-only/shot-mode-thunder.png", Buffer.from(s1.data, "base64"));
  console.log("thunder saved");
  /* hearts */
  await send("Runtime.evaluate", { expression: `window.HandFX._engine.setMode(5)` });
  await sleep(2000);
  const s2 = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("local-only/shot-mode-hearts.png", Buffer.from(s2.data, "base64"));
  console.log("hearts saved");
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("MODES FAIL:", e.message); process.exit(1); });
