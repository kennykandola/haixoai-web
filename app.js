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

  /* ===== Demo videos (autoplay + custom playback rate) ===== */
  document.querySelectorAll("video[data-playback-rate]").forEach(function (video) {
    var rate = parseFloat(video.getAttribute("data-playback-rate")) || 1;

    function applyRate() {
      video.playbackRate = rate;
    }

    applyRate();
    video.addEventListener("loadedmetadata", applyRate);
    video.play().catch(function () {});
  });

  /* ===== Feature carousel (auto-loops, progress bar, highlight) ===== */
  var FEATURE_DURATION = 4000; // ms each feature stays active

  var items = Array.prototype.slice.call(
    document.querySelectorAll(".feature-item")
  );
  var featureVideo = document.querySelector(".feature-stage video");

  if (items.length) {
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
        var fill = item.querySelector(".feature-progress-fill");
        if (fill) fill.style.height = active ? "0%" : "0%";
      });

      startTime = 0;
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

    items.forEach(function (item, i) {
      var btn = item.querySelector(".feature-btn");
      if (btn) {
        btn.addEventListener("click", function () {
          setActive(i);
        });
      }
    });

    if (featureVideo) {
      featureVideo.play().catch(function () {});
    }

    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
      if (featureVideo) {
        if (document.hidden) {
          featureVideo.pause();
        } else {
          featureVideo.play().catch(function () {});
          startTime = 0;
        }
      }
    });

    var stage = document.querySelector(".features-grid");
    if (stage && window.matchMedia("(hover: hover)").matches) {
      stage.addEventListener("mouseenter", function () {
        paused = true;
        if (featureVideo) featureVideo.pause();
      });
      stage.addEventListener("mouseleave", function () {
        paused = false;
        startTime = 0;
        if (featureVideo) featureVideo.play().catch(function () {});
      });
    }

    setActive(0);
    rafId = requestAnimationFrame(tick);
  }
})();
