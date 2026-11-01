/* ============================================================
   APP — orchestration: motion/sound settings, nav, reveal,
   case studies, copy actions, command palette, tour, Byte menu,
   snapshot freshness, footer finale.
   ============================================================ */

(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- Toast ---------------- */
  var toastEl, toastTimer;
  function toast(msg, actionLabel, action) {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.innerHTML = "<span>" + msg + "</span>";
    if (actionLabel && action) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = actionLabel;
      b.addEventListener("click", function () { action(); toastEl.classList.remove("is-shown"); });
      toastEl.appendChild(b);
    }
    toastEl.classList.add("is-shown");
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-shown"); }, 6000);
  }
  window.appToast = toast;

  /* ---------------- Motion settings ---------------- */
  var osReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  function storedMotion() {
    try { return localStorage.getItem("sp-motion"); } catch (e) { return null; }
  }
  function resolveMotion() {
    var s = storedMotion();
    if (s === "full" || s === "reduced" || s === "off") return s;
    return osReduce.matches ? "reduced" : "full";
  }
  function applyMotion() {
    document.documentElement.setAttribute("data-motion", resolveMotion());
    $$(".seg-btn[data-motion-choice]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.motionChoice === (storedMotion() || "auto") ? "true" : "false");
    });
  }
  function setMotion(choice) {
    try {
      if (choice === "auto") localStorage.removeItem("sp-motion");
      else localStorage.setItem("sp-motion", choice);
    } catch (e) {}
    applyMotion();
  }
  osReduce.addEventListener && osReduce.addEventListener("change", applyMotion);

  /* ---------------- Sound ---------------- */
  function applySoundUI() {
    var on = window.Byte && window.Byte.SoundFX.enabled;
    $$("[data-sound-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.textContent = on ? "Sound: on" : "Sound: off";
    });
  }
  window.SoundPop = function () {
    if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("pop");
  };

  /* ---------------- Reveal once ---------------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("is-revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------------- Nav progress + back to top ---------------- */
  function initProgress() {
    var bar = $(".nav-progress");
    if (!bar) return;
    var ticking = false;
    function update() {
      ticking = false;
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  function initMobileMenu() {
    var menu = $("#mobile-menu");
    var btn = $(".nav-toggle");
    if (!menu || !btn) return;
    btn.addEventListener("click", function () {
      menu.showModal();
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { menu.close(); });
    });
    var closeBtn = menu.querySelector("[data-close-menu]");
    if (closeBtn) closeBtn.addEventListener("click", function () { menu.close(); });
  }

  /* ---------------- Case studies: toggle + deep link ---------------- */
  function initCases() {
    $$(".case-toggle").forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      btn.addEventListener("click", function () {
        var open = panel.hidden;
        panel.hidden = !open;
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.querySelector(".case-toggle-label").textContent = open ? "Close case study" : "Open case study";
        if (open) {
          history.replaceState(null, "", "#" + panel.id);
          panel.scrollIntoView({ behavior: resolveMotion() === "full" ? "smooth" : "auto", block: "start" });
          window.SoundPop && window.SoundPop();
        } else {
          history.replaceState(null, "", "#" + btn.closest("[id]").id);
        }
      });
    });
    /* deep link: #banknest-case opens that case */
    if (location.hash && location.hash.endsWith("-case")) {
      var panel = $(location.hash);
      if (panel && panel.classList.contains("case")) {
        panel.hidden = false;
        var btn = $('.case-toggle[aria-controls="' + panel.id + '"]');
        if (btn) {
          btn.setAttribute("aria-expanded", "true");
          btn.querySelector(".case-toggle-label").textContent = "Close case study";
        }
        setTimeout(function () { panel.scrollIntoView({ block: "start" }); }, 80);
      }
    }
  }

  /* ---------------- Copy actions ---------------- */
  function copyText(text, okMsg) {
    function done(ok) {
      if (ok) {
        toast(okMsg);
        if (window.Byte) window.Byte.celebrateAll();
      } else {
        toast("Copy blocked — select the text below and copy manually.");
      }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { legacy(); });
    } else legacy();
    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  }
  window.appCopy = copyText;

  function initCopyButtons() {
    var C = window.CONTENT;
    $$("[data-copy-email]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        copyText(C.site.email, "Email copied — siddhantpardeshi307@gmail.com");
      });
    });
    $$("[data-copy-summary]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        copyText(C.site.profileSummary, "Profile summary copied — ready to paste.");
      });
    });
    $$("[data-copy-url]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        copyText(location.origin + location.pathname.replace(/index\.html$/, "") + b.getAttribute("data-copy-url"), "Link copied.");
      });
    });
  }

  /* ---------------- Command palette ---------------- */
  function initPalette() {
    var dlg = $("#palette");
    var btn = $("[data-open-palette]");
    if (!dlg) return;
    var input = $("input", dlg);
    var list = $(".palette__list", dlg);
    var items = [
      { label: "Top of page", hint: "Home", run: function () { location.hash = "#top"; } },
      { label: "Work — projects & case studies", hint: "Section", run: function () { location.hash = "#work"; } },
      { label: "BankNest — follow a transfer", hint: "Sim", run: function () { location.hash = "#banknest"; } },
      { label: "LifeDrop — move a request", hint: "Sim", run: function () { location.hash = "#lifedrop"; } },
      { label: "MetroMind — hackathon build", hint: "Project", run: function () { location.hash = "#metromind"; } },
      { label: "Skills — the evidence map", hint: "Section", run: function () { location.hash = "#skills"; } },
      { label: "Achievements", hint: "Section", run: function () { location.hash = "#achievements"; } },
      { label: "Hackathon gallery", hint: "Section", run: function () { location.hash = "#gallery"; } },
      { label: "LinkedIn posts & GitHub", hint: "Section", run: function () { location.hash = "#posts"; } },
      { label: "About & education", hint: "Section", run: function () { location.hash = "#about"; } },
      { label: "Contact", hint: "Section", run: function () { location.hash = "#contact"; } },
      { label: "Recruiter view", hint: "Page", run: function () { location.href = "recruiter.html"; } },
      { label: "View resume (PDF)", hint: "File", run: function () { window.open(window.CONTENT.site.resume.path, "_blank", "noopener"); } },
      { label: "Copy email address", hint: "Action", run: function () { copyText(window.CONTENT.site.email, "Email copied."); } },
      { label: "Open GitHub profile", hint: "External", run: function () { window.open(window.CONTENT.site.github, "_blank", "noopener"); } },
      { label: "Open LinkedIn profile", hint: "External", run: function () { window.open(window.CONTENT.site.linkedin, "_blank", "noopener"); } },
      { label: "Take the Byte tour", hint: "Tour", run: function () { startTour(); } },
      { label: "Hand-tracked particles (webcam)", hint: "Experience", run: function () { if (window.HandFX) window.HandFX.open(); } },
      { label: "Experience settings", hint: "Settings", run: function () { openSettings(); } }
    ];
    var filtered = items, activeIdx = 0;

    function render() {
      list.innerHTML = "";
      filtered.forEach(function (it, i) {
        var li = document.createElement("li");
        li.className = i === activeIdx ? "is-active" : "";
        var b = document.createElement("button");
        b.type = "button";
        b.innerHTML = "<span>" + it.label + '</span><span class="pk">' + it.hint + "</span>";
        b.addEventListener("click", function () { choose(i); });
        li.appendChild(b);
        list.appendChild(li);
      });
      if (!filtered.length) {
        list.innerHTML = '<li class="palette__empty">No matches — try “resume” or “projects”.</li>';
      }
    }
    function choose(i) {
      var it = filtered[i];
      if (!it) return;
      dlg.close();
      it.run();
    }
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      filtered = items.filter(function (it) { return it.label.toLowerCase().indexOf(q) >= 0; });
      activeIdx = 0;
      render();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, filtered.length - 1); render(); }
      if (e.key === "ArrowUp") { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); render(); }
      if (e.key === "Enter") { e.preventDefault(); choose(activeIdx); }
    });
    dlg.addEventListener("close", function () { input.value = ""; filtered = items; activeIdx = 0; render(); });
    function open() {
      render();
      dlg.showModal();
      input.focus();
      window.SoundPop && window.SoundPop();
    }
    if (btn) btn.addEventListener("click", open);
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (dlg.open) dlg.close(); else open();
      }
    });
  }

  /* ---------------- Settings dialog ---------------- */
  var settingsDlg;
  function openSettings() { if (settingsDlg) settingsDlg.showModal(); }
  function initSettings() {
    settingsDlg = $("#settings-menu");
    if (!settingsDlg) return;
    $$(".seg-btn[data-motion-choice]", settingsDlg).forEach(function (b) {
      b.addEventListener("click", function () {
        setMotion(b.dataset.motionChoice === "auto" ? "auto" : b.dataset.motionChoice);
        window.SoundPop();
      });
    });
    $$("[data-sound-toggle]", settingsDlg).forEach(function (b) {
      b.addEventListener("click", function () {
        var fx = window.Byte && window.Byte.SoundFX;
        if (!fx) return;
        fx.enabled = !fx.enabled;
        fx.save();
        applySoundUI();
        if (fx.enabled) fx.play("chirp");
      });
    });
    var restore = $("[data-restore-byte]", settingsDlg);
    if (restore) {
      restore.addEventListener("click", function () {
        try { localStorage.setItem("sp-byte-hidden", "0"); } catch (e) {}
        var dock = $("#byte-dock");
        if (dock) dock.hidden = false;
        toast("Byte is back.");
        settingsDlg.close();
      });
    }
    var closeSettings = $("[data-close-settings]", settingsDlg);
    if (closeSettings) closeSettings.addEventListener("click", function () { settingsDlg.close(); });
  }

  function initHideByte() {
    $$("[data-hide-byte]").forEach(function (b) {
      b.addEventListener("click", function () {
        var menu = $("#byte-menu");
        if (menu && menu.open) menu.close();
        try { localStorage.setItem("sp-byte-hidden", "1"); } catch (e) {}
        var dock = $("#byte-dock");
        if (dock) dock.hidden = true;
        if (window.Byte) window.Byte.hideSpeech();
        toast("Byte is resting. Restore him from Settings → Bring Byte back.");
      });
    });
  }

  /* ---------------- Hand-tracked particles ---------------- */
  function initHandFX() {
    if (!window.HandFX) return;
    $$("[data-handfx-open]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (HandFX.isSupported()) HandFX.open();
        else toast("Hand control needs a camera and a secure connection, so it's unavailable right now.");
      });
    });
    /* hide the entry point entirely where the platform can't support it */
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $$("[data-handfx-open]").forEach(function (b) { b.hidden = true; });
    }
  }

  /* ---------------- Tour ---------------- */
  var tourSteps = [
    { sel: "#top", title: "The signal starts here", text: "This playground traces one idea: a request travels from UI to API to data and back. Press “Trace a request” to watch it." },
    { sel: "#work", title: "Systems you can play with", text: "BankNest and LifeDrop aren't screenshots — you can walk a real fund transfer and a blood request through their architecture, step by step." },
    { sel: "#skills", title: "Every tool points to evidence", text: "Click any skill. It links to the project, course, or credential that backs it — no percentages, no padding." },
    { sel: "#achievements", title: "Results, with receipts", text: "Team UrbanSync's 4th place at the Metro Hackathon leads the wall, with GATE, certifications, and scholarships beside it." },
    { sel: "#posts", title: "Follow the build", text: "LinkedIn activity and repositories live here. When you're done: Byte waves goodbye near the contact section." }
  ];
  var tourIdx = -1, tourCard, tourRestoreFocus = null;
  function renderTour() {
    var s = tourSteps[tourIdx];
    tourCard.querySelector(".tour-step").textContent = "Step " + (tourIdx + 1) + " / " + tourSteps.length;
    tourCard.querySelector("h3").textContent = s.title;
    tourCard.querySelector("p").textContent = s.text;
    tourCard.querySelector("[data-tour-next]").textContent = tourIdx === tourSteps.length - 1 ? "Finish" : "Next";
    var target = $(s.sel);
    if (target) target.scrollIntoView({ behavior: resolveMotion() === "full" ? "smooth" : "auto", block: "start" });
  }
  function startTour() {
    if (!tourCard) return;
    tourIdx = 0;
    tourRestoreFocus = document.activeElement;
    tourCard.hidden = false;
    renderTour();
    tourCard.querySelector("[data-tour-next]").focus();
  }
  function endTour(done) {
    tourCard.hidden = true;
    tourIdx = -1;
    if (tourRestoreFocus && tourRestoreFocus.focus) tourRestoreFocus.focus();
    if (done) {
      if (window.Byte) Byte.dance();
      toast("You know the playground now — scroll on.");
    }
  }
  function initTour() {
    tourCard = $("#tour-card");
    if (!tourCard) return;
    tourCard.querySelector("[data-tour-next]").addEventListener("click", function () {
      if (tourIdx >= tourSteps.length - 1) endTour(true);
      else { tourIdx++; renderTour(); }
    });
    tourCard.querySelector("[data-tour-back]").addEventListener("click", function () {
      if (tourIdx <= 0) { endTour(false); return; }
      tourIdx--;
      renderTour();
    });
    tourCard.querySelector("[data-tour-exit]").addEventListener("click", function () { endTour(false); });
  }

  /* ---------------- Byte menu actions ---------------- */
  function initByteMenu() {
    var menu = $("#byte-menu");
    if (!menu) return;
    var C = window.CONTENT;
    var cfg = C.postsConfig;
    var posts = (cfg.posts || []).filter(function (p) { return p && p.url && p.title; });
    var featured = null, latest = null;
    if (cfg.featuredPostId) featured = posts.find(function (p) { return p.id === cfg.featuredPostId; }) || null;
    if (!featured && posts.length) featured = posts.slice().sort(function (a, b) { return (a.featuredRank || 99) - (b.featuredRank || 99); })[0];
    if (cfg.latestPostId) latest = posts.find(function (p) { return p.id === cfg.latestPostId; }) || null;
    if (!latest) {
      var wd = posts.filter(function (p) { return p.publishedAt; });
      if (wd.length) latest = wd.sort(function (a, b) { return new Date(b.publishedAt) - new Date(a.publishedAt); })[0];
    }

    $$("[data-byte-action]", menu).forEach(function (b) {
      var act = b.dataset.byteAction;
      if ((act === "featured-post" && !featured) || (act === "latest-post" && !latest)) {
        b.hidden = true;
        return;
      }
      b.addEventListener("click", function () {
        if (menu.open) menu.close();
        switch (act) {
          case "projects": location.hash = "#work"; break;
          case "summary": location.href = "recruiter.html"; break;
          case "achievements": location.hash = "#achievements"; break;
          case "featured-post": window.open(featured.url, "_blank", "noopener"); break;
          case "latest-post": window.open(latest.url, "_blank", "noopener"); break;
          case "github": window.open(C.site.github, "_blank", "noopener"); break;
          case "resume": window.open(C.site.resume.path, "_blank", "noopener"); break;
          case "contact": location.hash = "#contact"; break;
          case "handfx": if (window.HandFX) window.HandFX.open(); break;
          case "tour": startTour(); break;
        }
        if (window.Byte) window.Byte.SoundFX.play("pop");
      });
    });
  }

  /* ---------------- Snapshot freshness (open tabs) ---------------- */
  function initSnapshotCheck() {
    if (!window.fetch) return;
    var known = null;
    var timer = null;
    function check() {
      fetch("data/version.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (v) {
          if (!v || !v.version) return;
          if (known === null) { known = v.version; return; }
          if (v.version !== known) {
            known = v.version;
            toast("Content updated since you opened this page.", "Refresh view", function () { location.reload(); });
          }
        })
        .catch(function () {})
        .then(function () { schedule(); });
    }
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!document.hidden) check();
        else schedule();
      }, 100000);
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) check();
    });
    window.addEventListener("focus", function () { check(); });
    check();
  }

  /* ---------------- Word-by-word headline reveals ---------------- */
  function initWordReveal() {
    if (resolveMotion() !== "full") return;
    $$(".section-head h2").forEach(function (h2) {
      if (h2.dataset.wrapped) return;
      h2.dataset.wrapped = "1";
      var words = h2.textContent.trim().split(/\s+/);
      var wi = 0;
      h2.innerHTML = words.map(function (w) {
        return '<span class="wline"><span class="word" style="--wi:' + (wi++) + '">' + w + "</span></span>";
      }).join(" ");
      /* if the parent is already revealed, show immediately */
      var parent = h2.closest(".reveal");
      if (parent && parent.classList.contains("is-revealed")) {
        $$(".word", h2).forEach(function (w) { w.style.transform = "none"; });
      }
    });
  }

  /* ---------------- Count-up numbers ---------------- */
  function initCountUp() {
    var els = $$("[data-count]");
    if (!els.length) return;
    function animate(el) {
      var to = parseFloat(el.getAttribute("data-count"));
      var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var start = null, dur = 1100;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(frame);
      }
      if (resolveMotion() === "full") requestAnimationFrame(frame);
      else el.textContent = to.toFixed(dec);
    }
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { animate(el); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animate(en.target);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Reveal failsafes ----------------
     Content must never be trapped behind an animation. Anything
     already in the viewport gets revealed on a timer, no matter
     what the observers did. */
  function initRevealFailsafe() {
    function sweep() {
      $$(".reveal:not(.is-revealed)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-revealed");
      });
      $$(".sheet-item:not(.is-in)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.2 && r.bottom > 0) el.classList.add("is-in");
      });
    }
    setTimeout(sweep, 600);
    setTimeout(sweep, 2500);
    window.addEventListener("load", function () { setTimeout(sweep, 400); });
  }

  /* ---------------- Hero polaroid → photo viewer ---------------- */
  function initHeroPhotos() {
    $$("[data-open-photo]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (window.GalleryView && window.GalleryView.openById) {
          window.GalleryView.openById(b.getAttribute("data-open-photo"));
          if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("shutter");
        } else {
          location.hash = "#gallery";
        }
      });
    });
  }

  /* ---------------- Byte section awareness ---------------- */
  function initByteSectionAwareness() {
    var ids = ["top", "work", "skills", "achievements", "gallery", "posts", "about", "contact"];
    var current = "";
    var lastFired = 0;
    var ticking = false;
    function check() {
      ticking = false;
      var center = window.innerHeight * 0.5;
      var found = "";
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || found) return;
        var r = el.getBoundingClientRect();
        if (r.top <= center && r.bottom >= center) found = id;
      });
      if (found && found !== current) {
        current = found;
        if (found !== "top" && Date.now() - lastFired > 9000 && resolveMotion() !== "off") {
          lastFired = Date.now();
          window.dispatchEvent(new CustomEvent("byte:section", { detail: { id: found } }));
          if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("section");
        }
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    }, { passive: true });
    check();
  }

  /* ---------------- Achievements sweep + footer finale ---------------- */
  function initPolish() {
    $$(".ach-card").forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        if (resolveMotion() !== "full") return;
        card.classList.remove("sweep");
        void card.offsetWidth;
        card.classList.add("sweep");
      });
    });
    var bridge = $(".footer-bridge");
    if (bridge && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            bridge.classList.add("bridge--built");
            io.disconnect();
          }
        });
      }, { threshold: 0.4 });
      io.observe(bridge);
    } else if (bridge) {
      bridge.classList.add("bridge--built");
    }
  }

  /* ---------------- Availability chip ---------------- */
  function initAvailability() {
    var C = window.CONTENT;
    $$("[data-availability]").forEach(function (el) {
      if (!C.site.availability.enabled) { el.hidden = true; return; }
      el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + C.site.availability.text;
    });
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    toastEl = $("#toast");
    applyMotion();
    applySoundUI();
    initReveal();
    initProgress();
    initMobileMenu();
    initCases();
    initCopyButtons();
    initPalette();
    initSettings();
    initTour();
    initByteMenu();
    initSnapshotCheck();
    initHideByte();
    initHandFX();
    initPolish();
    initWordReveal();
    initCountUp();
    initRevealFailsafe();
    initByteSectionAwareness();
    initHeroPhotos();
    /* re-wrap headlines that get revealed later is unnecessary —
       the observer adds is-revealed to the whole .section-head */
    initAvailability();
    if (window.SkillsView) SkillsView.init();
    if (window.GalleryView) GalleryView.init();
    if (window.PostsView) { PostsView.initPosts(); PostsView.initRepos(); }
    if (window.Sims) Sims.init();
    if (window.ByteInit) ByteInit();

    /* nav settings button */
    $$("[data-open-settings]").forEach(function (b) {
      b.addEventListener("click", function () { openSettings(); });
    });
  });
})();
