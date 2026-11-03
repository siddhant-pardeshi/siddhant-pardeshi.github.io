/* Static cross-file consistency audit — no browser needed. */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
let fails = 0;
function check(name, pass, info) {
  console.log((pass ? "  ✓ " : "  ✗ ") + name + (pass ? "" : "  → " + info));
  if (!pass) fails++;
}
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

const index = read("index.html");
const recruiter = read("recruiter.html");
const content = read("js/content.js");
const appjs = read("js/app.js");
const readme = read("README.md");

/* 1. every js/css file referenced by the pages exists (query strings stripped) */
for (const [page, html] of [["index.html", index], ["recruiter.html", recruiter]]) {
  const refs = [...html.matchAll(/(?:src|href)="((?:js|css|assets)\/[^"]+)"/g)].map(m => m[1].split("?")[0]);
  const missing = [...new Set(refs)].filter(f => !fs.existsSync(path.join(ROOT, f)));
  check(page + ": all local js/css/asset refs exist", missing.length === 0, missing.join(", ") || "ok");
}

/* 2. every anchor href has a target id (same page) */
const ids = new Set([...index.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
const anchors = [...index.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
const badAnchors = anchors.filter(a => !ids.has(a));
check("index.html: all #" + "anchors resolve", badAnchors.length === 0, badAnchors.join(", ") || "ok");

/* 3. every data-byte-action is handled (switch case or explicit guard) */
const actions = [...index.matchAll(/data-byte-action="([^"]+)"/g)].map(m => m[1]);
const uniqActions = [...new Set(actions)];
const missingCases = uniqActions.filter(a => !appjs.includes(`case "${a}"`) && !appjs.includes(`act === "${a}"`));
check("byte menu: every action has a handler", missingCases.length === 0, missingCases.join(", ") || "ok");

/* 4. data-open-photo ids exist in galleryItems */
const photoIds = [...index.matchAll(/data-open-photo="([^"]+)"/g)].map(m => m[1]);
const missingPhotos = photoIds.filter(id => !content.includes(`id: "${id}"`));
check("hero deck: lightbox targets exist in content", missingPhotos.length === 0, missingPhotos.join(", ") || "ok");

/* 5. content gallery srcs exist + no orphans (images/videos) */
global.window = {};
eval(content);
const items = window.CONTENT.galleryItems;
const seen = new Set();
const missingSrc = [];
items.forEach(i => { if (i.src) { if (!fs.existsSync(path.join(ROOT, i.src))) missingSrc.push(i.src); seen.add(i.src); } });
const media = [];
(function walk(d) { fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = d + "/" + e.name; e.isDirectory() ? walk(p) : media.push(p); }); })("assets");
const orphans = media.filter(f => /\.(jpg|jpeg|mp4)$/i.test(f) && !seen.has(f) && !f.includes("og-image"));
check("gallery: all " + items.length + " srcs exist on disk", missingSrc.length === 0, missingSrc.join(", ") || "ok");
check("gallery: zero orphan media files", orphans.length === 0, orphans.join(", ") || "ok");

/* 6. moreProjects URLs + counts */
check("more builds: 7 records", window.CONTENT.moreProjects.length === 7, String(window.CONTENT.moreProjects.length));
const badUrls = window.CONTENT.moreProjects.filter(p => !/^https:\/\/github\.com\/siddhant-pardeshi\//.test(p.url));
check("more builds: all URLs are owner repos", badUrls.length === 0, badUrls.map(p => p.url).join(", ") || "ok");

/* 7. README-referenced artwork exists */
const art = [...readme.matchAll(/\((readme\/[^)]+\.svg)\)/g)].map(m => m[1]);
const missingArt = [...new Set(art)].filter(f => !fs.existsSync(path.join(ROOT, f)));
check("README: all animated artworks exist", missingArt.length === 0, missingArt.join(", ") || "ok (" + new Set(art).size + " unique)");

/* 8. sound UI wiring: every control surface present */
check("sound: nav quick toggle present", index.includes("data-sound-quick"));
check("sound: settings toggle present", index.includes("data-sound-toggle"));
check("sound: byte-menu label present", index.includes("data-sound-label"));
check("sound: quick toggle wired in app.js", appjs.includes("initSoundQuick"));

/* 9. sections + palette coverage */
check("sections: #builds exists in page + palette", ids.has("builds") && appjs.includes('"#builds"'));

/* 10. script load order sanity (content before everything) */
const order = [...index.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1].split("?")[0]);
check("load order: content.js first", order[0] === "js/content.js", order.join(" -> "));
check("load order: app.js last", order[order.length - 1] === "js/app.js", order.join(" -> "));

/* 11. no stray tokens/secrets in repo files */
const secretScan = [index, recruiter, content, appjs, read("js/byte.js")].join("\n");
const leaks = secretScan.match(/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/);
check("security: no tokens in client files", !leaks, leaks ? "LEAK FOUND" : "ok");

console.log(fails === 0 ? "\nCONSISTENCY: ALL GREEN" : "\nCONSISTENCY: " + fails + " FAILURES");
process.exit(fails ? 1 : 0);
