(function () {
  "use strict";

  /* ===== Footer year ===== */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Email signup (Supabase waitlist) ===== */
  var form = document.getElementById("signup");
  if (form) {
    var msg = form.querySelector(".form-msg");
    var input = form.querySelector("#email");
    var button = form.querySelector('button[type="submit"]');
    var config = window.HAIXOAI_SUPABASE;
    var supabase =
      config && window.supabase
        ? window.supabase.createClient(config.url, config.publishableKey)
        : null;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (input.value || "").trim().toLowerCase();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        msg.textContent = "Please enter a valid email address.";
        msg.className = "form-msg err";
        input.focus();
        return;
      }
      if (!supabase) {
        msg.textContent = "Signup is temporarily unavailable. Please try again later.";
        msg.className = "form-msg err";
        return;
      }

      if (button) button.disabled = true;
      msg.textContent = "";

      supabase
        .from("waitlist")
        .insert({ email: value })
        .then(function (result) {
          if (result.error) {
            if (result.error.code === "23505") {
              msg.textContent = "You're already on the list — we'll be in touch.";
              msg.className = "form-msg ok";
              form.reset();
              return;
            }
            throw result.error;
          }
          msg.textContent = "Thanks! You're on the list — we'll be in touch.";
          msg.className = "form-msg ok";
          form.reset();
        })
        .catch(function () {
          msg.textContent = "Something went wrong. Please try again.";
          msg.className = "form-msg err";
        })
        .finally(function () {
          if (button) button.disabled = false;
        });
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

  /* ===== Copy email ===== */
  var copyBtn = document.querySelector(".copy-email-btn");
  if (copyBtn) {
    var tooltip = copyBtn.parentElement.querySelector(".copy-tooltip");
    var copyText = copyBtn.getAttribute("data-copy") || "";
    var tooltipTimer = null;

    function showTooltip() {
      if (!tooltip) return;
      tooltip.classList.add("is-visible");
      clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(function () {
        tooltip.classList.remove("is-visible");
      }, 2000);
    }

    function copyEmail() {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(copyText);
      }
      return new Promise(function (resolve, reject) {
        var area = document.createElement("textarea");
        area.value = copyText;
        area.setAttribute("readonly", "");
        area.style.position = "absolute";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        try {
          document.execCommand("copy") ? resolve() : reject();
        } catch (err) {
          reject(err);
        }
        document.body.removeChild(area);
      });
    }

    copyBtn.addEventListener("click", function () {
      copyEmail().then(showTooltip).catch(function () {});
    });
  }

  /* ===== Feature carousel (progress bars only — video loops on its own) ===== */
  var FEATURE_DURATION = 4000;

  var items = Array.prototype.slice.call(
    document.querySelectorAll(".feature-item")
  );
  var featureVideo = document.querySelector(".feature-stage video");

  if (items.length) {
    var current = 0;
    var segmentStart = performance.now();

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
      segmentStart = performance.now();
    }

    function tick(now) {
      var elapsed = now - segmentStart;
      var pct = Math.min(elapsed / FEATURE_DURATION, 1);
      var fill = items[current].querySelector(".feature-progress-fill");
      if (fill) fill.style.height = pct * 100 + "%";

      if (elapsed >= FEATURE_DURATION) {
        setActive((current + 1) % items.length);
      }
      requestAnimationFrame(tick);
    }

    items.forEach(function (item, i) {
      var btn = item.querySelector(".feature-btn");
      if (btn) {
        btn.addEventListener("click", function () {
          setActive(i);
        });
      }
    });

    setActive(0);
    requestAnimationFrame(tick);
  }

  if (featureVideo) {
    function keepFeatureVideoPlaying() {
      if (!document.hidden && featureVideo.paused) {
        featureVideo.play().catch(function () {});
      }
    }

    featureVideo.addEventListener("ended", keepFeatureVideoPlaying);
    featureVideo.addEventListener("stalled", keepFeatureVideoPlaying);

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) keepFeatureVideoPlaying();
    });

    if ("IntersectionObserver" in window) {
      var videoObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) keepFeatureVideoPlaying();
          });
        },
        { threshold: 0.2 }
      );
      videoObserver.observe(featureVideo);
    }

    keepFeatureVideoPlaying();
  }
})();
