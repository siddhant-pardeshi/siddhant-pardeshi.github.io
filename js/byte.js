/* ============================================================
   BYTE — capybara guide. Renderer + behavior controller.
   - Complete inline SVG (no external assets needed)
   - States: idle greeting curious happy surprised thinking
             celebrating guiding sleepy hidden
   - Sound: WebAudio chirps, OFF by default, opt-in only
   - Every navigation action Byte offers is a real action.
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- SVG renderer ---------------- */
  function byteSVG(opts) {
    opts = opts || {};
    return ''
    + '<svg class="byte-svg" viewBox="0 0 200 200" role="img" aria-label="Byte, a small illustrated capybara coding companion with a lime backpack and a chest display" xmlns="http://www.w3.org/2000/svg">'
    + '<defs>'
    +   '<clipPath id="byte-body-clip-' + opts.uid + '"><path d="M30,128 C30,92 52,72 88,68 C120,65 142,72 158,84 C168,92 172,102 172,116 C172,150 168,176 156,180 L44,180 C32,176 30,150 30,128 Z"/></clipPath>'
    + '</defs>'
    /* soft ground shadow */
    + '<ellipse cx="100" cy="184" rx="66" ry="9" fill="#101114" opacity="0.10"/>'
    + '<g class="byte-body-g">'
    /* tail-less body loaf */
    +   '<path d="M30,128 C30,92 52,72 88,68 C120,65 142,72 158,84 C168,92 172,102 172,116 C172,150 168,176 156,180 L44,180 C32,176 30,150 30,128 Z" fill="#E9A566" stroke="#101114" stroke-width="4" stroke-linejoin="round"/>'
    +   '<g clip-path="url(#byte-body-clip-' + opts.uid + ')">'
    +     '<ellipse cx="100" cy="164" rx="62" ry="26" fill="#F6E3C8"/>'
    +     '<ellipse cx="152" cy="104" rx="28" ry="22" fill="#DE9250"/>'
    +   '</g>'
    /* backpack */
    +   '<g>'
    +     '<rect x="22" y="88" width="36" height="52" rx="13" fill="#D9FF43" stroke="#101114" stroke-width="4"/>'
    +     '<rect x="30" y="104" width="20" height="16" rx="6" fill="none" stroke="#101114" stroke-width="3"/>'
    +     '<path d="M56,92 C62,98 66,108 67,122" fill="none" stroke="#D9FF43" stroke-width="7" stroke-linecap="round"/>'
    +   '</g>'
    /* ears */
    +   '<g>'
    +     '<ellipse cx="66" cy="74" rx="12" ry="9" transform="rotate(-18 66 74)" fill="#C9814C" stroke="#101114" stroke-width="4"/>'
    +     '<ellipse cx="110" cy="67" rx="12" ry="9" transform="rotate(-6 110 67)" fill="#C9814C" stroke="#101114" stroke-width="4"/>'
    +   '</g>'
    /* face group (pointer tracking moves this) */
    +   '<g class="byte-face-g">'
    +     '<ellipse class="byte-cheek" cx="76" cy="112" rx="8" ry="5" fill="#FF9E7D" opacity="0.55"/>'
    +     '<ellipse class="byte-cheek" cx="132" cy="112" rx="8" ry="5" fill="#FF9E7D" opacity="0.55"/>'
    +     '<g class="byte-eyes-g">'
    +       '<circle class="byte-eye-open byte-eye-pupil" cx="86" cy="97" r="6" fill="#101114"/>'
    +       '<circle class="byte-eye-open" cx="88.4" cy="94.8" r="1.9" fill="#fff"/>'
    +       '<circle class="byte-eye-open byte-eye-pupil" cx="126" cy="93" r="6" fill="#101114"/>'
    +       '<circle class="byte-eye-open" cx="128.4" cy="90.8" r="1.9" fill="#fff"/>'
    +       '<path class="byte-eye-shut" d="M80,97 q6,5 12,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +       '<path class="byte-eye-shut" d="M120,93 q6,5 12,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +       '<path class="byte-eye-happy" d="M79,99 q7,-9 14,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +       '<path class="byte-eye-happy" d="M119,95 q7,-9 14,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +     '</g>'
    /* nose + mouth */
    +     '<rect x="152" y="94" width="17" height="11" rx="5.5" fill="#2a1c12" stroke="#101114" stroke-width="2"/>'
    +     '<path d="M150,116 q7,6 14,1" fill="none" stroke="#101114" stroke-width="3" stroke-linecap="round"/>'
    +     '<circle cx="147" cy="106" r="1.4" fill="#101114" opacity="0.5"/>'
    +     '<circle cx="152" cy="109" r="1.4" fill="#101114" opacity="0.5"/>'
    +   '</g>'
    /* chest display */
    +   '<g>'
    +     '<rect x="84" y="126" width="46" height="42" rx="11" fill="#101114" stroke="#D9FF43" stroke-width="3.5"/>'
    +     '<rect x="91" y="133" width="32" height="28" rx="7" fill="#1d2027"/>'
    +     '<g class="byte-display-face byte-display-brackets">'
    +       '<path d="M100,141 l-6,6 6,6" fill="none" stroke="#D9FF43" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>'
    +       '<path d="M114,141 l6,6 -6,6" fill="none" stroke="#D9FF43" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>'
    +       '<path d="M109,139 l-4,16" fill="none" stroke="#D9FF43" stroke-width="2.8" stroke-linecap="round"/>'
    +     '</g>'
    +     '<g class="byte-display-face byte-display-heart" hidden>'
    +       '<path d="M107,155 c-6,-5 -10,-9 -10,-13 a5,5 0 0 1 10,-2 a5,5 0 0 1 10,2 c0,4 -4,8 -10,13 z" fill="#D9FF43"/>'
    +     '</g>'
    +     '<g class="byte-display-face byte-display-smile" hidden>'
    +       '<path d="M97,143 q4,-5 8,0" fill="none" stroke="#D9FF43" stroke-width="2.8" stroke-linecap="round"/>'
    +       '<path d="M109,143 q4,-5 8,0" fill="none" stroke="#D9FF43" stroke-width="2.8" stroke-linecap="round"/>'
    +       '<path d="M99,152 q8,7 16,0" fill="none" stroke="#D9FF43" stroke-width="2.8" stroke-linecap="round"/>'
    +     '</g>'
    +     '<g class="byte-display-face byte-display-sleep" hidden>'
    +       '<path d="M97,144 q4,4 8,0" fill="none" stroke="#D9FF43" stroke-width="2.6" stroke-linecap="round"/>'
    +       '<path d="M109,144 q4,4 8,0" fill="none" stroke="#D9FF43" stroke-width="2.6" stroke-linecap="round"/>'
    +       '<circle cx="107" cy="153" r="3.4" fill="none" stroke="#D9FF43" stroke-width="2.4"/>'
    +     '</g>'
    +     '<g class="byte-display-dots" hidden>'
    +       '<circle class="byte-display-dot" cx="99" cy="147" r="2.6" fill="#D9FF43"/>'
    +       '<circle class="byte-display-dot" cx="107" cy="147" r="2.6" fill="#D9FF43"/>'
    +       '<circle class="byte-display-dot" cx="115" cy="147" r="2.6" fill="#D9FF43"/>'
    +     '</g>'
    +   '</g>'
    /* paws */
    +   '<rect x="46" y="166" width="24" height="15" rx="7.5" fill="#E9A566" stroke="#101114" stroke-width="4"/>'
    +   '<rect x="84" y="169" width="24" height="15" rx="7.5" fill="#E9A566" stroke="#101114" stroke-width="4"/>'
    +   '<rect x="118" y="169" width="24" height="15" rx="7.5" fill="#E9A566" stroke="#101114" stroke-width="4"/>'
    +   '<g class="byte-paw-wave">'
    +     '<rect x="140" y="160" width="25" height="16" rx="8" fill="#F0B273" stroke="#101114" stroke-width="4"/>'
    +   '</g>'
    + '</g>'
    /* builder hat */
    + '<g class="byte-hat">'
    +   '<path d="M74,60 a26,20 0 0 1 52,0 z" fill="#FFD23F" stroke="#101114" stroke-width="3.5"/>'
    +   '<rect x="68" y="57" width="64" height="9" rx="4.5" fill="#FFD23F" stroke="#101114" stroke-width="3.5"/>'
    +   '<path d="M96,42 v8 M104,42 v8" stroke="#101114" stroke-width="3" stroke-linecap="round" opacity="0.5"/>'
    + '</g>'
    /* sleepy Zzz */
    + '<g class="byte-zzz" fill="#4B57FF" font-family="Space Grotesk, system-ui, sans-serif" font-weight="700">'
    +   '<text x="150" y="52" font-size="20">Z</text>'
    +   '<text x="164" y="38" font-size="14">z</text>'
    +   '<text x="174" y="28" font-size="10">z</text>'
    + '</g>'
    /* burst (hearts + sparkle) */
    + '<g class="byte-burst">'
    +   '<path d="M84,38 c-4,-3.5 -7,-6 -7,-9 a3.6,3.6 0 0 1 7,-1.4 a3.6,3.6 0 0 1 7,1.4 c0,3 -3,5.5 -7,9 z" fill="#FF7A6B"/>'
    +   '<path d="M116,32 c-4,-3.5 -7,-6 -7,-9 a3.6,3.6 0 0 1 7,-1.4 a3.6,3.6 0 0 1 7,1.4 c0,3 -3,5.5 -7,9 z" fill="#FF7A6B"/>'
    +   '<path d="M100,20 l2.4,5 5,2.4 -5,2.4 -2.4,5 -2.4,-5 -5,-2.4 5,-2.4 z" fill="#D9FF43"/>'
    + '</g>'
    + '</svg>';
  }

  /* ---------------- Sound (opt-in only) ---------------- */
  var SoundFX = {
    ctx: null, enabled: false, last: 0,
    load: function () {
      try { this.enabled = localStorage.getItem("sp-sound") === "on"; } catch (e) { this.enabled = false; }
    },
    save: function () { try { localStorage.setItem("sp-sound", this.enabled ? "on" : "off"); } catch (e) {} },
    ensureCtx: function () {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) { try { this.ctx = new AC(); } catch (e) { this.ctx = null; } }
      }
      if (this.ctx && this.ctx.state === "suspended") { this.ctx.resume(); }
      return !!this.ctx;
    },
    tone: function (freq, start, dur, type, gain) {
      var t0 = this.ctx.currentTime + start;
      var osc = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain || 0.05, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
    },
    play: function (kind) {
      if (!this.enabled) return;
      var now = Date.now();
      if (now - this.last < 550) return; /* cooldown - no stacking */
      if (!this.ensureCtx()) return;
      this.last = now;
      if (kind === "chirp") { this.tone(720, 0, 0.09); this.tone(980, 0.09, 0.12); }
      else if (kind === "pop") { this.tone(300, 0, 0.14, "triangle", 0.06); }
      else if (kind === "chime") { this.tone(660, 0, 0.12); this.tone(880, 0.11, 0.12); this.tone(1174, 0.22, 0.18); }
      else if (kind === "zzz") { this.tone(240, 0, 0.3, "sine", 0.03); }
    }
  };
  SoundFX.load();

  /* ---------------- Instance controller ---------------- */
  var uid = 0;
  var instances = [];
  var reactionIdx = 0;
  var lastReaction = 0;
  var sleepTimer = null;
  var WAKE_MS = 150000;

  function create(opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "byte-instance byte--breath byte--idle";
    el.innerHTML = byteSVG({ uid: "u" + (++uid) });
    if (opts.mount) opts.mount.appendChild(el);
    var inst = {
      el: el,
      interactive: !!opts.interactive,
      state: "idle",
      stateTimer: null
    };
    instances.push(inst);
    setState(inst, "idle");
    scheduleBlink(inst);
    return inst;
  }

  function setState(inst, state) {
    if (inst.stateTimer) { clearTimeout(inst.stateTimer); inst.stateTimer = null; }
    inst.state = state;
    var cl = inst.el.classList;
    ["idle", "wave", "happy", "surprised", "thinking", "celebrate", "sleepy", "hat", "eyes-closed"]
      .forEach(function (c) { cl.remove("byte--" + c); });
    cl.add("byte--" + (state === "greeting" ? "wave" : state));
    if (state === "greeting") cl.add("byte--wave");
    setDisplayFace(inst, {
      idle: "brackets", happy: "smile", surprised: "brackets",
      thinking: "dots", sleepy: "sleep", celebrate: "heart",
      greeting: "smile", curious: "brackets", guiding: "heart"
    }[state] || "brackets");
    if (state === "sleepy") cl.add("byte--eyes-closed");
    /* auto return to idle */
    var life = { greeting: 1600, happy: 1400, surprised: 1200, thinking: 2200, celebrate: 1700, wave: 1600 }[state];
    if (life) {
      inst.stateTimer = setTimeout(function () { setState(inst, "idle"); }, life);
    }
  }

  function setDisplayFace(inst, face) {
    inst.el.querySelectorAll(".byte-display-face, .byte-display-dots").forEach(function (g) { g.hidden = true; });
    var map = { brackets: "byte-display-brackets", heart: "byte-display-heart", smile: "byte-display-smile", sleep: "byte-display-sleep", dots: "byte-display-dots" };
    var target = inst.el.querySelector("." + map[face]);
    if (target) target.hidden = false;
  }

  function burst(inst) {
    var b = inst.el.querySelector(".byte-burst");
    if (!b) return;
    b.classList.remove("is-on");
    void b.getBoundingClientRect(); /* restart animation */
    b.classList.add("is-on");
  }

  function scheduleBlink(inst) {
    setTimeout(function () {
      if (!document.hidden && inst.state === "idle") {
        inst.el.classList.add("byte--blink");
        setTimeout(function () { inst.el.classList.remove("byte--blink"); }, 240);
      }
      scheduleBlink(inst);
    }, 2600 + Math.random() * 3200);
  }

  function react(inst) {
    var now = Date.now();
    if (now - lastReaction < 1200) return false; /* limit frequency */
    lastReaction = now;
    var moves = ["happy", "happy", "surprised", "celebrate", "wave"];
    var pick = moves[reactionIdx % moves.length];
    reactionIdx++;
    setState(inst, pick);
    burst(inst);
    SoundFX.play(pick === "celebrate" ? "chime" : "chirp");
    return true;
  }

  /* Pointer tracking — fine pointers, full motion only, bounded */
  var pointerRaf = 0, lastPointer = null;
  function onPointerMove(e) {
    lastPointer = { x: e.clientX, y: e.clientY };
    if (pointerRaf) return;
    pointerRaf = requestAnimationFrame(function () {
      pointerRaf = 0;
      if (document.hidden) return;
      var m = document.documentElement.getAttribute("data-motion") || "full";
      if (m !== "full" || !window.matchMedia("(pointer: fine)").matches) return;
      instances.forEach(function (inst) {
        if (inst.state === "sleepy") return;
        var r = inst.el.getBoundingClientRect();
        if (!r.width) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = Math.max(-1, Math.min(1, (lastPointer.x - cx) / 320));
        var dy = Math.max(-1, Math.min(1, (lastPointer.y - cy) / 320));
        var face = inst.el.querySelector(".byte-face-g");
        if (face) face.setAttribute("transform", "translate(" + (dx * 3.2).toFixed(1) + " " + (dy * 2.4).toFixed(1) + ")");
      });
    });
  }

  /* ---------------- Speech ---------------- */
  var speechEl = null, speechTimer = null, speechHideTimer = null;
  function say(text, ms) {
    if (!speechEl) return;
    clearTimeout(speechTimer);
    speechEl.querySelector(".byte-speech__text").textContent = text;
    speechEl.hidden = false;
    speechTimer = setTimeout(hideSpeech, ms || 5200);
  }
  function hideSpeech() {
    if (speechEl) speechEl.hidden = true;
    clearTimeout(speechTimer);
  }

  /* ---------------- Public API ---------------- */
  var api = {
    create: create,
    svg: byteSVG,
    SoundFX: SoundFX,
    say: say,
    hideSpeech: hideSpeech,
    celebrateAll: function () {
      instances.forEach(function (i) { setState(i, "celebrate"); burst(i); });
      SoundFX.play("chime");
    },
    setHat: function (on) {
      instances.forEach(function (i) { i.el.classList.toggle("byte--hat", !!on); });
    },
    think: function () { instances.forEach(function (i) { setState(i, "thinking"); }); },
    wave: function () { instances.forEach(function (i) { setState(i, "greeting"); }); },
    waveAt: function (sel) {
      var target = document.querySelector(sel);
      if (!target) return;
      var r = target.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        instances.forEach(function (i) { setState(i, "greeting"); });
      }
    }
  };

  /* ---------------- Boot ---------------- */
  function init() {
    var C = window.CONTENT;
    var lines = C.byteLines;

    /* speech bubble element — starts hidden */
    speechEl = document.createElement("div");
    speechEl.className = "byte-speech";
    speechEl.hidden = true;
    speechEl.setAttribute("role", "status");
    speechEl.innerHTML = '<button class="close-x" type="button" aria-label="Dismiss message">✕</button><span class="byte-speech__text"></span>';
    document.body.appendChild(speechEl);
    speechEl.querySelector(".close-x").addEventListener("click", hideSpeech);

    /* hero instance */
    var heroMount = document.getElementById("hero-byte");
    if (heroMount) create({ mount: heroMount });

    /* dock instance + button */
    var dock = document.getElementById("byte-dock");
    if (dock) {
      dock.innerHTML = '<button class="byte-dock__btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Open Byte the guide menu"></button>';
      dock.querySelector(".byte-dock__btn").innerHTML = byteSVG({ uid: "dock" });
      var dockBtn = dock.querySelector(".byte-dock__btn");
      var menu = document.getElementById("byte-menu");
      var menuCard = menu ? menu.querySelector(".byte-menu__card") : null;

      dockBtn.addEventListener("click", function () {
        if (menu && menuCard) {
          if (menu.open) { menu.close(); }
          else {
            menu.showModal();
            /* position near the dock once it has layout */
            var r = dockBtn.getBoundingClientRect();
            var h = menuCard.offsetHeight || 340;
            menuCard.style.right = Math.max(8, window.innerWidth - r.right) + "px";
            menuCard.style.left = "auto";
            menuCard.style.top = Math.max(8, r.top - 8 - h) + "px";
            dockBtn.setAttribute("aria-expanded", "true");
            var first = menu.querySelector("button");
            if (first) first.focus();
            setState(instances[instances.length - 1], "guiding");
          }
        }
        SoundFX.play("pop");
      });
      if (menu) {
        menu.addEventListener("close", function () { dockBtn.setAttribute("aria-expanded", "false"); });
        menu.addEventListener("click", function (e) {
          if (e.target === menuCard) return;
          var r = menuCard.getBoundingClientRect();
          var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (!inside) menu.close();
        });
      }

      /* double-click guard: menu handles single click only */
      dockBtn.addEventListener("dblclick", function (e) { e.preventDefault(); });

      /* hero byte is also clickable via its own button semantics */
      var heroBtn = document.getElementById("hero-byte");
      if (heroBtn) {
        heroBtn.setAttribute("role", "button");
        heroBtn.setAttribute("tabindex", "0");
        heroBtn.setAttribute("aria-label", "Make Byte react");
        heroBtn.addEventListener("click", function () {
          if (react(instances[0])) {
            say(lines.reactions[Math.floor(Math.random() * lines.reactions.length)]);
          }
        });
        heroBtn.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); heroBtn.click(); }
        });
      }
    }

    /* first-visit greeting — never blocks, never steals focus */
    var seen = null;
    try { seen = localStorage.getItem("sp-byte-met"); } catch (e) {}
    if (!seen) {
      setTimeout(function () { say(lines.greeting, 6400); }, 1400);
      try { localStorage.setItem("sp-byte-met", "1"); } catch (e) {}
    }

    /* sleepy after long inactivity; any input wakes */
    function armSleep() {
      clearTimeout(sleepTimer);
      sleepTimer = setTimeout(function () {
        if (document.hidden) return;
        instances.forEach(function (i) { if (i.state === "idle") setState(i, "sleepy"); });
        SoundFX.play("zzz");
      }, WAKE_MS);
    }
    ["pointerdown", "keydown", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, function () {
        instances.forEach(function (i) { if (i.state === "sleepy") setState(i, "idle"); });
        armSleep();
      }, { passive: true });
    });
    armSleep();

    /* pointer tracking */
    if (window.matchMedia("(pointer: fine)").matches) {
      document.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    /* dock visibility: show once hero is mostly out of view */
    var heroScene = document.getElementById("top");
    if (dock && "IntersectionObserver" in window && heroScene) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var minimized = false;
          try { minimized = localStorage.getItem("sp-byte-hidden") === "1"; } catch (e) {}
          dock.hidden = !en.isIntersecting ? minimized : true;
        });
      }, { threshold: 0.12 });
      io.observe(heroScene);
    } else if (dock) {
      dock.hidden = false;
    }
  }

  window.Byte = api;
  window.ByteInit = init;
})();
