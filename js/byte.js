/* ============================================================
   BYTE — capybara guide. Character rig v3.
   - 15 emotional states: idle greeting happy surprised thinking
     celebrate love dizzy excited dance curious guiding sleepy
     angry hyped (v3 bold additions)
   - v3: bold emotions with signature animations (angry steam +
     shake, hyped star-eyes + zaps + hop, curious head-tilt +
     floating "?", bigger happy bounce, love sway)
   - v3: ROAM — the dock Byte strolls along the bottom edge of the
     page between sections, with footsteps, dust puffs and direction
     flipping. Pauses for dialogs, hidden tabs, reduced motion.
   - Body language: cursor lean, ear perk/droop/twitch, look-around
   - Reactions: click combos (tap→double→triple→DANCE), petting
     (rub back & forth over him), fast-cursor surprise, glance
     toward any click on the page
   - Sound: ON by default (mute to turn off) — WebAudio score, local:
     chirps, purr, boing,
     jingle + v3 voices: yay, grr, hmm, hyped run, footsteps
   - Public API unchanged + Byte.dance(), Byte.emote(), Byte.roam(),
     Byte.roamStop(), Byte.debug
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
    +       '<g class="byte-eye-angry" stroke="#101114" stroke-width="3.4" fill="none" stroke-linecap="round">'
    +         '<path d="M75,87 l17,7"/>'
    +         '<path d="M137,83 l-17,7"/>'
    +       '</g>'
    +       '<g class="byte-eye-angry-pupil" fill="#101114">'
    +         '<circle cx="87" cy="100" r="4.6"/>'
    +         '<circle cx="125" cy="96" r="4.6"/>'
    +       '</g>'
    +       '<g class="byte-eye-star" fill="#FFD23F" stroke="#101114" stroke-width="2" stroke-linejoin="round">'
    +         '<path d="M86,88 l2.3,4.7 5.1,0.8 -3.7,3.6 0.9,5.1 -4.6,-2.4 -4.6,2.4 0.9,-5.1 -3.7,-3.6 5.1,-0.8 z"/>'
    +         '<path d="M126,84 l2.3,4.7 5.1,0.8 -3.7,3.6 0.9,5.1 -4.6,-2.4 -4.6,2.4 0.9,-5.1 -3.7,-3.6 5.1,-0.8 z"/>'
    +       '</g>'
    +     '</g>'
    /* noses + mouths */
    +     '<rect x="152" y="94" width="17" height="11" rx="5.5" fill="#2a1c12" stroke="#101114" stroke-width="2"/>'
    +     '<path class="byte-mouth" d="M150,116 q7,6 14,1" fill="none" stroke="#101114" stroke-width="3" stroke-linecap="round"/>'
    +     '<ellipse class="byte-mouth-o" cx="157" cy="118" rx="4.5" ry="5.5" fill="#7a4a2b" stroke="#101114" stroke-width="2.4"/>'
    +     '<path class="byte-mouth-open" d="M148,115 q8,10 16,0 z" fill="#7a4a2b" stroke="#101114" stroke-width="2.6" stroke-linejoin="round"/>'
    +     '<path class="byte-mouth-frown" d="M147,121 q9,-8 18,-3" fill="none" stroke="#101114" stroke-width="3" stroke-linecap="round"/>'
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
    +     '<g class="byte-display-face byte-display-angry" hidden>'
    +       '<path d="M96,142 l7,4 M118,142 l-7,4" fill="none" stroke="#FF7A6B" stroke-width="2.8" stroke-linecap="round"/>'
    +       '<path d="M100,157 q7,-6 14,0" fill="none" stroke="#FF7A6B" stroke-width="2.8" stroke-linecap="round"/>'
    +     '</g>'
    +     '<g class="byte-display-face byte-display-spark" hidden>'
    +       '<path d="M109,140 l-6,9 4.5,0 -4,9 10,-12 -4.5,0 3.5,-6 z" fill="#D9FF43"/>'
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
    + '<text class="byte-qmark" x="156" y="46" font-size="30" fill="#4B57FF" font-family="Space Grotesk, system-ui, sans-serif" font-weight="700">?</text>'
    + '<g class="byte-steam" fill="#cfd6e0">'
    +   '<circle cx="54" cy="54" r="7"/>'
    +   '<circle cx="148" cy="50" r="6"/>'
    + '</g>'
    + '<g class="byte-zap" fill="#FFD23F" stroke="#101114" stroke-width="2" stroke-linejoin="round">'
    +   '<path d="M44,38 l-8,12 6,0 -5,10 11,-13 -6,0 4,-9 z"/>'
    +   '<path d="M158,32 l-8,12 6,0 -5,10 11,-13 -6,0 4,-9 z"/>'
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

  /* ---------------- Sound (on by default — mute to turn off) ---------------- */
  var SoundFX = {
    ctx: null, enabled: true, last: 0,
    load: function () {
      /* default ON; only a stored "off" (the user muted) keeps it silent */
      try { this.enabled = localStorage.getItem("sp-sound") !== "off"; } catch (e) { this.enabled = true; }
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
      var cd = kind === "tick" ? 140 : kind === "steps" ? 240 : kind === "trace" ? 2200 : 550;
      if (now - this.last < cd) return; /* cooldown - no stacking */
      if (!this.ensureCtx()) return;
      this.last = now;
      if (kind === "chirp") { this.tone(720, 0, 0.09, "sine", 0.075); this.tone(980, 0.09, 0.12, "sine", 0.075); }
      else if (kind === "pop") { this.tone(300, 0, 0.14, "triangle", 0.09); }
      else if (kind === "chime") { this.tone(660, 0, 0.12, "sine", 0.075); this.tone(880, 0.11, 0.12, "sine", 0.075); this.tone(1174, 0.22, 0.18, "sine", 0.08); }
      else if (kind === "boing") { this.tone(160, 0, 0.22, "sine", 0.1, 620); }
      /* ---- v3 bold-emotion voices (each one signature) ---- */
      else if (kind === "yay") { /* happy: pentatonic bounce + high ping */
        this.tone(523, 0, 0.08, "triangle", 0.07); this.tone(659, 0.07, 0.08, "triangle", 0.07);
        this.tone(784, 0.14, 0.08, "triangle", 0.07); this.tone(1046, 0.21, 0.16, "triangle", 0.08);
        this.tone(1568, 0.3, 0.2, "sine", 0.06);
      }
      else if (kind === "grr") { /* angry: playful sawtooth growl + two hmph puffs */
        var gt = this.ctx.currentTime;
        var go = this.ctx.createOscillator(); go.type = "sawtooth";
        go.frequency.setValueAtTime(130, gt);
        go.frequency.exponentialRampToValueAtTime(72, gt + 0.45);
        var gg = this.ctx.createGain();
        gg.gain.setValueAtTime(0.0001, gt);
        gg.gain.linearRampToValueAtTime(0.09, gt + 0.06);
        gg.gain.exponentialRampToValueAtTime(0.0001, gt + 0.5);
        go.connect(gg); gg.connect(this.ctx.destination);
        go.start(gt); go.stop(gt + 0.55);
        this.tone(92, 0.5, 0.05, "square", 0.055);
        this.tone(92, 0.68, 0.05, "square", 0.055);
      }
      else if (kind === "hmm") { /* curious: rising two-note question */
        this.tone(440, 0, 0.2, "sine", 0.06);
        this.tone(587, 0.22, 0.3, "sine", 0.065, 760);
      }
      else if (kind === "hyped") { /* enthusiastic: fast pentatonic run + sparkle */
        var HY = [523, 587, 659, 784, 880, 1046];
        for (var hi = 0; hi < HY.length; hi++) this.tone(HY[hi], hi * 0.055, 0.09, "triangle", 0.06);
        this.tone(2093, 0.36, 0.16, "sine", 0.045);
        this.tone(1568, 0.42, 0.14, "sine", 0.04);
      }
      else if (kind === "steps") { /* one soft footstep thump */
        this.tone(150, 0, 0.05, "triangle", 0.05, 105);
      }
      else if (kind === "purr") {
        /* purr with rumble vibrato + a little "mrrp!" tail */
        var t0 = this.ctx.currentTime;
        var o = this.ctx.createOscillator(); o.type = "sine"; o.frequency.value = 106;
        var g = this.ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.085, t0 + 0.08);
        g.gain.setValueAtTime(0.085, t0 + 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
        var lfo = this.ctx.createOscillator(); lfo.frequency.value = 24;
        var lg = this.ctx.createGain(); lg.gain.value = 0.042;
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t0); lfo.start(t0); o.stop(t0 + 0.75); lfo.stop(t0 + 0.75);
        this.tone(880, 0.52, 0.07, "sine", 0.07);
        this.tone(1174, 0.62, 0.1, "sine", 0.07);
      }
      else if (kind === "jingle") { this.tone(523, 0, 0.11, "square", 0.045); this.tone(659, 0.12, 0.11, "square", 0.045); this.tone(784, 0.24, 0.11, "square", 0.045); this.tone(1046, 0.36, 0.2, "square", 0.05); }
      else if (kind === "zzz") { this.tone(240, 0, 0.3, "sine", 0.045); }
      else if (kind === "whoa") { this.tone(880, 0, 0.16, "sine", 0.075, 440); }
      /* ---- interaction score ---- */
      else if (kind === "trace") { this.tone(523, 0, 0.12, "sine", 0.06); this.tone(659, 0.9, 0.12, "sine", 0.06); this.tone(784, 1.9, 0.12, "sine", 0.06); this.tone(1046, 2.85, 0.22, "sine", 0.07); }
      else if (kind === "simstep") { this.tone(1400, 0, 0.04, "square", 0.035); }
      else if (kind === "simok") { this.tone(523, 0, 0.14, "sine", 0.07); this.tone(659, 0.09, 0.14, "sine", 0.07); this.tone(784, 0.18, 0.24, "sine", 0.075); }
      else if (kind === "simfail") { this.tone(392, 0, 0.16, "triangle", 0.075); this.tone(311, 0.14, 0.24, "triangle", 0.075); }
      else if (kind === "drop") { this.tone(920, 0, 0.26, "sine", 0.075, 260); }
      else if (kind === "shutter") { this.tone(1250, 0, 0.03, "square", 0.045); this.tone(880, 0.055, 0.045, "square", 0.045); }
      else if (kind === "tick") { this.tone(1750, 0, 0.025, "sine", 0.04); }
      else if (kind === "slide") { this.tone(300, 0, 0.12, "triangle", 0.06, 720); }
      else if (kind === "section") { this.tone(659, 0, 0.1, "sine", 0.045); this.tone(988, 0.11, 0.14, "sine", 0.045); }
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
    dance: 3400, curious: 2000, wave: 1600, angry: 2400, hyped: 2600
  };
  var FACE = {
    idle: "brackets", happy: "smile", surprised: "brackets", thinking: "dots",
    celebrate: "heart", love: "heart", dizzy: "sleep", excited: "smile",
    dance: "smile", curious: "brackets", guiding: "heart", greeting: "smile",
    sleepy: "sleep", angry: "angry", hyped: "spark"
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
     "angry", "hyped", "hat", "eyes-closed", "shy"]
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
  var REACT_CYCLE = ["happy", "surprised", "celebrate", "greeting", "curious", "hyped"];

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
      var hype = Math.random() < 0.5 ? "hyped" : "excited";
      setState(inst, hype);
      burst(inst);
      SoundFX.play(hype === "hyped" ? "hyped" : "boing");
      return true;
    }
    if (now - inst.lastReactionAt < 1200) return false;
    inst.lastReactionAt = now;
    var pick = forced || REACT_CYCLE[Math.floor(Math.random() * REACT_CYCLE.length)];
    setState(inst, pick);
    burst(inst);
    SoundFX.play(pick === "celebrate" ? "chime" : pick === "curious" ? "hmm" : pick === "hyped" ? "hyped" : pick === "happy" ? "yay" : "chirp");
    return true;
  }

  function pet(inst) {
    if (inst.state === "dance" || inst.state === "dizzy" || inst.state === "guiding" || inst.state === "sleepy") return;
    setState(inst, "love");
    burst(inst);
    SoundFX.play("purr");
    if (window.Byte) window.Byte.say(window.BYTE_LINES && window.BYTE_LINES.pet ? window.BYTE_LINES.pet : "Ahh, that's the spot!");
  }

  /* where Byte is dropped decides how he feels about the spot */
  function dropMood(cx, top, vw, vh) {
    var L = window.BYTE_LINES && window.BYTE_LINES.dropZone ? window.BYTE_LINES.dropZone : {};
    if (top < vh * 0.28) return { mood: "surprised", sound: "whoa", line: L.top || "Whoa — what a view from up here!" };
    if (cx < vw * 0.33) return { mood: "curious", sound: "hmm", line: L.left || "New neighborhood! What's over on this side?" };
    if (cx > vw * 0.78) return { mood: "greeting", sound: "chirp", line: L.right || "Back on my favorite side — thanks for the lift!" };
    return { mood: "happy", sound: "yay", line: L.mid || "This spot is perfect. I'm keeping it." };
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
    /* the bubble points at Byte wherever he stands — including after a drag or stroll */
    var dock = document.getElementById("byte-dock");
    if (dock && !dock.hidden) {
      var r = dock.getBoundingClientRect();
      var vw = window.innerWidth;
      var w = Math.min(280, vw - 32);
      var left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, vw - w - 8));
      speechEl.style.right = "auto";
      speechEl.style.left = left + "px";
      speechEl.style.setProperty("--tail-x", Math.max(14, Math.min(r.left + r.width / 2 - left - 8, w - 30)) + "px");
      speechEl.classList.add("follow");
    } else {
      speechEl.classList.remove("follow");
      speechEl.style.right = "";
      speechEl.style.left = "";
    }
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
    emote: function (name) {
      /* bold-emotion one-shot: state + burst + its signature sound + line */
      var map = { happy: "yay", angry: "grr", curious: "hmm", hyped: "hyped",
                  love: "purr", celebrate: "chime", excited: "boing", greeting: "chirp" };
      var sound = map[name];
      if (!sound) return false;
      instances.forEach(function (i) { setState(i, name); burst(i); });
      SoundFX.play(sound);
      var lines = window.BYTE_LINES && window.BYTE_LINES.emotions;
      if (lines && lines[name]) say(lines[name]);
      return true;
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
        if (drag.suppressClick) { drag.suppressClick = false; return; } /* a drag ends, not a menu request */
        if (menu && menuCard) {
          if (menu.open) { menu.close(); }
          else {
            stopWalk(); /* never leave Byte strolling out from under his own menu */
            try { menu.showModal(); } catch (err) {
              try { menu.close(); } catch (e2) {}
              menu.showModal();
            }
            var r = dockBtn.getBoundingClientRect();
            var h = menuCard.offsetHeight || 340;
            /* keep the whole card on screen — options must never escape the viewport */
            var top = Math.max(8, Math.min(r.top - 8 - h, window.innerHeight - h - 8));
            menuCard.style.right = Math.max(8, window.innerWidth - r.right) + "px";
            menuCard.style.left = "auto";
            menuCard.style.top = top + "px";
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
          /* keyboard/synthetic activations report (0,0) — they are always on
             a menu item, never "outside", so don't close on them */
          if (e.detail === 0) return;
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

    /* ---------------- roam: Byte strolls along the bottom edge ---------------- */
    var walk = { active: false, timer: 0, stepTimer: 0 };
    function roamPaused() {
      /* after a manual drag the user parked Byte on purpose — no strolling */
      try { return localStorage.getItem("sp-byte-roam") === "off"; } catch (e) { return false; }
    }
    function roamBlocked() {
      if (!motionFull() || document.hidden) return true;
      if (roamPaused()) return true;
      if (document.querySelector("dialog[open]")) return true;
      if (dock.hidden) return true;
      return false;
    }
    function stopWalk() {
      if (!dock || !walk.active) return;
      walk.active = false;
      clearTimeout(walk.timer);
      clearInterval(walk.stepTimer);
      dock.classList.remove("byte-dock--walk", "byte-dock--left");
      dock.style.transitionDuration = "";
    }
    function startRoam(force) {
      if (walk.active || (!force && Math.random() < 0.35)) return;
      if (roamBlocked()) return;
      var r = dock.getBoundingClientRect();
      if (!r.width) return;
      if (!dock.style.left) { /* switch to left-based positioning once */
        dock.style.left = r.left + "px";
        dock.style.right = "auto";
      }
      var margin = 12;
      var minX = margin, maxX = window.innerWidth - r.width - margin;
      if (maxX <= minX) return;
      var cur = parseFloat(dock.style.left) || r.left;
      var target = minX + Math.random() * (maxX - minX);
      if (Math.abs(target - cur) < 60) target = target < window.innerWidth / 2 ? target + 150 : target - 150;
      target = Math.max(minX, Math.min(maxX, target));
      var dist = Math.abs(target - cur);
      if (dist < 24) { /* guarantee a real stroll: head for the farther edge */
        target = cur < window.innerWidth / 2 ? maxX : minX;
        dist = Math.abs(target - cur);
        if (dist < 24) return;
      }
      var dur = Math.max(1.6, Math.min(8, dist / 62)); /* ~62 px/s stroll */
      dock.classList.toggle("byte-dock--left", target < cur);
      dock.style.transitionProperty = "left";
      dock.style.transitionTimingFunction = "linear";
      dock.style.transitionDuration = dur + "s";
      walk.active = true;
      dock.classList.add("byte-dock--walk");
      void dock.getBoundingClientRect(); /* flush before moving */
      dock.style.left = target + "px";
      SoundFX.play("chirp");
      walk.stepTimer = setInterval(function () { SoundFX.play("steps"); }, Math.max(240, (dur * 1000) / Math.max(2, Math.round(dist / 34))));
      walk.timer = setTimeout(function () {
        stopWalk();
        var lr = window.BYTE_LINES;
        if (lr && lr.roam && Math.random() < 0.5) say(lr.roam[Math.floor(Math.random() * lr.roam.length)]);
      }, dur * 1000);
    }
    function roamLoop() {
      setTimeout(function () {
        if (!roamBlocked()) startRoam(false);
        roamLoop();
      }, 16000 + Math.random() * 18000);
    }
    dock.addEventListener("pointerdown", stopWalk, { passive: true });
    window.addEventListener("blur", stopWalk);
    document.addEventListener("visibilitychange", function () { if (document.hidden) stopWalk(); });
    window.addEventListener("resize", function () {
      if (!dock.style.left) return;
      var r2 = dock.getBoundingClientRect();
      dock.style.left = Math.max(12, Math.min(window.innerWidth - r2.width - 12, parseFloat(dock.style.left) || 0)) + "px";
      if (dock.style.top) {
        dock.style.top = Math.max(12, Math.min(window.innerHeight - r2.height - 12, parseFloat(dock.style.top) || 0)) + "px";
      }
    });
    setTimeout(roamLoop, 9000);
    api.roam = function (force) { startRoam(force === true); };
    api.roamStop = stopWalk;

    /* ---------------- drag: place Byte anywhere; the spot sets his mood ---------------- */
    var drag = { active: false, moved: false, sx: 0, sy: 0, bx: 0, by: 0, suppressClick: false };
    function clampN(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function endDrag(cancelled) {
      if (!drag.active) return;
      drag.active = false;
      dock.classList.remove("byte-dock--drag");
      if (!drag.moved) return; /* a plain click — the click handler opens the menu */
      drag.suppressClick = true;
      setTimeout(function () { drag.suppressClick = false; }, 0);
      var r = dock.getBoundingClientRect();
      try {
        localStorage.setItem("sp-byte-pos", JSON.stringify({ l: r.left, t: r.top }));
        localStorage.setItem("sp-byte-roam", "off"); /* parked on purpose */
      } catch (err) {}
      if (cancelled) return;
      var mood = dropMood(r.left + r.width / 2, r.top, window.innerWidth, window.innerHeight);
      if (dockInst) { setState(dockInst, mood.mood); burst(dockInst); }
      SoundFX.play(mood.sound);
      say(mood.line);
    }
    dock.addEventListener("pointerdown", function (e) {
      if (e.button && e.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      drag.sx = e.clientX;
      drag.sy = e.clientY;
      var r = dock.getBoundingClientRect();
      drag.bx = r.left;
      drag.by = r.top;
      try { dock.setPointerCapture(e.pointerId); } catch (err) {}
    });
    dock.addEventListener("pointermove", function (e) {
      if (!drag.active || !dockInst) return;
      var dx = e.clientX - drag.sx;
      var dy = e.clientY - drag.sy;
      if (!drag.moved && Math.sqrt(dx * dx + dy * dy) < 10) return;
      if (!drag.moved) {
        drag.moved = true;
        stopWalk();
        if (menu && menu.open) menu.close(); /* never orphan the menu mid-drag */
        dock.style.transitionDuration = "0s";
        dock.style.transitionProperty = "left, top";
        /* release BOTH static anchors or the box stretches between them
           and the button never leaves the bottom edge (horizontal-only bug) */
        dock.style.right = "auto";
        dock.style.bottom = "auto";
        if (!dock.style.left) { dock.style.left = drag.bx + "px"; dock.style.top = drag.by + "px"; }
        dock.classList.add("byte-dock--drag");
        setState(dockInst, "dizzy"); /* wheee */
      }
      var r = dock.getBoundingClientRect();
      dock.style.left = clampN(drag.bx + dx, 8, window.innerWidth - r.width - 8) + "px";
      dock.style.top = clampN(drag.by + dy, 8, window.innerHeight - r.height - 8) + "px";
    });
    dock.addEventListener("pointerup", function () { endDrag(false); });
    dock.addEventListener("pointercancel", function () { endDrag(true); });

    /* restore a saved placement; a parked Byte stays parked */
    var savedPos = null;
    try { savedPos = JSON.parse(localStorage.getItem("sp-byte-pos") || "null"); } catch (e) {}
    if (savedPos && typeof savedPos.l === "number") {
      dock.style.right = "auto";
      dock.style.bottom = "auto"; /* parked top needs both static anchors released */
      dock.style.left = clampN(savedPos.l, 8, window.innerWidth - dock.getBoundingClientRect().width - 8) + "px";
      dock.style.top = clampN(savedPos.t || 0, 8, window.innerHeight - dock.getBoundingClientRect().height - 8) + "px";
      dock.style.transitionProperty = "left, top";
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

    /* default-on sound: browsers require a gesture to start audio, so wake
       the audio context on the very first interaction — no opt-in needed */
    var wake = function () { SoundFX.ensureCtx(); };
    window.addEventListener("pointerdown", wake, { once: true, passive: true });
    window.addEventListener("keydown", wake, { once: true, passive: true });

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
          if (dock.hidden && api.roamStop) api.roamStop();
        });
      }, { threshold: 0.12 });
      io.observe(heroScene);
    } else if (dock) {
      dock.hidden = false;
    }
  }
})();
