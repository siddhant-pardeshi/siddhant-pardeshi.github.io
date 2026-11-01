/* Headless screenshot helper — finds Chrome/Edge, captures page regions. */
const { spawn } = require("child_process");
const fs = require("fs");

const candidates = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe"
];
let chrome = null;
for (const c of candidates) {
  try { if (fs.existsSync(c)) { chrome = c; break; } } catch (e) {}
}
if (!chrome) { console.log("NO_BROWSER_FOUND"); process.exit(0); }
console.log("using", chrome);

const url = process.argv[2] || "http://localhost:8137/index.html";
const out = process.argv[3] || "C:/Users/siddh/Desktop/Portfolio_Website/local-only/shot.png";
const w = process.argv[4] || "1440";
const h = process.argv[5] || "900";

const p = spawn(chrome, [
  "--headless=new", "--disable-gpu",
  "--user-data-dir=" + require("os").tmpdir() + "/sp-shot-" + Date.now(),
  "--force-prefers-reduced-motion",
  "--window-size=" + w + "," + h,
  "--screenshot=" + out,
  "--virtual-time-budget=9000",
  "--hide-scrollbars",
  url
], { stdio: "ignore" });
const killer = setTimeout(() => { try { p.kill(); } catch (e) {} }, 25000);
p.on("close", () => {
  clearTimeout(killer);
  try { console.log("shot:", fs.existsSync(out), fs.statSync(out).size, "bytes"); }
  catch (e) { console.log("no shot"); }
});
