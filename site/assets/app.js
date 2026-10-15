(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var burger = document.querySelector("[data-burger]");
  var nav = document.getElementById("nav");
  var mq = window.matchMedia("(max-width:880px)");

  function syncNav() {
    if (mq.matches) {
      nav.hidden = burger.getAttribute("aria-expanded") !== "true";
    } else {
      nav.hidden = false;
    }
  }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      syncNav();
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && mq.matches) {
        burger.setAttribute("aria-expanded", "false");
        syncNav();
      }
    });
    mq.addEventListener("change", syncNav);
    syncNav();
  }

  /* ---------- FAQ accordion (single open) ---------- */
  document.querySelectorAll("[data-faq] .faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll("[data-faq] .faq__q").forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        document.getElementById(other.getAttribute("aria-controls")).hidden = true;
        other.querySelector("i").textContent = "+";
      });
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        document.getElementById(btn.getAttribute("aria-controls")).hidden = false;
        btn.querySelector("i").textContent = "\u2212";
      }
    });
  });

  /* ---------- Before / after comparison ---------- */
  var compare = document.querySelector("[data-compare]");
  if (!compare) return;

  var afterImg = compare.querySelector(".compare__after"),
      before = compare.querySelector(".compare__before"),
      rail = compare.querySelector(".compare__rail"),
      knob = compare.querySelector(".compare__knob"),
      titleEl = document.querySelector("[data-case-title]"),
      noteEl = document.querySelector("[data-case-note]"),
      thumbs = Array.prototype.slice.call(document.querySelectorAll("[data-case]")),
      rect = null,
      pos = 46;

  function paint(p) {
    pos = Math.max(4, Math.min(96, p));
    before.style.width = pos + "%";
    rail.style.left = pos + "%";
  }

  function announce() {
    var v = Math.round(pos);
    knob.setAttribute("aria-valuenow", String(v));
    knob.setAttribute("aria-valuetext", v + "% before, " + (100 - v) + "% after");
  }

  function fromEvent(e) {
    if (!rect) return;
    paint(((e.clientX - rect.left) / rect.width) * 100);
  }

  knob.addEventListener("pointerdown", function (e) {
    rect = compare.getBoundingClientRect();
    knob.setPointerCapture(e.pointerId);
    compare.setAttribute("data-dragging", "true");
  });
  knob.addEventListener("pointermove", function (e) {
    if (compare.getAttribute("data-dragging") === "true") fromEvent(e);
  });
  ["pointerup", "pointercancel"].forEach(function (type) {
    knob.addEventListener(type, function (e) {
      if (knob.hasPointerCapture(e.pointerId)) knob.releasePointerCapture(e.pointerId);
      compare.removeAttribute("data-dragging");
      rect = null;
      announce();
    });
  });
  knob.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 2, delta = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
    if (delta !== null) { e.preventDefault(); paint(pos + delta); announce(); }
    else if (e.key === "Home") { e.preventDefault(); paint(0); announce(); }
    else if (e.key === "End") { e.preventDefault(); paint(100); announce(); }
  });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      thumbs.forEach(function (t) { t.setAttribute("aria-pressed", "false"); });
      thumb.setAttribute("aria-pressed", "true");

      var title = thumb.getAttribute("data-title");
      afterImg.src = thumb.getAttribute("data-after");
      afterImg.alt = title + " \u2014 the keg after refurbishment";
      titleEl.textContent = title;
      noteEl.textContent = thumb.getAttribute("data-note");
      knob.setAttribute("aria-label", "Before and after comparison: " + title);
      paint(46);
      announce();
    });
  });

  announce();
})();
