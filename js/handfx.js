/* ============================================================
   HANDFX — hand-tracked particle experience.
   Opt-in only: the camera is requested the moment this opens,
   never at page load. MediaPipe HandLandmarker (WASM) runs
   entirely on-device — video frames never leave the browser.
   Everything is cleaned up on close (camera tracks, rAF loop).

   Eight pickable modes (chips in the overlay, keys 1–8), each
   driven by the same four hand gestures:
     🤚 hover (plain hand)  -> the mode's signature hold
     ✊ fist                -> collapse … or a bolt strike in Thunder
     ✋ all fingers open     -> scatter impulse
     ✌️ index+middle         -> stream / fountain / launch

   Modes: portal · stream · sphere · burst · thunder · hearts ·
          fireflies · comet

   Test hook: open with ?handfx-test=1 to run a synthetic hand
   (no camera, no model download) — used for automated checks.
   ============================================================ */

(function () {
  "use strict";

  var MP_VERSION = "0.10.14";
  var BUNDLE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@" + MP_VERSION + "/vision_bundle.mjs";
  var WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@" + MP_VERSION + "/wasm";
  var MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

  /* ---- mode table: palette + per-mode particle budget + hint ---- */
  var MODES = [
    { id: "portal",    label: "Portal",    icon: "🌀", colors: ["#D9FF43", "#D9FF43", "#7C85FF", "#7C85FF", "#FFA86B"], count: 1600, hint: "Hold to ride the ring · ✊ collapse · ✋ scatter · ✌️ jets" },
    { id: "stream",    label: "Stream",    icon: "🛰️", colors: ["#D9FF43", "#7C85FF", "#7C85FF", "#F2EFE6", "#FFA86B"], count: 1500, hint: "✌️ aim the jet from your fingertips · ✊ pull it back" },
    { id: "sphere",    label: "Sphere",    icon: "🔮", colors: ["#7C85FF", "#7C85FF", "#D9FF43", "#F2EFE6", "#FF7A6B"], count: 1600, hint: "✊ spin the sphere · ✋ blow it apart · 🤚 loose orbit" },
    { id: "burst",     label: "Burst",     icon: "💥", colors: ["#FFA86B", "#FF7A6B", "#D9FF43", "#7C85FF", "#F2EFE6"], count: 1600, hint: "✋ open to detonate · 🤚 regroup · ✌️ fireworks" },
    { id: "thunder",   label: "Thunder",   icon: "⚡", colors: ["#F2EFE6", "#BFD4FF", "#7C85FF", "#F2EFE6", "#D9FF43"], count: 1400, hint: "🤚 charge the clouds · ✊ fist = bolt strike" },
    { id: "hearts",    label: "Hearts",    icon: "💗", colors: ["#FF6B8F", "#FF7A6B", "#FF9EB5", "#FFD1DC", "#D9FF43"], count: 900,  hint: "🤚 hearts orbit you · ✌️ fountain · ✊ implode & pop" },
    { id: "fireflies", label: "Fireflies", icon: "✨", colors: ["#D9FF43", "#C6E86B", "#FFD97A", "#9FE870", "#F2EFE6"], count: 1100, hint: "🤚 they flock to your palm · ✊ capture · ✋ release" },
    { id: "comet",     label: "Comet",     icon: "☄️", colors: ["#8FE8FF", "#F2EFE6", "#7C85FF", "#BFD4FF", "#D9FF43"], count: 1400, hint: "🤚 the comet orbits you · ✌️ aim & launch · ✊ call it home" }
  ];

  var FADE = "rgba(13, 14, 17, 0.34)";
  var MAX_SPEED = 22; /* px/frame — keeps streaks elegant, never smeared */

  /* ---------------- module state ---------------- */
  var dlg, canvas, ctx, statusEl, video, previewEl, liveEl;
  var state = "closed"; // closed | loading | camera | tracking | error
  var session = 0;
  var landmarker = null;
  var stream = null;
  var rafId = 0, lastTs = 0, lastVideoTime = -1, lastSeen = 0;
  var hand = null;            // smoothed hand state
  var rawGesture = "", rawStreak = 0, appliedGesture = "";
  var map = { ox: 0, oy: 0, s: 1 }; // video -> canvas cover mapping
  var testMode = false;

  var P = [];                 // particles
  var targetCount = 1600, count = 0;
  var perfAvg = 16, perfFrames = 0;
  var w = 0, h = 0, dpr = 1;
  var rot = 0;

  var modeIndex = 0;          // active MODES entry
  var COLORS = MODES[0].colors;
  var sprites = {};           // offscreen glow/heart sprites, keyed per color
  var bolts = [];             // thunder bolt polylines
  var flash = 0;              // thunder screen flash 0..1
  var shakeT = 0;             // thunder screen shake timer (s)
  var comet = null;           // comet entity { x, y, vx, vy }
  var sparks = [];            // tiny bright sparks (thunder/comet bursts)

  /* ---------------- helpers ---------------- */
  function dist2d(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function mode() { return MODES[modeIndex]; }

  function motionLevel() {
    var m = document.documentElement.getAttribute("data-motion");
    return m === "off" ? "off" : m === "reduced" ? "reduced" : "full";
  }

  function isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;
  }

  function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

  /* ---------------- particle engine ---------------- */
  function makeParticle(atX, atY) {
    var ci = Math.floor(Math.random() * COLORS.length);
    return {
      x: atX != null ? atX : Math.random() * w,
      y: atY != null ? atY : Math.random() * h,
      vx: 0, vy: 0,
      ph: Math.random() * Math.PI * 2,          // phase angle
      rr: Math.random(),                         // radial identity 0..1
      sp: 0.5 + Math.random() * 1.1,             // personal angular speed
      col: ci, a: 0.13 + Math.random() * 0.18,
      sz: 0.7 + Math.random() * 1.1,
      wa: Math.random() * Math.PI * 2,           // wander angle (fireflies)
      bl: 0.4 + Math.random() * 1.6,             // blink speed (fireflies)
      sx: 0, sy: 0, sz2: 0                       // unit-sphere coords (fist mode)
    };
  }

  function initSphere(p) {
    var u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2;
    var r = Math.sqrt(1 - u * u);
    p.sx = r * Math.cos(t); p.sy = u; p.sz2 = r * Math.sin(t);
  }

  function recolor() {
    /* paint every particle from the active mode's palette */
    for (var i = 0; i < P.length; i++) {
      P[i].col = Math.floor(Math.random() * COLORS.length);
    }
    P.sort(function (a, b) { return a.col - b.col; });
    sprites = {};
  }

  function setCount(n) {
    n = Math.round(n);
    while (P.length < n) {
      var p = makeParticle(null, null);
      initSphere(p);
      P.push(p);
    }
    if (P.length > n) P.length = n;
    count = P.length;
    /* keep colors grouped for cheap stroke batching */
    P.sort(function (a, b) { return a.col - b.col; });
  }

  function setMode(i) {
    modeIndex = ((i % MODES.length) + MODES.length) % MODES.length;
    var m = mode();
    COLORS = m.colors;
    targetCount = m.count;
    setCount(motionLevel() === "full" ? m.count : Math.round(m.count * 0.45));
    recolor();
    bolts = []; flash = 0; shakeT = 0; sparks = [];
    comet = m.id === "comet" ? { x: w / 2, y: h * 0.4, vx: 0, vy: 0, cool: 0 } : null;
    var chips = dlg ? dlg.querySelectorAll("[data-mode]") : [];
    for (var k = 0; k < chips.length; k++) {
      chips[k].setAttribute("aria-pressed", chips[k].getAttribute("data-mode") === m.id ? "true" : "false");
    }
    if (state === "tracking") setStatus(m.icon + " " + m.label + " — " + m.hint);
    if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play(m.id === "thunder" ? "simfail" : "section");
  }

  /* pre-rendered glow / heart sprites — far cheaper than per-particle paths */
  function sprite(color, kind) {
    var key = color + "|" + kind;
    if (sprites[key]) return sprites[key];
    var s = 34, c = document.createElement("canvas");
    c.width = s; c.height = s;
    var g = c.getContext("2d");
    if (kind === "heart") {
      g.translate(s / 2, s / 2);
      g.scale(s / 34, s / 34);
      g.beginPath();
      g.moveTo(0, 8);
      g.bezierCurveTo(-11, -2, -8, -11, 0, -5);
      g.bezierCurveTo(8, -11, 11, -2, 0, 8);
      g.closePath();
      g.fillStyle = color;
      g.shadowColor = color;
      g.shadowBlur = 5;
      g.fill();
      g.fill();
    } else { /* glow orb */
      var grd = g.createRadialGradient(s / 2, s / 2, 1, s / 2, s / 2, s / 2);
      grd.addColorStop(0, color);
      grd.addColorStop(0.35, color);
      grd.addColorStop(1, "rgba(13,14,17,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
    }
    sprites[key] = c;
    return c;
  }

  function makeBolt(x0, y0, x1, y1) {
    var pts = [], n = 13, i;
    for (i = 0; i <= n; i++) {
      var t = i / n;
      var jx = (Math.random() - 0.5) * 52 * (1 - Math.abs(t - 0.5) * 0.55);
      var jy = (Math.random() - 0.5) * 16;
      pts.push({ x: x0 + (x1 - x0) * t + jx, y: y0 + (y1 - y0) * t + jy });
    }
    return { pts: pts, life: 1, w: 1.6 + Math.random() * 1.8 };
  }

  function strike(palmX, palmY, big) {
    var i;
    for (i = 0; i < (big ? 3 : 1); i++) {
      bolts.push(makeBolt(palmX + (Math.random() - 0.5) * (big ? 180 : 70), -24,
                          palmX + (Math.random() - 0.5) * 40, palmY));
    }
    if (big) {
      flash = 1;
      shakeT = 0.32;
      for (i = 0; i < count; i++) {
        var p = P[i];
        var dx = p.x - palmX, dy = p.y - palmY;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var v = (1 - d / 320) * 14 + 3;
        p.vx += (dx / d) * v; p.vy += (dy / d) * v;
      }
      if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("thunder");
    }
  }

  function spawnSparks(x, y, n, col) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      sparks.push({ x: x, y: y, vx: Math.cos(a) * (1.5 + Math.random() * 4), vy: Math.sin(a) * (1.5 + Math.random() * 4), life: 0.5 + Math.random() * 0.5, col: col == null ? "#F2EFE6" : col });
    }
    if (sparks.length > 220) sparks.splice(0, sparks.length - 220);
  }

  function resize() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    var px = w * h * dpr * dpr;
    if (px > 2600000) dpr = Math.max(1, dpr * Math.sqrt(2600000 / px));
    canvas.width = Math.max(2, Math.round(w * dpr));
    canvas.height = Math.max(2, Math.round(h * dpr));
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0d0e11";
    ctx.fillRect(0, 0, w, h);
  }

  function computeTargets(dtSec, tSec, hd) {
    var g = hd ? hd.gesture : "idle";
    var cx = hd ? hd.x : w / 2;
    var cy = hd ? hd.y : h * 0.42;
    var R = hd ? Math.max(64, Math.min(hd.r, Math.min(w, h) * 0.42))
               : Math.min(w, h) * 0.26;
    var mid = mode().id;
    rot += dtSec * (g === "idle" ? 0.25 : 0.55);

    for (var i = 0; i < count; i++) {
      var p = P[i];

      if (mid === "portal") {
        if (g === "open") {
          var dx = p.x - cx, dy = p.y - cy;
          var d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < R * 2.4) {
            var f = (1 - d / (R * 2.4)) * 26 * dtSec;
            p.vx += (dx / d) * f; p.vy += (dy / d) * f;
          }
          p.vx *= 0.972; p.vy *= 0.972;
          if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
            p.vx += (w / 2 - p.x) * 0.004; p.vy += (h / 2 - p.y) * 0.004;
          }
        } else if (g === "fist") {
          var a = tSec * p.sp * 1.2 + p.ph;
          var ca = Math.cos(a), sa = Math.sin(a);
          var rx = p.sx * ca + p.sz2 * sa;
          var rz = -p.sx * sa + p.sz2 * ca;
          var tilt = 0.55;
          var ty2 = p.sy * Math.cos(tilt) - rz * Math.sin(tilt);
          var tz = p.sy * Math.sin(tilt) + rz * Math.cos(tilt);
          p.tx = cx + rx * R * 1.02;
          p.ty = cy + ty2 * R * 1.02;
          var k = 4.2;
          p.vx += (p.tx - p.x) * k * dtSec;
          p.vy += (p.ty - p.y) * k * dtSec;
          p.vx *= 0.87; p.vy *= 0.87;
        } else if (g === "stream" && hd && hd.emitter) {
          var ex = hd.emitter.x, ey = hd.emitter.y;
          var dx2 = p.x - ex, dy2 = p.y - ey;
          var d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
          if (d2 > 46) {
            p.vx += (ex - p.x) * 3.4 * dtSec;
            p.vy += (ey - p.y) * 3.4 * dtSec;
            p.vx *= 0.92; p.vy *= 0.92;
          }
          if (d2 < 90) {
            var pow = (1 - d2 / 90) * (130 + p.rr * 150) * dtSec;
            p.vx += hd.dir.x * pow + (Math.random() - 0.5) * 80 * dtSec;
            p.vy += hd.dir.y * pow + (Math.random() - 0.5) * 80 * dtSec;
          }
          p.vx *= 0.965; p.vy *= 0.965;
        } else {
          var ang = p.ph + rot * p.sp;
          var band = R * (0.78 + p.rr * 0.55);
          p.tx = cx + Math.cos(ang) * band * 1.28;
          p.ty = cy + Math.sin(ang) * band * 0.86;
          var k2 = g === "idle" ? 2.2 : 3.2;
          p.vx += (p.tx - p.x) * k2 * dtSec;
          p.vy += (p.ty - p.y) * k2 * dtSec;
          var tdx = p.ty - cy, tdy = -(p.tx - cx);
          var tl = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
          var sw = 13 * dtSec * p.sp;
          p.vx += (tdx / tl) * sw; p.vy += (tdy / tl) * sw;
          p.vx *= 0.88; p.vy *= 0.88;
        }

      } else if (mid === "thunder") {
        /* charged static: jittery particles orbit the palm, clouds above */
        var at = g === "idle" ? { x: w / 2, y: h * 0.3 } : { x: cx, y: cy };
        var ang2 = p.ph + rot * p.sp * 2.4;
        var band2 = R * (0.5 + p.rr * 0.9);
        p.tx = at.x + Math.cos(ang2) * band2;
        p.ty = at.y + Math.sin(ang2) * band2 * 0.7;
        var k3 = 3.6;
        p.vx += (p.tx - p.x) * k3 * dtSec;
        p.vy += (p.ty - p.y) * k3 * dtSec;
        p.vx += (Math.random() - 0.5) * 130 * dtSec; /* electric crackle */
        p.vy += (Math.random() - 0.5) * 130 * dtSec;
        p.vx *= 0.86; p.vy *= 0.86;
        if (g !== "idle" && Math.random() < dtSec * 8) spawnSparks(p.x, p.y, 1, "#BFD4FF");

      } else if (mid === "hearts") {
        /* hearts float up, fluttering; the palm is their anchor */
        if (g === "idle") {
          if (p.y < -20) { p.x = Math.random() * w; p.y = h + 20; p.vx = 0; p.vy = 0; }
          p.vy -= 14 * dtSec;                            /* buoyancy */
          p.vx += Math.sin(tSec * 1.6 + p.ph) * 26 * dtSec; /* flutter */
          p.vx *= 0.985; p.vy = Math.max(-6, p.vy * 0.99);
        } else {
          var hb = R * (0.4 + p.rr * 1.1);
          var ha = p.ph + rot * p.sp * 1.4;
          p.tx = cx + Math.cos(ha) * hb;
          p.ty = cy + Math.sin(ha) * hb * 0.8 - (g === "open" ? 0 : 10);
          p.vx += (p.tx - p.x) * 3 * dtSec;
          p.vy += (p.ty - p.y) * 3 * dtSec;
          if (g === "open") { p.vy -= 40 * dtSec; }
          p.vx *= 0.94; p.vy *= 0.94;
        }

      } else if (mid === "fireflies") {
        /* wanderers that flock to the palm; blink handled at render */
        var wa = p.wa + (Math.random() - 0.5) * 2.6 * dtSec;
        p.wa = wa;
        p.vx += Math.cos(wa) * 30 * dtSec;
        p.vy += Math.sin(wa) * 30 * dtSec;
        if (g !== "idle") {
          var fd = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy)) || 1;
          if (g === "fist") { /* capture: tight pull */
            p.vx += (cx - p.x) * 5.5 * dtSec;
            p.vy += (cy - p.y) * 5.5 * dtSec;
          } else if (g === "open" && fd < R * 2.2) {
            var ff = (1 - fd / (R * 2.2)) * 34 * dtSec;
            p.vx += ((p.x - cx) / fd) * ff; p.vy += ((p.y - cy) / fd) * ff;
          } else if (fd > R * 1.6) { /* flock toward the palm */
            p.vx += (cx - p.x) * 1.7 * dtSec;
            p.vy += (cy - p.y) * 1.7 * dtSec;
          }
        }
        p.vx *= 0.965; p.vy *= 0.965;

      } else if (mid === "comet") {
        /* stardust trails the comet; the palm is home base */
        var cActive = comet && comet.cool <= 0;
        var tx3 = cx, ty3 = cy;
        if (cActive) { tx3 = comet.x; ty3 = comet.y; }
        else if (g !== "idle" && hd && hd.emitter) { tx3 = hd.emitter.x; ty3 = hd.emitter.y; }
        var dx3 = p.x - tx3, dy3 = p.y - ty3;
        var d3 = Math.sqrt(dx3 * dx3 + dy3 * dy3) || 1;
        if (d3 > 40) {
          p.vx += (tx3 - p.x) * 3.2 * dtSec;
          p.vy += (ty3 - p.y) * 3.2 * dtSec;
        }
        if (d3 < 110 && cActive) {
          var pw = (1 - d3 / 110) * 90 * dtSec;
          p.vx -= comet.vx * 0.14 * dtSec * 60 + (Math.random() - 0.5) * 40 * dtSec;
          p.vy += (Math.random() - 0.5) * 40 * dtSec + pw * 0.2;
        }
        p.vx *= 0.955; p.vy *= 0.955;

      } else if (mid === "stream" && g === "stream" && hd && hd.emitter) {
        var ex2 = hd.emitter.x, ey2 = hd.emitter.y;
        var dx4 = p.x - ex2, dy4 = p.y - ey2;
        var d4 = Math.sqrt(dx4 * dx4 + dy4 * dy4) || 1;
        if (d4 > 46) {
          p.vx += (ex2 - p.x) * 3.4 * dtSec;
          p.vy += (ey2 - p.y) * 3.4 * dtSec;
          p.vx *= 0.92; p.vy *= 0.92;
        }
        if (d4 < 90) {
          var pw2 = (1 - d4 / 90) * (130 + p.rr * 150) * dtSec;
          p.vx += hd.dir.x * pw2 + (Math.random() - 0.5) * 80 * dtSec;
          p.vy += hd.dir.y * pw2 + (Math.random() - 0.5) * 80 * dtSec;
        }
        p.vx *= 0.965; p.vy *= 0.965;

      } else if (mid === "sphere") {
        if (g === "fist" || g === "idle") {
          var a2 = tSec * p.sp * 1.2 + p.ph;
          var ca2 = Math.cos(a2), sa2 = Math.sin(a2);
          var rx2 = p.sx * ca2 + p.sz2 * sa2;
          var rz2 = -p.sx * sa2 + p.sz2 * ca2;
          var tilt2 = 0.55;
          var ty3 = p.sy * Math.cos(tilt2) - rz2 * Math.sin(tilt2);
          var tz3 = p.sy * Math.sin(tilt2) + rz2 * Math.cos(tilt2);
          var cxx = g === "idle" ? w / 2 : cx, cyy = g === "idle" ? h * 0.42 : cy;
          p.tx = cxx + rx2 * R * 1.02;
          p.ty = cyy + ty3 * R * 1.02;
          var k4 = 4.2;
          p.vx += (p.tx - p.x) * k4 * dtSec;
          p.vy += (p.ty - p.y) * k4 * dtSec;
          p.vx *= 0.87; p.vy *= 0.87;
        } else {
          var dx5 = p.x - cx, dy5 = p.y - cy;
          var d5 = Math.sqrt(dx5 * dx5 + dy5 * dy5) || 1;
          if (d5 < R * 2.4) {
            var f2 = (1 - d5 / (R * 2.4)) * 30 * dtSec;
            p.vx += (dx5 / d5) * f2; p.vy += (dy5 / d5) * f2;
          }
          p.vx *= 0.972; p.vy *= 0.972;
          if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
            p.vx += (w / 2 - p.x) * 0.004; p.vy += (h / 2 - p.y) * 0.004;
          }
        }

      } else if (mid === "burst") {
        if (g === "idle" || g === "ring" || g === "stream") {
          var ang3 = p.ph + rot * p.sp * 1.1;
          var band3 = R * (0.62 + p.rr * 0.5);
          p.tx = cx + Math.cos(ang3) * band3;
          p.ty = cy + Math.sin(ang3) * band3;
          p.vx += (p.tx - p.x) * 3 * dtSec;
          p.vy += (p.ty - p.y) * 3 * dtSec;
          p.vx *= 0.9; p.vy *= 0.9;
        } else if (g === "fist") {
          p.vx += (cx - p.x) * 4.6 * dtSec;
          p.vy += (cy - p.y) * 4.6 * dtSec;
          p.vx *= 0.86; p.vy *= 0.86;
        } else {
          var dx6 = p.x - cx, dy6 = p.y - cy;
          var d6 = Math.sqrt(dx6 * dx6 + dy6 * dy6) || 1;
          if (d6 < R * 2.6) {
            var f3 = (1 - d6 / (R * 2.6)) * 30 * dtSec;
            p.vx += (dx6 / d6) * f3; p.vy += (dy6 / d6) * f3;
          }
          p.vx *= 0.972; p.vy *= 0.972;
          if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
            p.vx += (w / 2 - p.x) * 0.004; p.vy += (h / 2 - p.y) * 0.004;
          }
        }
      }
    }

    /* ---- special entities ---- */
    if (mid === "comet" && comet) {
      if (comet.cool > 0) comet.cool -= dtSec;
      if (comet.cool <= 0 && !comet.free) {
        /* orbit the palm / emitter until launched */
        var ox = (hd && hd.emitter) ? hd.emitter.x : (hd ? hd.x : w / 2);
        var oy = (hd && hd.emitter) ? hd.emitter.y : (hd ? hd.y : h * 0.4);
        var oa = tSec * 1.9;
        comet.vx += (ox + Math.cos(oa) * R * 1.1 - comet.x) * 3.4 * dtSec;
        comet.vy += (oy + Math.sin(oa) * R * 1.1 - comet.y) * 3.4 * dtSec;
        comet.vx *= 0.9; comet.vy *= 0.9;
      } else {
        comet.vx *= 0.995; comet.vy *= 0.995;
      }
      comet.x += comet.vx * Math.min(2.2, dtSec * 60);
      comet.y += comet.vy * Math.min(2.2, dtSec * 60);
      if (comet.x < -60 || comet.x > w + 60 || comet.y < -60 || comet.y > h + 60) {
        spawnSparks(clamp(comet.x, 0, w), clamp(comet.y, 0, h), 60, "#8FE8FF");
        if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("sparkle");
        comet.x = hd ? hd.x : w / 2; comet.y = hd ? hd.y : h * 0.4;
        comet.vx = 0; comet.vy = 0; comet.free = false; comet.cool = 0.6;
      }
    }
    if (mid === "thunder") {
      var bi;
      for (bi = bolts.length - 1; bi >= 0; bi--) {
        bolts[bi].life -= dtSec * 2.4;
        if (bolts[bi].life <= 0) bolts.splice(bi, 1);
      }
      flash *= Math.pow(0.02, dtSec);
      if (shakeT > 0) shakeT -= dtSec;
      if (hd && hd.emitter && Math.random() < dtSec * 6) spawnSparks(hd.emitter.x, hd.emitter.y, 2, "#BFD4FF");
    }
    for (var si = sparks.length - 1; si >= 0; si--) {
      var sk = sparks[si];
      sk.life -= dtSec;
      sk.x += sk.vx; sk.y += sk.vy;
      sk.vx *= 0.94; sk.vy *= 0.94;
      if (sk.life <= 0) sparks.splice(si, 1);
    }
  }

  function integrate(dtSec) {
    var cap = mode().id === "fireflies" ? 7 : MAX_SPEED;
    var step = Math.min(2.2, dtSec * 60);
    for (var i = 0; i < count; i++) {
      var p = P[i];
      var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (sp > cap) {
        p.vx = (p.vx / sp) * cap;
        p.vy = (p.vy / sp) * cap;
      }
      p.x += p.vx * step;
      p.y += p.vy * step;
      if (p.x < -80) p.x = -80; if (p.x > w + 80) p.x = w + 80;
      if (p.y < -80) p.y = -80; if (p.y > h + 80) p.y = h + 80;
    }
  }

  function render() {
    ctx.save();
    if (shakeT > 0) {
      ctx.translate((Math.random() - 0.5) * shakeT * 22, (Math.random() - 0.5) * shakeT * 22);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = FADE;
    ctx.fillRect(-30, -30, w + 60, h + 60);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    var mid = mode().id;
    var i = 0;

    if (mid === "hearts") {
      /* heart sprites */
      while (i < count) {
        var hc = P[i].col;
        var hj = i;
        while (hj < count && P[hj].col === hc) hj++;
        var himg = sprite(COLORS[hc], "heart");
        for (var hk = i; hk < hj; hk++) {
          var hp = P[hk];
          var hs = 6 + hp.sz * 2.6;
          ctx.globalAlpha = Math.min(0.8, hp.a * 1.25);
          ctx.save();
          ctx.translate(hp.x, hp.y);
          ctx.rotate(Math.sin(hp.ph + hp.x * 0.01) * 0.35);
          ctx.drawImage(himg, -hs, -hs, hs * 2, hs * 2);
          ctx.restore();
        }
        i = hj;
      }
    } else if (mid === "fireflies") {
      /* blinking glow orbs */
      var tNow = performance.now() / 1000;
      while (i < count) {
        var fc = P[i].col;
        var fj = i;
        while (fj < count && P[fj].col === fc) fj++;
        var fimg = sprite(COLORS[fc], "glow");
        for (var fk = i; fk < fj; fk++) {
          var fp = P[fk];
          var blink = 0.35 + 0.65 * Math.max(0, Math.sin(tNow * fp.bl + fp.ph));
          var fs = 4 + fp.sz * 2.6;
          ctx.globalAlpha = fp.a * 2.6 * blink;
          ctx.drawImage(fimg, fp.x - fs, fp.y - fs, fs * 2, fs * 2);
        }
        i = fj;
      }
    } else {
      /* contiguous color runs (particles pre-sorted) */
      while (i < count) {
        var col = P[i].col;
        var j = i;
        while (j < count && P[j].col === col) j++;
        ctx.strokeStyle = COLORS[col];
        for (var k2 = i; k2 < j; k2++) {
          var p = P[k2];
          ctx.globalAlpha = p.a;
          ctx.lineWidth = p.sz;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 1.45, p.y - p.vy * 1.45);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        i = j;
      }
    }

    /* comet core + stardust glow */
    if (mid === "comet" && comet) {
      var cimg = sprite("#8FE8FF", "glow");
      ctx.globalAlpha = 0.95;
      ctx.drawImage(cimg, comet.x - 26, comet.y - 26, 52, 52);
    }

    /* sparks */
    for (var sk2 = 0; sk2 < sparks.length; sk2++) {
      var s2 = sparks[sk2];
      ctx.globalAlpha = Math.min(1, s2.life * 1.6);
      ctx.strokeStyle = s2.col;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s2.x - s2.vx * 2, s2.y - s2.vy * 2);
      ctx.lineTo(s2.x, s2.y);
      ctx.stroke();
    }

    /* thunder bolts + flash */
    if (mid === "thunder") {
      for (var b2 = 0; b2 < bolts.length; b2++) {
        var bl = bolts[b2];
        ctx.globalAlpha = Math.min(1, bl.life);
        ctx.strokeStyle = "#EAF2FF";
        ctx.lineWidth = bl.w * 3.2;
        ctx.beginPath();
        ctx.moveTo(bl.pts[0].x, bl.pts[0].y);
        for (var bp = 1; bp < bl.pts.length; bp++) ctx.lineTo(bl.pts[bp].x, bl.pts[bp].y);
        ctx.stroke();
        ctx.strokeStyle = "#F2EFE6";
        ctx.lineWidth = bl.w;
        ctx.stroke();
      }
      if (flash > 0.02) {
        ctx.globalAlpha = Math.min(0.55, flash * 0.55);
        ctx.fillStyle = "#EAF2FF";
        ctx.fillRect(-30, -30, w + 60, h + 60);
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  function risingEdge(prev, next) {
    if (prev === next) return;
    var mid = mode().id;
    var fx = hand ? hand.x : w / 2, fy = hand ? hand.y : h / 2;

    if (next === "open" && hand) {
      /* scatter impulse from the palm */
      for (var i = 0; i < count; i++) {
        var p = P[i];
        var dx = p.x - hand.x, dy = p.y - hand.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var v = 5 + Math.random() * 9;
        p.vx += (dx / d) * v; p.vy += (dy / d) * v;
      }
      window.SoundPop && window.SoundPop();
      if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play(mid === "hearts" ? "sparkle" : "chime");
      if (mid === "thunder") strike(fx, fy, false);
    } else if (next === "fist") {
      for (var j = 0; j < count; j++) {
        var q = P[j];
        q.vx += (hand ? hand.x - q.x : 0) * 0.05;
        q.vy += (hand ? hand.y - q.y : 0) * 0.05;
      }
      if (mid === "thunder") strike(fx, fy, true); /* THE bolt */
      if (mid === "hearts" && window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("pop");
      if (window.Byte && window.Byte.SoundFX && mid !== "thunder" && mid !== "hearts") window.Byte.SoundFX.play("pop");
    } else if (next === "stream") {
      if (mid === "comet" && comet && hand && hand.emitter) {
        /* launch the comet along the finger direction */
        comet.x = hand.emitter.x; comet.y = hand.emitter.y;
        comet.vx = (hand.dir ? hand.dir.x : 1) * 26;
        comet.vy = (hand.dir ? hand.dir.y : 0.4) * 26;
        comet.free = true;
        spawnSparks(comet.x, comet.y, 40, "#8FE8FF");
        if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("launch");
      } else if (mid === "hearts" && window.Byte && window.Byte.SoundFX) {
        window.Byte.SoundFX.play("sparkle");
      } else if (mid === "thunder" && hand && hand.emitter) {
        strike(hand.emitter.x, hand.emitter.y, false);
      } else if (window.Byte && window.Byte.SoundFX) {
        window.Byte.SoundFX.play("chime");
      }
    }
  }

  /* ---------------- hand state ---------------- */
  function classify(lm) {
    function d(a, b) {
      var dx = lm[a].x - lm[b].x, dy = lm[a].y - lm[b].y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    var size = d(0, 9);
    if (!(size > 0.01)) return null;
    function ext(tip, pip) { return d(tip, 0) > d(pip, 0) * 1.12; }
    var index = ext(8, 6), middle = ext(12, 10), ring = ext(16, 14), pinky = ext(20, 18);
    var n = (index ? 1 : 0) + (middle ? 1 : 0) + (ring ? 1 : 0) + (pinky ? 1 : 0);
    var gesture = "ring";
    if (n === 0) gesture = "fist";
    else if (n >= 4) gesture = "open";
    else if (index && middle && !ring && !pinky) gesture = "stream";

    var cx = 0, cy = 0, ids = [0, 5, 9, 13, 17];
    for (var i = 0; i < ids.length; i++) { cx += lm[ids[i]].x; cy += lm[ids[i]].y; }
    cx /= ids.length; cy /= ids.length;

    var out = { x: 1 - cx, y: cy, r: size * 2.6, gesture: gesture };
    if (gesture === "stream") {
      var ex = 1 - (lm[8].x + lm[12].x) / 2;
      var ey = (lm[8].y + lm[12].y) / 2;
      var dxv = (lm[8].x - lm[5].x) + (lm[12].x - lm[9].x);
      var dyv = (lm[8].y - lm[5].y) + (lm[12].y - lm[9].y);
      var dl = Math.sqrt(dxv * dxv + dyv * dyv) || 1;
      out.emitter = { x: ex, y: ey };
      out.dir = { x: dxv / dl, y: dyv / dl };
    }
    return out;
  }

  function mapHand(st) {
    /* normalized video coords -> cover-fit canvas coords (already mirrored) */
    var vw = map.vw || 640, vh = map.vh || 480;
    var x = st.x * vw * map.s - map.ox;
    var y = st.y * vh * map.s - map.oy;
    var out = {
      x: clamp(x, -60, w + 60),
      y: clamp(y, -60, h + 60),
      r: st.r * vw * map.s * 0.62,
      gesture: st.gesture,
      emitter: st.emitter ? { x: st.emitter.x * vw * map.s - map.ox, y: st.emitter.y * vh * map.s - map.oy } : null,
      dir: st.dir
    };
    out.r = clamp(out.r, 46, Math.min(w, h) * 0.42);
    return out;
  }

  function smoothHand(next) {
    if (!hand) {
      hand = JSON.parse(JSON.stringify(next));
      if (next.emitter) hand.emitter = { x: next.emitter.x, y: next.emitter.y };
      return;
    }
    hand.x = lerp(hand.x, next.x, 0.4);
    hand.y = lerp(hand.y, next.y, 0.4);
    hand.r = lerp(hand.r, next.r, 0.2);
    hand.gesture = next.gesture;
    if (next.emitter && hand.emitter) {
      hand.emitter.x = lerp(hand.emitter.x, next.emitter.x, 0.4);
      hand.emitter.y = lerp(hand.emitter.y, next.emitter.y, 0.4);
    } else if (next.emitter) hand.emitter = next.emitter;
    hand.dir = next.dir || hand.dir;
  }

  /* ---------------- synthetic hand (test mode) ---------------- */
  function testHand(tSec) {
    var cycle = 10.4;
    var t = tSec % cycle;
    var gesture = t < 2.4 ? "ring" : t < 4.6 ? "open" : t < 7.4 ? "fist" : "stream";
    var x = w * (0.5 + 0.2 * Math.sin(tSec * 0.8));
    var y = h * (0.44 + 0.14 * Math.sin(tSec * 1.25 + 1.2));
    var r = Math.min(w, h) * 0.17;
    var out = { x: x, y: y, r: r, gesture: gesture };
    if (gesture === "stream") {
      var a = tSec * 1.4;
      out.emitter = { x: x + Math.cos(a) * r * 1.1, y: y + Math.sin(a) * r * 1.1 };
      out.dir = { x: Math.cos(a + 1.2), y: Math.sin(a + 1.2) };
    }
    return out;
  }

  /* ---------------- main loop ---------------- */
  function loop(ts) {
    if (state !== "tracking") return;
    rafId = requestAnimationFrame(loop);
    var dtMs = Math.min(60, ts - (lastTs || ts));
    lastTs = ts;
    var dtSec = dtMs / 1000;

    var detected = null;
    if (testMode) {
      detected = testHand(ts / 1000);
      lastSeen = ts;
    } else if (video && video.readyState >= 2 && video.videoWidth > 0 && landmarker) {
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        try {
          var res = landmarker.detectForVideo(video, performance.now());
          if (res && res.landmarks && res.landmarks.length) {
            detected = classify(res.landmarks[0]);
            if (detected) lastSeen = ts;
          }
        } catch (e) { /* transient detector hiccup — keep previous state */ }
      }
      if (ts - lastSeen > 1700) {
        detected = null;
        setStatus(mode().icon + " " + mode().label + " — show your hand ✋");
      } else if (detected) {
        setStatus(mode().icon + " " + mode().label + " — " + mode().hint);
      }
    }

    if (detected) {
      var mapped = testMode ? { x: detected.x, y: detected.y, r: detected.r, gesture: detected.gesture, emitter: detected.emitter, dir: detected.dir } : mapHand(detected);
      var candidate = mapped.gesture;
      if (candidate === rawGesture) rawStreak++;
      else { rawGesture = candidate; rawStreak = 1; }
      if (rawStreak >= 3 && candidate !== appliedGesture) {
        risingEdge(appliedGesture, candidate);
        appliedGesture = candidate;
      }
      smoothHand(mapped);
    }

    computeTargets(dtSec, ts / 1000, (detected || (ts - lastSeen < 1700)) ? hand : null);
    integrate(dtSec);
    render();

    /* adaptive quality */
    perfAvg = perfAvg * 0.95 + dtMs * 0.05;
    if (++perfFrames % 120 === 0) {
      var floor = motionLevel() === "full" ? 700 : 420;
      if (perfAvg > 27 && count > floor) setCount(count - 140);
      else if (perfAvg < 15 && count < targetCount) setCount(count + 140);
    }
  }

  /* ---------------- video mapping ---------------- */
  function updateMapping() {
    map.vw = (video && video.videoWidth) || 640;
    map.vh = (video && video.videoHeight) || 480;
    map.s = Math.max(w / map.vw, h / map.vh);
    map.ox = (map.vw * map.s - w) / 2;
    map.oy = (map.vh * map.s - h) / 2;
  }

  /* ---------------- lifecycle ---------------- */
  function bindDom() {
    dlg = document.getElementById("handfx-overlay");
    if (!dlg || dlg.dataset.bound) return;
    dlg.dataset.bound = "1";
    canvas = document.getElementById("handfx-canvas");
    statusEl = document.getElementById("handfx-status");
    video = document.getElementById("handfx-video");
    previewEl = document.getElementById("handfx-preview");
    liveEl = previewEl ? previewEl.querySelector(".handfx__live") : null;
    dlg.addEventListener("close", cleanup);
    dlg.querySelector("[data-handfx-close]").addEventListener("click", function () { dlg.close(); });
    /* mode picker chips + number keys */
    var chips = dlg.querySelectorAll("[data-mode]");
    for (var i = 0; i < chips.length; i++) {
      (function (chip, idx) {
        chip.addEventListener("click", function () { setMode(idx); });
      })(chips[i], i);
    }
    dlg.addEventListener("keydown", function (e) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= MODES.length) { setMode(n - 1); e.preventDefault(); }
    });
    /* note: no setMode here — the canvas has no dimensions until open()
       resizes; particles would all spawn at (0,0). open() calls setMode. */
  }

  function open() {
    bindDom();
    if (!dlg || state !== "closed") return;
    if (motionLevel() === "off" && !/[?&]handfx-test=1/.test(location.search)) {
      window.appToast && window.appToast("Motion is set to Off — switch to Full or Reduced in Settings to use hand control.");
      return;
    }
    testMode = /[?&]handfx-test=1/.test(location.search);
    session++;
    dlg.showModal();
    /* measure AFTER the dialog has layout — clientWidth is 0 while display:none */
    resize();
    setMode(modeIndex);
    /* settle once more in case the viewport finalizes a frame later */
    requestAnimationFrame(function () {
      if (dlg.open && state !== "closed") {
        resize();
        if (!testMode) updateMapping();
      }
    });
    if (window.Byte) window.Byte.celebrateAll();

    if (testMode) {
      if (previewEl) previewEl.classList.add("handfx__preview--demo");
      if (liveEl) liveEl.textContent = "DEMO";
      state = "tracking";
      appliedGesture = ""; rawGesture = ""; rawStreak = 0; hand = null;
      setStatus(mode().icon + " " + mode().label + " — demo hand driving the particles. Pick a mode below!");
      lastTs = 0;
      rafId = requestAnimationFrame(loop);
      return;
    }

    loadAndTrack(session);
  }

  function loadAndTrack(mySession) {
    state = "loading";
    setStatus("Loading the hand-tracking engine (~6 MB, cached after this)…");
    var importPromise;
    try {
      importPromise = import(BUNDLE_URL);
    } catch (e) {
      fail("Couldn't load the hand-tracking engine. Check your connection and reopen.");
      return;
    }
    importPromise.then(function (vision) {
      if (mySession !== session) return;
      return vision.FilesetResolver.forVisionTasks(WASM_PATH).then(function (fileset) {
        if (mySession !== session) return;
        var opts = function (delegate) {
          return {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: delegate },
            numHands: 1, runningMode: "VIDEO",
            minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5
          };
        };
        return vision.HandLandmarker.createFromOptions(fileset, opts("GPU"))
          .catch(function () { return vision.HandLandmarker.createFromOptions(fileset, opts("CPU")); });
      });
    }).then(function (created) {
      if (mySession !== session) { if (created && created.close) created.close(); return; }
      landmarker = created;
      return requestCamera(mySession);
    }).catch(function (err) {
      if (mySession !== session) return;
      if (err && /permission|NotAllowed/i.test(err && err.message)) {
        fail("Camera permission was declined. Allow access in your browser and reopen.");
      } else {
        fail("Couldn't load the hand-tracking engine. Check your connection and reopen.");
      }
    });
  }

  function requestCamera(mySession) {
    state = "camera";
    setStatus("Allow camera access when your browser asks…");
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    }).then(function (s) {
      if (mySession !== session) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s;
      video.srcObject = s;
      return new Promise(function (resolve) {
        if (video.readyState >= 1 && video.videoWidth) resolve();
        else video.onloadedmetadata = function () { resolve(); };
      });
    }).then(function () {
      if (mySession !== session) return;
      if (previewEl) previewEl.classList.remove("handfx__preview--demo");
      if (liveEl) liveEl.textContent = "LIVE";
      updateMapping();
      video.play && video.play().catch(function () {});
      state = "tracking";
      appliedGesture = ""; rawGesture = ""; rawStreak = 0; hand = null; lastSeen = performance.now();
      setStatus(mode().icon + " " + mode().label + " — " + mode().hint);
      lastTs = 0;
      rafId = requestAnimationFrame(loop);
    }).catch(function (err) {
      if (mySession !== session) return;
      if (err && err.name === "NotAllowedError") fail("Camera permission was declined. Allow access in your browser and reopen.");
      else if (err && err.name === "NotFoundError") fail("No camera was found on this device.");
      else if (err && err.name === "NotReadableError") fail("Your camera is busy in another app. Close it and reopen.");
      else fail("Camera couldn't start. Check permissions and reopen.");
    });
  }

  function fail(msg) {
    state = "error";
    setStatus(msg);
  }

  function cleanup() {
    session++;
    state = "closed";
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
    }
    if (video) video.srcObject = null;
    lastVideoTime = -1;
    hand = null;
    bolts = []; sparks = []; flash = 0; shakeT = 0; comet = null;
    appliedGesture = ""; rawGesture = ""; rawStreak = 0;
    if (previewEl) previewEl.classList.remove("handfx__preview--demo");
    if (liveEl) liveEl.textContent = "LIVE";
    /* particles settle back into a calm ring for next time */
    if (ctx && w) { ctx.fillStyle = "#0d0e11"; ctx.fillRect(0, 0, w, h); }
  }

  document.addEventListener("visibilitychange", function () {
    if (!dlg || !dlg.open) return;
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    } else if (state === "tracking") {
      lastTs = 0;
      rafId = requestAnimationFrame(loop);
    }
  });

  window.addEventListener("resize", function () {
    if (dlg && dlg.open) { resize(); updateMapping(); }
  });

  window.HandFX = {
    open: open,
    close: function () { if (dlg && dlg.open) dlg.close(); },
    isSupported: function () { return testMode || isSupported(); },
    _engine: {
      setCount: setCount,
      resize: resize,
      setMode: setMode,
      stats: function () { return { state: state, count: count, w: w, h: h, perfAvg: Math.round(perfAvg), mode: mode().id, modeLabel: mode().label,
        hand: hand ? { x: Math.round(hand.x), y: Math.round(hand.y), g: hand.gesture } : null }; }
    }
  };
})();
