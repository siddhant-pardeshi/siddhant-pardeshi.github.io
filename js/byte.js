/* ============================================================
   BYTE — capybara guide. Character rig v2.
   - 12 emotional states: idle greeting happy surprised thinking
     celebrate love dizzy excited dance curious guiding sleepy
   - Body language: cursor lean, ear perk/droop/twitch, look-around
   - Reactions: click combos (tap→double→triple→DANCE), petting
     (rub back & forth over him), fast-cursor surprise, glance
     toward any click on the page
   - Sound: opt-in chirps, purr, boing, jingle (WebAudio, local)
   - Public API unchanged + Byte.dance(), Byte.debug
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
    + '<ellipse cx="100" cy="184" rx="66" ry="9" fill="#101114" opacity="0.10"/>'
    + '<g class="byte-lean-g"><g class="byte-motion-g"><g class="byte-body-g">'
    /* body loaf */
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
    /* ears (perk/droop/twitch) */
    +   '<g class="byte-ears-g">'
    +     '<ellipse class="byte-ear-l" cx="66" cy="74" rx="12" ry="9" transform="rotate(-18 66 74)" fill="#C9814C" stroke="#101114" stroke-width="4"/>'
    +     '<ellipse cx="110" cy="67" rx="12" ry="9" transform="rotate(-6 110 67)" fill="#C9814C" stroke="#101114" stroke-width="4"/>'
    +   '</g>'
    /* face (tracks cursor) */
    +   '<g class="byte-face-g">'
    +     '<ellipse class="byte-cheek" cx="76" cy="112" rx="8" ry="5" fill="#FF9E7D" opacity="0.55"/>'
    +     '<ellipse class="byte-cheek" cx="132" cy="112" rx="8" ry="5" fill="#FF9E7D" opacity="0.55"/>'
    +     '<g class="byte-eyes-g">'
    +       '<g class="byte-pupil-g">'
    +         '<circle class="byte-eye-open byte-eye-pupil" cx="86" cy="97" r="6" fill="#101114"/>'
    +         '<circle class="byte-eye-open byte-eye-pupil" cx="126" cy="93" r="6" fill="#101114"/>'
    +       '</g>'
    +       '<circle class="byte-eye-open" cx="88.4" cy="94.8" r="1.9" fill="#fff"/>'
    +       '<circle class="byte-eye-open" cx="128.4" cy="90.8" r="1.9" fill="#fff"/>'
    +       '<path class="byte-eye-shut" d="M80,97 q6,5 12,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +       '<path class="byte-eye-shut" d="M120,93 q6,5 12,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +       '<path class="byte-eye-happy" d="M79,99 q7,-9 14,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +       '<path class="byte-eye-happy" d="M119,95 q7,-9 14,0" fill="none" stroke="#101114" stroke-width="3.4" stroke-linecap="round"/>'
    +       '<path class="byte-eye-heart" d="M86,103 c-5,-4 -8.5,-7 -8.5,-10.4 a4.4,4.4 0 0 1 8.5,-1.7 a4.4,4.4 0 0 1 8.5,1.7 c0,3.4 -3.5,6.4 -8.5,10.4 z" fill="#FF6B8F" stroke="#101114" stroke-width="2"/>'
    +       '<path class="byte-eye-heart" d="M126,99 c-5,-4 -8.5,-7 -8.5,-10.4 a4.4,4.4 0 0 1 8.5,-1.7 a4.4,4.4 0 0 1 8.5,1.7 c0,3.4 -3.5,6.4 -8.5,10.4 z" fill="#FF6B8F" stroke="#101114" stroke-width="2"/>'
    +       '<g class="byte-eye-dizzy" stroke="#101114" stroke-width="2.6" fill="none" stroke-linecap="round">'
    +         '<path d="M80,97 c3,-5 9,-3 8,2 c-1,4 -7,4 -7,-1 c0,-6 8,-8 12,-3"/>'
    +         '<path d="M120,93 c3,-5 9,-3 8,2 c-1,4 -7,4 -7,-1 c0,-6 8,-8 12,-3"/>'
    +       '</g>'
    +     '</g>'
    /* noses + mouths */
    +     '<rect x="152" y="94" width="17" height="11" rx="5.5" fill="#2a1c12" stroke="#101114" stroke-width="2"/>'
    +     '<path class="byte-mouth" d="M150,116 q7,6 14,1" fill="none" stroke="#101114" stroke-width="3" stroke-linecap="round"/>'
    +     '<ellipse class="byte-mouth-o" cx="157" cy="118" rx="4.5" ry="5.5" fill="#7a4a2b" stroke="#101114" stroke-width="2.4"/>'
    +     '<path class="byte-mouth-open" d="M148,115 q8,10 16,0 z" fill="#7a4a2b" stroke="#101114" stroke-width="2.6" stroke-linejoin="round"/>'
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
    +   '<g class="byte-paw-back"><rect x="46" y="166" width="24" height="15" rx="7.5" fill="#E9A566" stroke="#101114" stroke-width="4"/></g>'
    +   '<rect x="84" y="169" width="24" height="15" rx="7.5" fill="#E9A566" stroke="#101114" stroke-width="4"/>'
    +   '<rect x="118" y="169" width="24" height="15" rx="7.5" fill="#E9A566" stroke="#101114" stroke-width="4"/>'
    +   '<g class="byte-paw-wave"><rect x="140" y="160" width="25" height="16" rx="8" fill="#F0B273" stroke="#101114" stroke-width="4"/></g>'
    + '</g></g></g>'
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
    /* dance music notes */
    + '<g class="byte-notes" fill="#4B57FF" font-family="Space Grotesk, system-ui, sans-serif" font-weight="700">'
    +   '<text x="46" y="42" font-size="22">♪</text>'
    +   '<text x="150" y="34" font-size="18">♫</text>'
    +   '<text x="168" y="56" font-size="14">♪</text>'
    + '</g>'
    /* burst: hearts + sparkles + stars */
    + '<g class="byte-burst">'
    +   '<path d="M84,38 c-4,-3.5 -7,-6 -7,-9 a3.6,3.6 0 0 1 7,-1.4 a3.6,3.6 0 0 1 7,1.4 c0,3 -3,5.5 -7,9 z" fill="#FF7A6B"/>'
    +   '<path d="M116,32 c-4,-3.5 -7,-6 -7,-9 a3.6,3.6 0 0 1 7,-1.4 a3.6,3.6 0 0 1 7,1.4 c0,3 -3,5.5 -7,9 z" fill="#FF7A6B"/>'
    +   '<path d="M100,20 l2.4,5 5,2.4 -5,2.4 -2.4,5 -2.4,-5 -5,-2.4 5,-2.4 z" fill="#D9FF43"/>'
    +   '<path d="M64,28 l1.8,3.8 3.8,1.8 -3.8,1.8 -1.8,3.8 -1.8,-3.8 -3.8,-1.8 3.8,-1.8 z" fill="#7C85FF"/>'
    +   '<path d="M138,24 l1.8,3.8 3.8,1.8 -3.8,1.8 -1.8,3.8 -1.8,-3.8 -3.8,-1.8 3.8,-1.8 z" fill="#FFA86B"/>'
    +   '<circle cx="100" cy="8" r="3.2" fill="#7C85FF"/>'
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
    tone: function (freq, start, dur, type, gain, sweepTo) {
      var t0 = this.ctx.currentTime + start;
      var osc = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
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
      else if (kind === "boing") { this.tone(160, 0, 0.22, "sine", 0.07, 620); }
      else if (kind === "purr") { this.tone(110, 0, 0.5, "sine", 0.04); this.tone(164, 0.18, 0.4, "sine", 0.03); }
      else if (kind === "jingle") { this.tone(523, 0, 0.11, "square", 0.03); this.tone(659, 0.12, 0.11, "square", 0.03); this.tone(784, 0.24, 0.11, "square", 0.03); this.tone(1046, 0.36, 0.2, "square", 0.035); }
      else if (kind === "zzz") { this.tone(240, 0, 0.3, "sine", 0.03); }
      else if (kind === "whoa") { this.tone(880, 0, 0.16, "sine", 0.05, 440); }
    }
  };
  SoundFX.load();

  /* ---------------- instance state ---------------- */
  var uid = 0;
  var instances = [];
  var globalLast = null;         /* {x, y, t} for fast-move detection */
  var glance = null;             /* {x, y, until} glance-at-click */
  var lastFast = 0;
  var lastSection = "";
  var lastSectionAt = 0;

  var LIFE = {
    greeting: 1600, happy: 1400, surprised: 1300, thinking: 2400,
    celebrate: 1800, love: 2400, dizzy: 2000, excited: 1600,
    dance: 3400, curious: 2000, wave: 1600
  };
  var FACE = {
    idle: "brackets", happy: "smile", surprised: "brackets", thinking: "dots",
    celebrate: "heart", love: "heart", dizzy: "sleep", excited: "smile",
    dance: "smile", curious: "brackets", guiding: "heart", greeting: "smile",
    sleepy: "sleep"
  };

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
      stateTimer: null,
      lastReactions: [],
      lastReactionAt: 0,
      petState: null,
      face: el.querySelector(".byte-face-g"),
      pupil: el.querySelector(".byte-pupil-g"),
      lean: el.querySelector(".byte-lean-g"),
      ears: el.querySelector(".byte-ears-g"),
      burst: el.querySelector(".byte-burst")
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
    ["idle", "wave", "greeting", "happy", "surprised", "thinking", "celebrate",
     "love", "dizzy", "excited", "dance", "curious", "guiding", "sleepy",
     "hat", "eyes-closed", "shy"]
      .forEach(function (c) { cl.remove("byte--" + c); });
    cl.add("byte--" + state);
    if (state === "greeting") cl.add("byte--wave");
    if (state === "sleepy") cl.add("byte--eyes-closed");
    setDisplayFace(inst, FACE[state] || "brackets");
    var life = LIFE[state];
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
    if (!inst.burst) return;
    inst.burst.classList.remove("is-on");
    void inst.burst.getBoundingClientRect();
    inst.burst.classList.add("is-on");
  }

  function scheduleBlink(inst) {
    setTimeout(function () {
      if (!document.hidden && inst.state === "idle") {
        inst.el.classList.add("byte--blink");
        setTimeout(function () { inst.el.classList.remove("byte--blink"); }, 240);
        if (Math.random() < 0.3) {
          setTimeout(function () {
            inst.el.classList.add("byte--blink");
            setTimeout(function () { inst.el.classList.remove("byte--blink"); }, 220);
          }, 420);
        }
      }
      scheduleBlink(inst);
    }, 2400 + Math.random() * 3400);
  }

  /* idle ear twitch + look-around */
  function scheduleIdleLife(inst) {
    setTimeout(function () {
      if (!document.hidden && inst.state === "idle" && motionFull()) {
        if (Math.random() < 0.5) {
          inst.el.classList.add("byte--twitch");
          setTimeout(function () { inst.el.classList.remove("byte--twitch"); }, 480);
        } else {
          inst.el.style.setProperty("--fx", (Math.random() < 0.5 ? -5 : 5) + "px");
          setTimeout(function () { if (inst.state === "idle") inst.el.style.setProperty("--fx", "0px"); }, 750);
        }
      }
      scheduleIdleLife(inst);
    }, 7000 + Math.random() * 8000);
  }

  /* ---------------- reactions ---------------- */
  var REACT_CYCLE = ["happy", "surprised", "celebrate", "greeting"];

  function react(inst, forced) {
    var now = Date.now();
    inst.lastReactions = inst.lastReactions.filter(function (t) { return now - t < 3000; });
    inst.lastReactions.push(now);
    var n = inst.lastReactions.length;

    /* a performance in progress owns the stage */
    if (inst.state === "dance") return false;

    /* combo ladder: taps escalate — 2 → excited, 3-5 → dizzy,
       6+ → DANCE (dizzy is a waypoint, not a dead end) */
    if (n >= 6) {
      inst.lastReactionAt = now;
      inst.lastReactions = [];
      setState(inst, "dance");
      burst(inst);
      SoundFX.play("jingle");
      if (window.Byte) window.Byte.say(window.BYTE_LINES && window.BYTE_LINES.dance ? window.BYTE_LINES.dance : "Dance mode!");
      return true;
    }
    if (inst.state === "dizzy") return false; /* ride it out */
    if (n >= 3) {
      inst.lastReactionAt = now;
      setState(inst, "dizzy");
      SoundFX.play("whoa");
      if (window.Byte) window.Byte.say(window.BYTE_LINES && window.BYTE_LINES.dizzy ? window.BYTE_LINES.dizzy : "Whoa, spinning!");
      return true;
    }
    if (n === 2) {
      inst.lastReactionAt = now;
      setState(inst, "excited");
      burst(inst);
      SoundFX.play("boing");
      return true;
    }
    if (now - inst.lastReactionAt < 1200) return false;
    inst.lastReactionAt = now;
    var pick = forced || REACT_CYCLE[Math.floor(Math.random() * REACT_CYCLE.length)];
    setState(inst, pick);
    burst(inst);
    SoundFX.play(pick === "celebrate" ? "chime" : "chirp");
    return true;
  }

  function pet(inst) {
    if (inst.state === "dance" || inst.state === "dizzy" || inst.state === "guiding" || inst.state === "sleepy") return;
    setState(inst, "love");
    burst(inst);
    SoundFX.play("purr");
    if (window.Byte) window.Byte.say(window.BYTE_LINES && window.BYTE_LINES.pet ? window.BYTE_LINES.pet : "Ahh, that's the spot!");
  }

  /* ---------------- pointer tracking (one rAF loop) ---------------- */
  var pointer = { x: 0, y: 0, has: false };
  var trackRaf = 0;

  function trackLoop() {
    trackRaf = requestAnimationFrame(trackLoop);
    if (document.hidden) return;
    var m = document.documentElement.getAttribute("data-motion");
    if (m !== "full") return;
    var fine = window.matchMedia("(pointer: fine)").matches;
    var now = performance.now();
    instances.forEach(function (inst) {
      if (!inst.face) return;
      var r = inst.el.getBoundingClientRect();
      if (!r.width || r.bottom < -60 || r.top > window.innerHeight + 60) return;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var tx = pointer.has ? pointer.x : cx;
      var ty = pointer.has ? pointer.y : cy;
      if (glance && now < glance.until) { tx = glance.x; ty = glance.y; }
      var dx = Math.max(-1, Math.min(1, (tx - cx) / 320));
      var dy = Math.max(-1, Math.min(1, (ty - cy) / 320));
      if (inst.state === "sleepy") { dx = 0; dy = 0; }
      inst.el.style.setProperty("--fx", (dx * 3.4).toFixed(1) + "px");
      inst.el.style.setProperty("--fy", (dy * 2.6).toFixed(1) + "px");
      inst.el.style.setProperty("--lean", (dx * 4).toFixed(1) + "deg");
      inst.el.style.setProperty("--ear", (dy < -0.35 ? "-4px" : dy > 0.5 ? "3px" : "0px"));
      if (inst.pupil && inst.state === "idle" && fine) {
        inst.pupil.setAttribute("transform", "translate(" + (dx * 1.6).toFixed(1) + " " + (dy * 1.3).toFixed(1) + ")");
      }
    });
  }

  function onPointerMove(e) {
    var prev = pointer.has ? { x: pointer.x, y: pointer.y, t: performance.now() } : null;
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.has = true;
    /* fast-move surprise */
    if (prev && motionFull() && e.target && e.target.closest && e.target.closest(".byte-instance")) {
      var dt = performance.now() - prev.t;
      if (dt > 0 && dt < 120) {
        var speed = Math.sqrt(Math.pow(e.clientX - prev.x, 2) + Math.pow(e.clientY - prev.y, 2)) / dt;
        if (speed > 2.4 && Date.now() - lastFast > 7000) {
          lastFast = Date.now();
          var inst = instances.find(function (i) { return i.el.contains(e.target.closest(".byte-instance")); });
          if (inst && (inst.state === "idle")) {
            setState(inst, "surprised");
            SoundFX.play("whoa");
            if (window.Byte) window.Byte.say(window.BYTE_LINES && window.BYTE_LINES.fast ? window.BYTE_LINES.fast : "Whoa, fast!");
          }
        }
      }
    }
  }

  /* ---------------- petting ---------------- */
  function attachPetting(inst) {
    var reversals = 0, lastX = null, lastDir = 0, firstMove = 0;
    function onMove(e) {
      /* pet() itself decides which states allow affection */
      var x = e.clientX;
      if (lastX === null) { lastX = x; firstMove = Date.now(); return; }
      var dx = x - lastX;
      if (Math.abs(dx) < 6) return;
      var dir = dx > 0 ? 1 : -1;
      if (lastDir !== 0 && dir !== lastDir) reversals++;
      else if (lastDir === 0) reversals = 0;
      lastDir = dir;
      lastX = x;
      if (Date.now() - firstMove > 2200) { reversals = 0; firstMove = Date.now(); }
      if (reversals >= 3) {
        reversals = 0;
        pet(inst);
      }
    }
    inst.el.addEventListener("pointermove", onMove, { passive: true });
  }

  function attachClicks(inst) {
    inst.el.addEventListener("click", function () {
      if (react(inst)) {
        var lines = window.BYTE_LINES;
        if (lines && lines.reactions && inst.state !== "dance" && inst.state !== "dizzy") {
          window.Byte.say(lines.reactions[Math.floor(Math.random() * lines.reactions.length)]);
        }
      }
    });
  }

  /* ---------------- speech ---------------- */
  var speechEl = null, speechTimer = null;
  function say(text, ms) {
    if (!speechEl || !text) return;
    clearTimeout(speechTimer);
    speechEl.querySelector(".byte-speech__text").textContent = text;
    speechEl.hidden = false;
    speechTimer = setTimeout(hideSpeech, ms || 5200);
  }
  function hideSpeech() {
    if (speechEl) speechEl.hidden = true;
    clearTimeout(speechTimer);
  }

  function motionFull() {
    return (document.documentElement.getAttribute("data-motion") || "full") === "full";
  }

  /* ---------------- section awareness ---------------- */
  var SECTION_MOODS = {
    achievements: { mood: "celebrate", once: true },
    gallery: { mood: "love", once: true },
    contact: { mood: "greeting", once: true },
    posts: { mood: "thinking" },
    work: { mood: "curious" },
    skills: { mood: "curious" },
    about: { mood: "happy" }
  };
  var moodShown = {};

  function onSection(id) {
    if (!id || id === lastSection) return;
    lastSection = id;
    var conf = SECTION_MOODS[id];
    if (!conf) return;
    if (conf.once && moodShown[id]) return;
    moodShown[id] = true;
    instances.forEach(function (i) { if (i.state === "idle" || i.state === "sleepy") setState(i, conf.mood); });
    if (id === "achievements" || id === "gallery") instances.forEach(function (i) { burst(i); });
    var lines = window.BYTE_LINES;
    if (lines && lines.sections && lines.sections[id] && Date.now() - lastSectionAt > 12000) {
      lastSectionAt = Date.now();
      say(lines.sections[id]);
    }
  }

  window.addEventListener("byte:section", function (e) { onSection(e.detail && e.detail.id); });

  /* ---------------- public API ---------------- */
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
    dance: function () {
      instances.forEach(function (i) { setState(i, "dance"); burst(i); });
      SoundFX.play("jingle");
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
  api.debug = {
    instances: instances,
    setState: setState,
    pet: pet,
    onSection: onSection
  };
  window.Byte = api;
  window.ByteInit = init;

  /* ---------------- boot ---------------- */
  function init() {
    var C = window.CONTENT;
    var lines = C.byteLines;
    window.BYTE_LINES = lines;

    speechEl = document.createElement("div");
    speechEl.className = "byte-speech";
    speechEl.hidden = true;
    speechEl.setAttribute("role", "status");
    speechEl.innerHTML = '<button class="close-x" type="button" aria-label="Dismiss message">✕</button><span class="byte-speech__text"></span>';
    document.body.appendChild(speechEl);
    speechEl.querySelector(".close-x").addEventListener("click", hideSpeech);

    var heroMount = document.getElementById("hero-byte");
    if (heroMount) {
      var heroInst = create({ mount: heroMount });
      heroInst.el.style.cursor = "pointer";
      attachClicks(heroInst);
      attachPetting(heroInst);
      heroMount.setAttribute("role", "button");
      heroMount.setAttribute("tabindex", "0");
      heroMount.setAttribute("aria-label", "Make Byte react — click him, or rub side to side to pet him");
      heroMount.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); heroInst.el.click(); }
      });
    }

    var dock = document.getElementById("byte-dock");
    if (dock) {
      dock.innerHTML = '<button class="byte-dock__btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Open Byte the guide menu"></button>';
      var dockBtn = dock.querySelector(".byte-dock__btn");
      var dockInst = create({ mount: dockBtn });
      attachPetting(dockInst);
      var menu = document.getElementById("byte-menu");
      var menuCard = menu ? menu.querySelector(".byte-menu__card") : null;

      dockBtn.addEventListener("click", function () {
        if (menu && menuCard) {
          if (menu.open) { menu.close(); }
          else {
            menu.showModal();
            var r = dockBtn.getBoundingClientRect();
            var h = menuCard.offsetHeight || 340;
            menuCard.style.right = Math.max(8, window.innerWidth - r.right) + "px";
            menuCard.style.left = "auto";
            menuCard.style.top = Math.max(8, r.top - 8 - h) + "px";
            dockBtn.setAttribute("aria-expanded", "true");
            var first = menu.querySelector("button");
            if (first) first.focus();
            var di = instances[instances.length - 1];
            if (di) setState(di, "guiding");
          }
        }
        SoundFX.play("pop");
      });
      dockBtn.addEventListener("dblclick", function (e) { e.preventDefault(); });
      if (menu) {
        menu.addEventListener("close", function () { dockBtn.setAttribute("aria-expanded", "false"); });
        menu.addEventListener("click", function (e) {
          if (e.target === menuCard) return;
          var r = menuCard.getBoundingClientRect();
          var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (!inside) menu.close();
        });
      }
    }

    /* first-visit greeting */
    var seen = null;
    try { seen = localStorage.getItem("sp-byte-met"); } catch (e) {}
    if (!seen) {
      setTimeout(function () { say(lines.greeting, 6400); }, 1400);
      try { localStorage.setItem("sp-byte-met", "1"); } catch (e) {}
    }

    /* sleepy after long inactivity */
    var sleepTimer = null;
    function armSleep() {
      clearTimeout(sleepTimer);
      sleepTimer = setTimeout(function () {
        if (document.hidden) return;
        instances.forEach(function (i) { if (i.state === "idle") setState(i, "sleepy"); });
        SoundFX.play("zzz");
      }, 150000);
    }
    ["pointerdown", "keydown", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, function () {
        instances.forEach(function (i) { if (i.state === "sleepy") setState(i, "idle"); });
        armSleep();
      }, { passive: true });
    });
    armSleep();

    /* global pointer: tracking + glance-at-click */
    document.addEventListener("pointermove", function (e) {
      var prevT = pointer.t || 0;
      onPointerMove(e);
      pointer.t = performance.now();
      void prevT;
    }, { passive: true });
    document.addEventListener("pointerdown", function (e) {
      glance = { x: e.clientX, y: e.clientY, until: performance.now() + 900 };
    }, { passive: true });
    if (window.matchMedia("(pointer: fine)").matches) {
      if (!trackRaf) trackRaf = requestAnimationFrame(trackLoop);
    }

    /* idle life */
    instances.forEach(function (i) { scheduleIdleLife(i); });

    /* dock visibility */
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
})();
