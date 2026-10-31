/* ============================================================
   RECRUITER VIEW — lenses, skills list, post shortcuts, copy link.
   Deliberately calm: no mascot, no decorative motion.
   ============================================================ */

(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
    return isNaN(d) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function initLenses() {
    var body = document.body;
    var buttons = document.querySelectorAll("[data-lens-choice]");
    var blocks = document.querySelectorAll(".rv-block[data-lens]");
    function apply(lens) {
      body.dataset.lens = lens;
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lensChoice === lens ? "true" : "false"); });
      blocks.forEach(function (blk) {
        var tags = (blk.dataset.lens || "all").split(/\s+/);
        if (lens === "all" || tags.indexOf("all") >= 0) {
          blk.classList.remove("lens-dim", "lens-hit");
        } else if (tags.indexOf(lens) >= 0) {
          blk.classList.remove("lens-dim");
          blk.classList.add("lens-hit");
        } else {
          blk.classList.add("lens-dim");
          blk.classList.remove("lens-hit");
        }
      });
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { apply(b.dataset.lensChoice); });
    });
    apply("all");
  }

  function renderSkills() {
    var el = document.getElementById("rv-skills");
    if (!el || !window.CONTENT) return;
    window.CONTENT.skillGroups.forEach(function (g) {
      var div = document.createElement("div");
      div.innerHTML = "<dt>" + esc(g.label) + "</dt><dd>" + g.skills.map(function (s) { return esc(s.name); }).join(" · ") + "</dd>";
      el.appendChild(div);
    });
  }

  function renderPostShortcuts() {
    var C = window.CONTENT;
    var cfg = C.postsConfig;
    var posts = (cfg.posts || []).filter(function (p) { return p && p.url && p.title; });
    if (!posts.length) return;
    var section = document.getElementById("rv-posts");
    var grid = document.getElementById("rv-post-cards");
    if (!section || !grid) return;

    var featured = cfg.featuredPostId ? posts.find(function (p) { return p.id === cfg.featuredPostId; }) : null;
    if (!featured) featured = posts.slice().sort(function (a, b) { return (a.featuredRank || 99) - (b.featuredRank || 99); })[0];
    var latest = cfg.latestPostId ? posts.find(function (p) { return p.id === cfg.latestPostId; }) : null;
    if (!latest) {
      var wd = posts.filter(function (p) { return p.publishedAt; });
      if (wd.length) latest = wd.sort(function (a, b) { return new Date(b.publishedAt) - new Date(a.publishedAt); })[0];
    }

    function card(p, tag) {
      var a = document.createElement("a");
      a.className = "rv-card";
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.style.textDecoration = "none";
      a.innerHTML = "<h3>" + esc(tag) + "</h3><p class='sub'>" + esc(p.title) + (p.publishedAt ? " · " + esc(fmtDate(p.publishedAt)) : "") + " · Read on LinkedIn ↗</p>";
      return a;
    }
    section.hidden = false;
    grid.appendChild(card(featured, "Top post"));
    if (latest && latest !== featured) grid.appendChild(card(latest, "Latest post"));
  }

  function initCopyLink() {
    var btn = document.querySelector("[data-copy-link]");
    if (!btn || !window.appCopy) return;
    btn.addEventListener("click", function () {
      window.appCopy(location.href, "Recruiter view link copied.");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLenses();
    renderSkills();
    renderPostShortcuts();
    initCopyLink();
  });
})();
