/* Visual acceptance: capture each new bold emotion + a mid-stride walk. */
const { spawn } = require("child_process");
const fs = require("fs"), os = require("os"), path = require("path");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sp-emo-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9342", "--user-data-dir=" + profile, "about:blank"], { stdio: "ignore" });
let id = 0; const pending = new Map(); let ws;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const send = (m, p = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { resolve: res, reject: rej });
  ws.send(JSON.stringify({ id: i, method: m, params: p }));
});
async function shot(name) {
  const s = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("local-only/shot-emo-" + name + ".png", Buffer.from(s.data, "base64"));
  console.log("saved " + name);
}
(async () => {
  let list;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try { list = await (await fetch("http://127.0.0.1:9342/json/list")).json(); if (list.length) break; } catch (e) {}
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
  for (const emo of ["angry", "hyped", "curious", "happy"]) {
    await send("Runtime.evaluate", { expression: `window.Byte.emote("${emo}")` });
    await sleep(420);
    await shot(emo);
  }
  /* walk: scroll down so the dock appears, then stroll */
  await send("Runtime.evaluate", { expression: `document.getElementById('builds').scrollIntoView()` });
  await sleep(700);
  await send("Runtime.evaluate", { expression: `window.Byte.roam(true)` });
  await sleep(1100);
  await shot("walk");
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error("EMO FAIL:", e.message); process.exit(1); });
