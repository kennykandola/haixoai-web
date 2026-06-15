(function () {
  "use strict";

  /* ===== Footer year ===== */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Email signup (front-end only, no backend yet) ===== */
  var form = document.getElementById("signup");
  if (form) {
    var msg = form.querySelector(".form-msg");
    var input = form.querySelector("#email");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (input.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        msg.textContent = "Please enter a valid email address.";
        msg.className = "form-msg err";
        input.focus();
        return;
      }
      // TODO: wire up to a real email service (Formspree, Mailchimp, etc.)
      msg.textContent = "Thanks! You're on the list — we'll be in touch.";
      msg.className = "form-msg ok";
      form.reset();
    });
  }

  /* ===== Feature carousel (auto-loops, progress bar, highlight) ===== */
  var FEATURE_DURATION = 4000; // ms each feature stays active

  var items = Array.prototype.slice.call(
    document.querySelectorAll(".feature-item")
  );
  var gifLabel = document.querySelector("[data-gif-label]");

  if (items.length && gifLabel) {
    var current = -1;
    var rafId = null;
    var startTime = 0;
    var paused = false;

    function setActive(index) {
      current = index;
      items.forEach(function (item, i) {
        var active = i === index;
        item.classList.toggle("is-active", active);
        var btn = item.querySelector(".feature-btn");
        if (btn) btn.setAttribute("aria-selected", active ? "true" : "false");
        // reset all progress fills
        var fill = item.querySelector(".feature-progress-fill");
        if (fill) fill.style.height = active ? "0%" : "0%";
      });

      // Update GIF stage (placeholder shows the feature name).
      // When real GIFs are added, set a `data-gif` attribute on each
      // .feature-item and swap the placeholder for an <img> here.
      var name = items[index].querySelector(".feature-name");
      gifLabel.textContent = name ? name.textContent : "";

      startTime = 0; // reset timer for the new feature
    }

    function tick(now) {
      if (paused) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (!startTime) startTime = now;
      var elapsed = now - startTime;
      var pct = Math.min(elapsed / FEATURE_DURATION, 1);

      var fill = items[current].querySelector(".feature-progress-fill");
      if (fill) fill.style.height = pct * 100 + "%";

      if (pct >= 1) {
        setActive((current + 1) % items.length);
      }
      rafId = requestAnimationFrame(tick);
    }

    // Click / keyboard to jump to a feature
    items.forEach(function (item, i) {
      var btn = item.querySelector(".feature-btn");
      if (btn) {
        btn.addEventListener("click", function () {
          setActive(i);
        });
      }
    });

    // Pause when tab not visible to keep things in sync
    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
      if (!paused) startTime = 0;
    });

    // Pause on hover (desktop) for readability
    var stage = document.querySelector(".features-grid");
    if (stage && window.matchMedia("(hover: hover)").matches) {
      stage.addEventListener("mouseenter", function () { paused = true; });
      stage.addEventListener("mouseleave", function () {
        paused = false;
        startTime = 0;
      });
    }

    setActive(0);
    rafId = requestAnimationFrame(tick);
  }
})();
