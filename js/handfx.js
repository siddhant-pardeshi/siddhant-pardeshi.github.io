/* ============================================================
   HANDFX — hand-tracked particle experience.
   Opt-in only: the camera is requested the moment this opens,
   never at page load. MediaPipe HandLandmarker (WASM) runs
   entirely on-device — video frames never leave the browser.
   Everything is cleaned up on close (camera tracks, rAF loop).

   Gestures:
     🤚 open palm hover  -> portal ring follows the hand
     ✋ all fingers open  -> burst & scatter (rising edge impulse)
     ✊ fist             -> particles collapse into a swirling sphere
     ✌️ index+middle     -> signal stream from the fingertips

   Test hook: open with ?handfx-test=1 to run a synthetic hand
   (no camera, no model download) — used for automated checks.
   ============================================================ */

(function () {
  "use strict";

  var MP_VERSION = "0.10.14";
  var BUNDLE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@" + MP_VERSION + "/vision_bundle.mjs";
  var WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@" + MP_VERSION + "/wasm";
  var MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

  var COLORS = ["#D9FF43", "#D9FF43", "#D9FF43", "#7C85FF", "#7C85FF", "#FFA86B"];
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

  /* ---------------- helpers ---------------- */
  function dist2d(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

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
      sx: 0, sy: 0, sz2: 0                       // unit-sphere coords (fist mode)
    };
  }

  function initSphere(p) {
    var u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2;
    var r = Math.sqrt(1 - u * u);
    p.sx = r * Math.cos(t); p.sy = u; p.sz2 = r * Math.sin(t);
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
    var mode = hd ? hd.gesture : "idle";
    var cx = hd ? hd.x : w / 2;
    var cy = hd ? hd.y : h * 0.42;
    var R = hd ? Math.max(64, Math.min(hd.r, Math.min(w, h) * 0.42))
               : Math.min(w, h) * 0.26;
    rot += dtSec * (mode === "idle" ? 0.25 : 0.55);

    for (var i = 0; i < count; i++) {
      var p = P[i];
      if (mode === "open") {
        /* free flight — impulse was applied on the rising edge;
           palm gently pushes nearby particles outward */
        var dx = p.x - cx, dy = p.y - cy;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < R * 2.4) {
          var f = (1 - d / (R * 2.4)) * 26 * dtSec;
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        }
        p.vx *= 0.972; p.vy *= 0.972;
        /* soft recall so the swarm never drains off-screen */
        if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
          p.vx += (w / 2 - p.x) * 0.004; p.vy += (h / 2 - p.y) * 0.004;
        }
      } else if (mode === "fist") {
        /* swirling sphere */
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
      } else if (mode === "stream" && hd && hd.emitter) {
        /* comet from the fingertips */
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
        /* ring / portal (also idle) */
        var ang = p.ph + rot * p.sp;
        var band = R * (0.78 + p.rr * 0.55);
        p.tx = cx + Math.cos(ang) * band * 1.28;
        p.ty = cy + Math.sin(ang) * band * 0.86;
        var k2 = mode === "idle" ? 2.2 : 3.2;
        p.vx += (p.tx - p.x) * k2 * dtSec;
        p.vy += (p.ty - p.y) * k2 * dtSec;
        /* tangential swirl */
        var tdx = p.ty - cy, tdy = -(p.tx - cx);
        var tl = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
        var sw = 13 * dtSec * p.sp;
        p.vx += (tdx / tl) * sw; p.vy += (tdy / tl) * sw;
        p.vx *= 0.88; p.vy *= 0.88;
      }
    }
  }

  function integrate(dtSec) {
    var step = Math.min(2.2, dtSec * 60);
    for (var i = 0; i < count; i++) {
      var p = P[i];
      var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (sp > MAX_SPEED) {
        p.vx = (p.vx / sp) * MAX_SPEED;
        p.vy = (p.vy / sp) * MAX_SPEED;
      }
      p.x += p.vx * step;
      p.y += p.vy * step;
      if (p.x < -80) p.x = -80; if (p.x > w + 80) p.x = w + 80;
      if (p.y < -80) p.y = -80; if (p.y > h + 80) p.y = h + 80;
    }
  }

  function render() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = FADE;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    /* contiguous color runs (particles pre-sorted) */
    var i = 0;
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
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function risingEdge(prev, next) {
    if (prev === next) return;
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
      if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("chime");
    } else if (next === "fist") {
      for (var j = 0; j < count; j++) {
        var q = P[j];
        q.vx += (hand ? hand.x - q.x : 0) * 0.05;
        q.vy += (hand ? hand.y - q.y : 0) * 0.05;
      }
      if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play("pop");
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
        setStatus("Show your hand to the camera ✋");
      } else if (detected) {
        setStatus("Hand locked — try the gestures below ✨");
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
      var floor = motionLevel() === "full" ? 1100 : 500;
      if (perfAvg > 27 && count > floor) setCount(count - 160);
      else if (perfAvg < 15 && count < targetCount) setCount(count + 160);
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
    setCount(motionLevel() === "full" ? targetCount : Math.round(targetCount * 0.45));
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
      setStatus("Demo mode — a synthetic hand is driving the particles.");
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
      setStatus("Looking for a hand… raise it toward the camera ✋");
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
      stats: function () { return { state: state, count: count, w: w, h: h, perfAvg: Math.round(perfAvg), hand: hand ? { x: Math.round(hand.x), y: Math.round(hand.y), g: hand.gesture } : null }; }
    }
  };
})();
