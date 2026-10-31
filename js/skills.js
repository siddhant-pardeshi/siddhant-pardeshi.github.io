/* ============================================================
   SKILLS — interactive skill map with category filters and a
   conventional list alternative. Every skill links to documented
   evidence only. Keyboard + touch friendly.
   ============================================================ */

(function () {
  "use strict";

  function init() {
    var C = window.CONTENT;
    var root = document.getElementById("skills-view");
    if (!root) return;

    var filtersEl = root.querySelector(".skill-filters");
    var cloudEl = root.querySelector(".skill-cloud");
    var detailEl = root.querySelector(".skill-detail");
    var listBtn = root.querySelector(".skills-list-toggle");
    var plainEl = root.querySelector(".skills-plain");

    var activeCat = "all";
    var activeSkill = null;

    /* filters */
    var frag = document.createDocumentFragment();
    var cats = [{ id: "all", label: "All" }].concat(C.skillGroups.map(function (g) { return { id: g.id, label: g.label }; }));
    cats.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-btn";
      b.textContent = c.label;
      b.dataset.cat = c.id;
      b.setAttribute("aria-pressed", c.id === "all" ? "true" : "false");
      b.addEventListener("click", function () {
        activeCat = c.id;
        filtersEl.querySelectorAll(".filter-btn").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        renderCloud();
      });
      frag.appendChild(b);
    });
    filtersEl.appendChild(frag);

    function allSkills() {
      var out = [];
      C.skillGroups.forEach(function (g) { g.skills.forEach(function (s) { out.push({ group: g.label, skill: s }); }); });
      return out;
    }

    function renderCloud() {
      cloudEl.innerHTML = "";
      allSkills().forEach(function (entry) {
        if (activeCat !== "all" && entry.group !== catLabel(activeCat)) return;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "skill-pill";
        b.innerHTML = escapeHtml(entry.skill.name) + (entry.skill.evidence.length ? '<span class="ev-dot" aria-hidden="true"></span>' : "");
        b.setAttribute("aria-pressed", "false");
        var label = entry.skill.name + (entry.skill.evidence.length ? " — has project evidence" : " — coursework or tooling");
        b.setAttribute("aria-label", label);
        b.addEventListener("click", function () {
          activeSkill = entry;
          cloudEl.querySelectorAll(".skill-pill").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          renderDetail(entry);
          window.SoundPop && window.SoundPop();
        });
        cloudEl.appendChild(b);
      });
      if (activeSkill) {
        /* keep detail if still visible */
        var stillThere = allSkills().some(function (e) { return e.skill.name === activeSkill.skill.name && (activeCat === "all" || e.group === catLabel(activeCat)); });
        if (!stillThere) { activeSkill = null; renderDetail(null); }
      } else {
        renderDetail(null);
      }
    }

    function catLabel(id) {
      var g = C.skillGroups.find(function (x) { return x.id === id; });
      return g ? g.label : id;
    }

    function renderDetail(entry) {
      if (!entry) {
        detailEl.innerHTML = '<h3>Pick a tool</h3><p class="muted" style="margin-top:0.5rem">Every skill here maps to real evidence — a project, a course, or a credential. The dot marks skills with direct project work behind them.</p>';
        return;
      }
      var ev = entry.skill.evidence.map(function (e) {
        return '<a class="chip chip--lime" href="' + e.href + '">' + escapeHtml(e.label) + '</a>';
      }).join("");
      var groupLine = '<span class="chip chip--violet">' + escapeHtml(entry.group) + '</span>';
      detailEl.innerHTML = '<h3>' + escapeHtml(entry.skill.name) + '</h3>'
        + '<div class="ev-row" style="margin-top:0.6rem">' + groupLine + '</div>'
        + '<p class="muted" style="margin-top:0.8rem">' + escapeHtml(entry.skill.desc) + '</p>'
        + (entry.skill.evidence.length
          ? '<div class="ev-row"><span class="tag-note">Evidence</span></div><div class="ev-row">' + ev + '</div>'
          : '<p class="tag-note" style="margin-top:0.8rem">Coursework / tooling — no project claim made</p>');
    }

    /* plain list alternative */
    function renderPlain() {
      var html = "";
      C.skillGroups.forEach(function (g) {
        html += "<div><dt>" + escapeHtml(g.label) + '</dt><dd>' + g.skills.map(function (s) { return escapeHtml(s.name); }).join(" · ") + "</dd></div>";
      });
      plainEl.innerHTML = html;
    }

    listBtn.addEventListener("click", function () {
      var open = plainEl.hidden;
      plainEl.hidden = !open;
      cloudEl.hidden = open;
      detailEl.hidden = open;
      filtersEl.hidden = open;
      listBtn.textContent = open ? "View as map" : "View as list";
      listBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    renderCloud();
    renderPlain();
    renderDetail(null);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  window.SkillsView = { init: init };
})();
