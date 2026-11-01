/* ============================================================
   SIMULATIONS — educational, client-side, clearly illustrative.
   1. Hero "Trace a request" (UI -> API -> DATA)
   2. BankNest "Follow a transfer" (atomic transaction)
   3. LifeDrop "Move a request through the system"
   All sample data. None of this calls a server.
   ============================================================ */

(function () {
  "use strict";

  function motionFull() {
    return (document.documentElement.getAttribute("data-motion") || "full") === "full";
  }

  /* ---------------- 1. HERO TRACE ---------------- */
  function initTrace() {
    var btn = document.getElementById("trace-btn");
    var status = document.getElementById("trace-status");
    var svg = document.getElementById("node-map");
    if (!btn || !status || !svg) return;

    var path = svg.querySelector(".trace-path");
    var dot = svg.querySelector(".pulse-dot");
    var nodes = { ui: svg.querySelector(".node--ui"), api: svg.querySelector(".node--api"), data: svg.querySelector(".node--data") };
    if (!path || !dot) return;
    var len = path.getTotalLength();
    var tracing = false;

    var steps = [
      { at: 0.0, node: "ui", text: "<strong>1/4</strong> · The user acts in the interface — a request is born." },
      { at: 0.34, node: "api", text: "<strong>2/4</strong> · The API layer receives it, validates it, applies the rules." },
      { at: 0.67, node: "data", text: "<strong>3/4</strong> · The database reads or writes exactly what is needed." },
      { at: 1.0, node: "ui", text: "<strong>4/4</strong> · The response travels back — the user just sees it work." }
    ];

    function setNode(name) {
      Object.keys(nodes).forEach(function (k) {
        if (nodes[k]) nodes[k].classList.toggle("is-hot", k === name);
      });
    }

    function finish() {
      tracing = false;
      dot.style.opacity = "0";
      setNode(null);
      status.innerHTML = 'That round trip is the pattern behind <strong>every feature</strong> in my projects below.';
      btn.disabled = false;
    }

    btn.addEventListener("click", function () {
      if (tracing) return;
      tracing = true;
      btn.disabled = true;
      SoundFXSafe("trace");
      if (!motionFull()) {
        /* reduced motion: step highlights without travel */
        var i = 0;
        var iv = setInterval(function () {
          if (i >= steps.length) { clearInterval(iv); finish(); return; }
          setNode(steps[i].node);
          status.innerHTML = steps[i].text;
          i++;
        }, 900);
        return;
      }
      var start = null, dur = 3000;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        var pt = path.getPointAtLength(eased * len);
        dot.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
        dot.style.opacity = "1";
        var step = steps[0];
        steps.forEach(function (s) { if (eased >= s.at - 0.02) step = s; });
        setNode(step.node);
        status.innerHTML = step.text;
        if (p < 1) requestAnimationFrame(frame);
        else finish();
      }
      requestAnimationFrame(frame);
    });

    /* node hover/focus explanation */
    var roles = {
      ui: "<strong>UI</strong> — where the user interacts. React screens, forms, dashboards.",
      api: "<strong>API</strong> — the rules layer. Spring Boot controllers and services.",
      data: "<strong>DATA</strong> — where the truth lives. MySQL, schema, transactions."
    };
    Object.keys(nodes).forEach(function (k) {
      var n = nodes[k];
      if (!n) return;
      function show() { status.innerHTML = roles[k]; }
      n.addEventListener("mouseenter", show);
      n.addEventListener("focus", show);
    });
  }

  function SoundFXSafe(kind) {
    if (window.Byte && window.Byte.SoundFX) window.Byte.SoundFX.play(kind);
  }

  /* ---------------- 2. BANKNEST TRANSFER ---------------- */
  function initTransfer() {
    var root = document.getElementById("sim-transfer");
    if (!root) return;
    var balA = root.querySelector(".acct-a .acct-bal");
    var balB = root.querySelector(".acct-b .acct-bal");
    var arrowAmt = root.querySelector(".acct-arrow .amt");
    var steps = root.querySelectorAll(".pipe-step");
    var explain = root.querySelector(".sim__explain");
    var btnGo = root.querySelector(".sim-go");
    var btnFail = root.querySelector(".sim-fail");
    var btnReset = root.querySelector(".sim-reset");

    var A0 = 12400.00, B0 = 8750.00, AMT = 500;
    var seqGo = [
      { i: 0, text: "Controller receives <code>POST /transfers</code> and validates the input." },
      { i: 1, text: "Service opens a transaction — <code>@Transactional</code> marks this as one all-or-nothing unit." },
      { i: 2, text: "Repository debits the sender's account row." },
      { i: 3, text: "Repository credits the receiver — and MySQL commits <strong>both</strong> writes together." }
    ];
    var seqFail = [
      { i: 0, text: "Controller receives the same request." },
      { i: 1, text: "Service opens the transaction and starts the debit." },
      { i: 2, text: "Repository debits the sender — in-flight, not committed." },
      { i: 3, text: "A simulated failure hits before commit. Spring rolls the transaction back." }
    ];

    function reset() {
      balA.textContent = fmt(A0);
      balB.textContent = fmt(B0);
      balA.classList.remove("changed"); balB.classList.remove("changed");
      arrowAmt.textContent = "";
      steps.forEach(function (s) { s.classList.remove("is-active", "is-done", "is-error"); });
      explain.innerHTML = "Press <strong>Transfer ₹500</strong> to watch a fund transfer move through the layers — or <strong>Simulate failure</strong> to see why atomicity matters.";
    }

    function fmt(n) {
      return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function run(seq, fail) {
      btnGo.disabled = true; btnFail.disabled = true;
      var k = 0;
      function next() {
        if (k > 0) {
          steps[seq[k - 1].i].classList.remove("is-active");
          steps[seq[k - 1].i].classList.add(fail && k === seq.length ? "is-error" : "is-done");
        }
        if (k >= seq.length) {
          if (fail) {
            explain.innerHTML = "<strong>Rollback.</strong> The debit was never committed — both balances stay exactly as they were. That is the all-or-nothing principle: a transfer either completes fully or not at all, so money can never vanish mid-flight.";
            SoundFXSafe("simfail");
          } else {
            balA.textContent = fmt(A0 - AMT);
            balB.textContent = fmt(B0 + AMT);
            balA.classList.add("changed"); balB.classList.add("changed");
            explain.innerHTML = "<strong>Committed.</strong> Sender −₹500 and receiver +₹500 landed as one atomic unit. If any step had failed, both would have rolled back — never one without the other.";
            SoundFXSafe("simok");
          }
          btnGo.disabled = false; btnFail.disabled = false;
          return;
        }
        var st = seq[k];
        steps[st.i].classList.add("is-active");
        SoundFXSafe("simstep");
        if (st.i === 2 && !fail) arrowAmt.textContent = "₹500 →";
        if (st.i === 2 && fail) arrowAmt.textContent = "₹500 → (in-flight)";
        explain.innerHTML = st.text;
        k++;
        setTimeout(next, motionFull() ? 950 : 500);
      }
      next();
    }

    btnGo.addEventListener("click", function () { reset(); SoundFXSafe("pop"); run(seqGo, false); });
    btnFail.addEventListener("click", function () { reset(); SoundFXSafe("pop"); run(seqFail, true); });
    btnReset.addEventListener("click", function () { SoundFXSafe("pop"); reset(); });
    reset();
  }

  /* ---------------- 3. LIFEDROP REQUEST ---------------- */
  function initRequest() {
    var root = document.getElementById("sim-request");
    if (!root) return;
    var badge = root.querySelector(".status-badge");
    var units = root.querySelector(".units");
    var explain = root.querySelector(".sim__explain");
    var roleNote = root.querySelector(".role-note");
    var roleTabs = root.querySelectorAll(".role-tab");
    var btnApprove = root.querySelector(".req-approve");
    var btnFulfill = root.querySelector(".req-fulfill");
    var btnReset = root.querySelector(".req-reset");
    var eligText = root.querySelector(".elig-text");

    var roles = {
      donor: "<strong>Donor view</strong> — registers, sees eligibility, and books a donation camp slot. The dashboard only shows what a donor needs.",
      hospital: "<strong>Hospital view</strong> — raises blood requests and tracks each one from Pending to Fulfilled.",
      admin: "<strong>Admin view</strong> — approves or rejects requests and keeps the inventory numbers honest."
    };

    /* 90-day rule, computed from today for the fictional donor */
    var last = new Date(); last.setDate(last.getDate() - 42);
    var nextElig = new Date(last); nextElig.setDate(nextElig.getDate() + 90);
    var daysLeft = Math.ceil((nextElig - new Date()) / 86400000);
    var d = function (x) { return x.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); };

    function reset() {
      badge.textContent = "Pending";
      badge.className = "status-badge";
      units.textContent = "14";
      units.classList.remove("changed");
      btnApprove.disabled = false;
      btnFulfill.disabled = true;
      explain.innerHTML = "A hospital needs a unit of O+. Move it through the workflow: <strong>Pending → Approved → Fulfilled</strong>. Inventory only drops when the request is actually fulfilled.";
    }

    btnApprove.addEventListener("click", function () {
      badge.textContent = "Approved";
      badge.className = "status-badge status-badge--approved";
      btnApprove.disabled = true;
      btnFulfill.disabled = false;
      explain.innerHTML = "<strong>Approved.</strong> An admin reviewed the request. Inventory is still untouched — approval is a decision, not a delivery.";
      SoundFXSafe("drop");
    });

    btnFulfill.addEventListener("click", function () {
      badge.textContent = "Fulfilled";
      badge.className = "status-badge status-badge--fulfilled";
      btnFulfill.disabled = true;
      units.textContent = "13";
      units.classList.add("changed");
      explain.innerHTML = "<strong>Fulfilled.</strong> One unit of O+ left the inventory atomically as the request completed — the stock count and the request status can never disagree.";
      SoundFXSafe("simok");
    });

    btnReset.addEventListener("click", function () { SoundFXSafe("pop"); reset(); });

    roleTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        roleTabs.forEach(function (t) { t.setAttribute("aria-pressed", t === tab ? "true" : "false"); });
        roleNote.innerHTML = roles[tab.dataset.role] || "";
      });
    });
    if (roleTabs[0]) roleTabs[0].click();

    if (eligText) {
      eligText.innerHTML = "Sample donor last donated on <strong>" + d(last) + "</strong>. The project's 90-day eligibility rule marks them eligible again on <strong>" + d(nextElig) + "</strong> — <strong>" + daysLeft + " days</strong> from today. This is a software rule implemented in LifeDrop's application logic, not medical advice or a universal standard.";
    }
    reset();
  }

  window.Sims = {
    init: function () { initTrace(); initTransfer(); initRequest(); }
  };
})();
