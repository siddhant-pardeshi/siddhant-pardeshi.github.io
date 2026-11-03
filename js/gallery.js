/* ============================================================
   GALLERY — owner-editable contact sheet.
   - Photos render from content.galleryItems records
   - Missing photos render as designed abstract illustrations
     based on real achievements (never fake photos)
   - Accessible lightbox: focus trap, Esc, arrows, swipe
   ============================================================ */

(function () {
  "use strict";

  var ACCENTS = {
    lime: { main: "#D9FF43", soft: "#EFFFC0" },
    violet: { main: "#4B57FF", soft: "#DDE0FF" },
    apricot: { main: "#FFA86B", soft: "#FFE3CC" }
  };

  /* Abstract, clearly-illustrative placeholder compositions */
  function placeholderSVG(item, w, h) {
    var a = ACCENTS[item.placeholder.accent] || ACCENTS.lime;
    var motif = item.placeholder.motif;
    var ink = "#101114";
    var paper = "#F0EDE3";
    var parts = [];
    var W = w || 400, H = h || 300;
    parts.push('<svg class="ph" viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(item.alt) + '" preserveAspectRatio="xMidYMid slice">');
    parts.push('<rect width="' + W + '" height="' + H + '" fill="' + paper + '"/>');
    /* shared diagram texture */
    parts.push('<g stroke="' + ink + '" stroke-opacity="0.14" stroke-width="1.5" fill="none">');
    for (var gx = 0; gx <= W; gx += 40) parts.push('<path d="M' + gx + ',0 V' + H + '"/>');
    for (var gy = 0; gy <= H; gy += 40) parts.push('<path d="M0,' + gy + " H" + W + '"/>');
    parts.push("</g>");

    if (motif === "stage") {
      parts.push('<rect x="' + W * 0.18 + '" y="' + H * 0.28 + '" width="' + W * 0.64 + '" height="' + H * 0.4 + '" rx="14" fill="' + a.soft + '" stroke="' + ink + '" stroke-width="3"/>');
      parts.push('<path d="M' + W * 0.14 + "," + H * 0.78 + " L" + W * 0.5 + "," + H * 0.18 + " L" + W * 0.86 + "," + H * 0.78 + '" fill="none" stroke="' + a.main + '" stroke-width="5" stroke-linecap="round"/>');
      parts.push('<circle cx="' + W * 0.5 + '" cy="' + H * 0.18 + '" r="9" fill="' + a.main + '" stroke="' + ink + '" stroke-width="2.5"/>');
      parts.push('<text x="' + W * 0.5 + '" y="' + H * 0.55 + '" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="' + H * 0.14 + '" fill="' + ink + '">4th</text>');
    } else if (motif === "team") {
      var cx = W / 2, cy = H / 2;
      [[0.26, 0.3], [0.74, 0.3], [0.26, 0.72], [0.74, 0.72]].forEach(function (p, i) {
        parts.push('<path d="M' + cx + "," + cy + " L" + W * p[0] + "," + H * p[1] + '" stroke="' + ink + '" stroke-width="2" stroke-dasharray="5 5" fill="none"/>');
        parts.push('<rect x="' + (W * p[0] - 26) + '" y="' + (H * p[1] - 26) + '" width="52" height="52" rx="14" fill="' + (i % 2 ? a.soft : a.main) + '" stroke="' + ink + '" stroke-width="3"/>');
        parts.push('<circle cx="' + W * p[0] + '" cy="' + (H * p[1] - 8) + '" r="9" fill="' + ink + '"/>');
        parts.push('<path d="M' + (W * p[0] - 12) + "," + (H * p[1] + 14) + " a12,9 0 0 1 24,0" + '" fill="' + ink + '"/>');
      });
      parts.push('<rect x="' + (cx - 34) + '" y="' + (cy - 22) + '" width="68" height="44" rx="10" fill="' + ink + '"/>');
      parts.push('<text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="18" fill="' + a.main + '">&lt;/&gt;</text>');
    } else if (motif === "award") {
      parts.push('<circle cx="' + W * 0.5 + '" cy="' + H * 0.42 + '" r="' + H * 0.2 + '" fill="' + a.main + '" stroke="' + ink + '" stroke-width="3.5"/>');
      parts.push('<path d="M' + W * 0.5 + "," + (H * 0.42 - H * 0.13) + " l" + H * 0.045 + "," + H * 0.09 + " l" + H * 0.1 + ",0 l-" + H * 0.08 + "," + H * 0.07 + " l" + H * 0.03 + "," + H * 0.1 + " l-" + H * 0.095 + ",-" + H * 0.06 + " l-" + H * 0.095 + "," + H * 0.06 + " l" + H * 0.03 + ",-" + H * 0.1 + " l-" + H * 0.08 + ",-" + H * 0.07 + " l" + H * 0.1 + ",0 z" + '" fill="' + ink + '"/>');
      parts.push('<path d="M' + W * 0.42 + "," + (H * 0.6) + " L" + W * 0.38 + "," + H * 0.8 + " M" + W * 0.58 + "," + (H * 0.6) + " L" + W * 0.62 + "," + H * 0.8 + '" stroke="' + ink + '" stroke-width="4" stroke-linecap="round"/>');
    } else if (motif === "orbit") {
      parts.push('<circle cx="' + W * 0.5 + '" cy="' + H * 0.5 + '" r="' + H * 0.32 + '" fill="none" stroke="' + ink + '" stroke-width="2" stroke-dasharray="6 6"/>');
      parts.push('<circle cx="' + W * 0.5 + '" cy="' + H * 0.5 + '" r="' + H * 0.14 + '" fill="' + a.main + '" stroke="' + ink + '" stroke-width="3"/>');
      [[0.5, 0.18], [0.78, 0.42], [0.62, 0.82], [0.3, 0.7]].forEach(function (p, i) {
        parts.push('<rect x="' + (W * p[0] - 14) + '" y="' + (H * p[1] - 14) + '" width="28" height="28" rx="8" fill="' + (i % 2 ? a.soft : ink) + '" stroke="' + ink + '" stroke-width="2.5"/>');
      });
    } else if (motif === "monogram") {
      parts.push('<rect x="' + W * 0.2 + '" y="' + H * 0.14 + '" width="' + W * 0.6 + '" height="' + H * 0.72 + '" rx="20" fill="' + a.soft + '" stroke="' + ink + '" stroke-width="3.5" transform="rotate(-2 ' + W / 2 + " " + H / 2 + ')"/>');
      parts.push('<text x="' + W * 0.5 + '" y="' + H * 0.62 + '" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="' + H * 0.34 + '" fill="' + ink + '">SP</text>');
      parts.push('<circle cx="' + W * 0.79 + '" cy="' + H * 0.2 + '" r="10" fill="' + a.main + '" stroke="' + ink + '" stroke-width="2.5"/>');
    } else if (motif === "schema") {
      [[0.2, 0.26], [0.2, 0.74], [0.56, 0.5], [0.85, 0.22], [0.85, 0.78]].forEach(function (p, i) {
        parts.push('<rect x="' + (W * p[0] - 32) + '" y="' + (H * p[1] - 20) + '" width="64" height="40" rx="9" fill="' + (i === 2 ? a.main : "#fff") + '" stroke="' + ink + '" stroke-width="3"/>');
        parts.push('<path d="M' + (W * p[0] - 20) + "," + (H * p[1] + 2) + " h40" + '" stroke="' + ink + '" stroke-width="2" opacity="0.5"/>');
      });
      parts.push('<path d="M' + W * 0.2 + "," + H * 0.26 + " L" + W * 0.56 + "," + H * 0.5 + " L" + W * 0.2 + "," + H * 0.74 + ' M' + W * 0.56 + "," + H * 0.5 + " L" + W * 0.85 + "," + H * 0.22 + " M" + W * 0.56 + "," + H * 0.5 + " L" + W * 0.85 + "," + H * 0.78 + '" stroke="' + ink + '" stroke-width="2" stroke-dasharray="5 5" fill="none"/>');
    } else { /* flow */
      parts.push('<rect x="' + W * 0.08 + '" y="' + H * 0.4 + '" width="' + W * 0.22 + '" height="' + H * 0.22 + '" rx="10" fill="' + a.soft + '" stroke="' + ink + '" stroke-width="3"/>');
      parts.push('<rect x="' + W * 0.39 + '" y="' + H * 0.4 + '" width="' + W * 0.22 + '" height="' + H * 0.22 + '" rx="10" fill="' + a.main + '" stroke="' + ink + '" stroke-width="3"/>');
      parts.push('<rect x="' + W * 0.7 + '" y="' + H * 0.4 + '" width="' + W * 0.22 + '" height="' + H * 0.22 + '" rx="10" fill="' + a.soft + '" stroke="' + ink + '" stroke-width="3"/>');
      parts.push('<path d="M' + W * 0.3 + "," + H * 0.51 + " H" + W * 0.39 + " M" + W * 0.61 + "," + H * 0.51 + " H" + W * 0.7 + '" stroke="' + ink + '" stroke-width="3" marker-end="false"/>');
      parts.push('<path d="M' + (W * 0.335) + "," + (H * 0.47) + " l8,4 -8,4 z" + '" fill="' + ink + '"/>');
      parts.push('<path d="M' + (W * 0.655) + "," + (H * 0.47) + " l8,4 -8,4 z" + '" fill="' + ink + '"/>');
    }
    parts.push('<text x="12" y="' + (H - 12) + '" font-family="Space Grotesk, sans-serif" font-weight="600" font-size="10" letter-spacing="2" fill="' + ink + '" opacity="0.5">ILLUSTRATION · PHOTO COMING SOON</text>');
    parts.push("</svg>");
    return parts.join("");
  }

  function photoSVG(item, w, h) {
    /* kept for designed schematic placeholders (projects) */
    return placeholderSVG(item, w, h);
  }

  function videoTile(item) {
    return '<span class="video-tile" aria-hidden="true">'
      + '<span class="video-play">▶</span>'
      + '<span class="video-len">Video</span>'
      + "</span>";
  }

  function init() {
    var C = window.CONTENT;
    var root = document.getElementById("gallery-view");
    var lightbox = document.getElementById("lightbox");
    if (!root || !lightbox) return;

    var filtersEl = root.querySelector(".gallery-filters");
    var sheetEl = root.querySelector(".contact-sheet");
    var emptyNote = root.querySelector(".gallery-empty-note");

    var catsPresent = [];
    var catLabels = { hackathons: "Hackathons", team: "Team moments", events: "Tech events", hobby: "Treks & camping", projects: "Projects", certificates: "Certificates", portrait: "Portrait" };
    C.galleryItems.forEach(function (g) { if (catsPresent.indexOf(g.category) < 0) catsPresent.push(g.category); });

    var visibleCats = catsPresent.filter(function (c) { return C.galleryItems.some(function (g) { return g.category === c && g.src; }); });
    var allFilter = [{ id: "all", label: "All" }].concat(catsPresent.map(function (c) { return { id: c, label: catLabels[c] || c }; }));
    var active = "all";
    var shown = C.galleryItems.slice();

    allFilter.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn filter-btn--light";
      b.textContent = c.label;
      b.setAttribute("aria-pressed", c.id === "all" ? "true" : "false");
      b.addEventListener("click", function () {
        active = c.id;
        filtersEl.querySelectorAll(".filter-btn").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        render();
        if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("tick");
      });
      filtersEl.appendChild(b);
    });
    filtersEl.hidden = allFilter.length < 3;

    function tileFor(item) {
      var fig = document.createElement("button");
      fig.type = "button";
      fig.className = "sheet-item" + (item.size === "wide" ? " sheet-item--wide" : "") + (item.size === "tall" ? " sheet-item--tall" : "");
      fig.setAttribute("aria-haspopup", "dialog");
      fig.setAttribute("aria-label", "Open: " + item.caption);
      var media;
      if (item.video) {
        media = videoTile(item);
      } else if (item.src) {
        media = '<img class="ph" src="' + esc(item.src) + '" alt="' + esc(item.alt) + '" loading="lazy" decoding="async">';
      } else {
        media = placeholderSVG(item);
      }
      fig.innerHTML = media
        + "<figcaption><span>" + esc(item.caption) + '</span><span class="cat">' + esc(catLabels[item.category] || item.category) + "</span></figcaption>";
      fig.addEventListener("click", function () { openLightbox(item); });
      return fig;
    }

    function render() {
      sheetEl.innerHTML = "";
      shown = C.galleryItems.filter(function (g) { return active === "all" || g.category === active; });
      shown.forEach(function (item) { sheetEl.appendChild(tileFor(item)); });
      /* staggered entrance: cap the delay so long walls never wait */
      Array.prototype.forEach.call(sheetEl.children, function (tile, i) {
        tile.style.setProperty("--ti", Math.min(i, 14));
      });
      if ("IntersectionObserver" in window) {
        if (tileIO) tileIO.disconnect();
        tileIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.remove("pre");
              en.target.classList.add("is-in");
              tileIO.unobserve(en.target);
            }
          });
        }, { threshold: 0.05, rootMargin: "0px 0px 12% 0px" });
        Array.prototype.forEach.call(sheetEl.children, function (tile) {
          /* tiles already on screen render visible immediately — hiding is
             a JS-applied enhancement (.pre) for below-viewport tiles only */
          var r = tile.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) tile.classList.add("is-in");
          else { tile.classList.add("pre"); tileIO.observe(tile); }
        });
      } else {
        Array.prototype.forEach.call(sheetEl.children, function (tile) { tile.classList.add("is-in"); });
      }
      if (emptyNote) {
        var hasReal = C.galleryItems.some(function (g) { return g.src; });
        emptyNote.hidden = hasReal;
      }
    }
    var tileIO = null;

    /* ---- Lightbox ---- */
    var stage = lightbox.querySelector(".lightbox__stage");
    var capEl = lightbox.querySelector(".lb-caption");
    var btnPrev = lightbox.querySelector(".lb-prev");
    var btnNext = lightbox.querySelector(".lb-next");
    var btnClose = lightbox.querySelector(".lb-close");
    var currentIdx = 0;
    var lastFocus = null;

    function sfx(kind) {
      if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play(kind);
    }

    function openLightbox(item) {
      currentIdx = Math.max(0, shown.indexOf(item));
      lastFocus = document.activeElement;
      renderLightbox();
      lightbox.showModal();
      btnClose.focus();
      sfx("shutter");
    }

    function renderLightbox() {
      var item = shown[currentIdx];
      if (!item) return;
      if (item.video) {
        stage.innerHTML = '<video src="' + esc(item.src) + '" controls autoplay muted loop playsinline aria-label="' + esc(item.alt) + '"></video>';
      } else if (item.src) {
        stage.innerHTML = '<img src="' + esc(item.src) + '" alt="' + esc(item.alt) + '">';
      } else {
        stage.innerHTML = placeholderSVG(item, 800, 560);
      }
      capEl.innerHTML = "<strong>" + esc(item.caption) + "</strong>" +
        (item.eventName ? '<span class="lb-event">' + esc(item.eventName) + (item.date ? " · " + esc(item.date) : "") + "</span>" : "") +
        (item.src ? "" : '<span class="lb-event">Designed schematic — screenshots to come</span>');
      var single = shown.length < 2;
      btnPrev.hidden = single; btnNext.hidden = single;
    }

    function move(d) {
      currentIdx = (currentIdx + d + shown.length) % shown.length;
      renderLightbox();
    }

    btnPrev.addEventListener("click", function () { move(-1); });
    btnNext.addEventListener("click", function () { move(1); });
    btnClose.addEventListener("click", function () { lightbox.close(); });
    lightbox.addEventListener("close", function () {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    });
    /* swipe */
    var tx = null;
    lightbox.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 48) move(dx > 0 ? -1 : 1);
      tx = null;
    }, { passive: true });

    render();
    /* the lightbox scales photos up cleanly */
    var st = lightbox.querySelector(".lightbox__stage");
    if (st) st.classList.add("lightbox__stage--photo");

    /* public: open any item by id (hero polaroid deck uses this) */
    api.openById = function (id) {
      var item = C.galleryItems.find(function (g) { return g.id === id; });
      if (!item) return;
      shown = C.galleryItems.slice();
      currentIdx = Math.max(0, shown.indexOf(item));
      lastFocus = document.activeElement;
      renderLightbox();
      lightbox.showModal();
      btnClose.focus();
    };
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var api = { init: init, openById: null };
  window.GalleryView = api;
})();
