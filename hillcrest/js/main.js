/* ============================================================
   main.js — site behaviour.
   Runs only AFTER include.js has injected the section partials.
   Each section's behaviour lives in its own init function, and each
   one bails out quietly if its section isn't on the page.
   ============================================================ */
(function () {
  var MOBILE_BREAKPOINT = 1023;

  /* ---------- Header: sticky desktop header + mobile sub-header ---------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    var mobileSubHeader = document.getElementById("mobileSubHeader");
    var mobileSubSentinel = document.getElementById("mobileSubHeaderSentinel");
    var mobileSubSpacer = document.getElementById("mobileSubHeaderSpacer");
    if (!header || !mobileSubHeader || !mobileSubSentinel || !mobileSubSpacer) {
      return;
    }

    var threshold = 40;

    function isMobile() {
      return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function onScroll() {
      if (!isMobile()) {
        if (window.scrollY > threshold) {
          header.classList.add("is-fixed");
        } else {
          header.classList.remove("is-fixed");
        }
        mobileSubHeader.classList.remove("is-fixed");
        mobileSubSpacer.style.height = "0px";
        return;
      }

      header.classList.remove("is-fixed");
      var sentinelTop =
        mobileSubSentinel.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= sentinelTop) {
        if (!mobileSubHeader.classList.contains("is-fixed")) {
          mobileSubSpacer.style.height = mobileSubHeader.offsetHeight + "px";
        }
        mobileSubHeader.classList.add("is-fixed");
      } else {
        mobileSubHeader.classList.remove("is-fixed");
        mobileSubSpacer.style.height = "0px";
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* ---------- Header: Shop dropdown ---------- */
  function initDropdown() {
    var dropdown = document.getElementById("shopDropdown");
    var trigger = document.getElementById("shopTrigger");
    if (!dropdown || !trigger) {
      return;
    }

    function closeDropdown() {
      dropdown.removeAttribute("data-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = dropdown.getAttribute("data-open") === "true";
      if (open) {
        closeDropdown();
      } else {
        dropdown.setAttribute("data-open", "true");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) closeDropdown();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDropdown();
    });
  }

  /* ---------- Hero: thumbnail switcher + swiper + confetti ---------- */
  function initHero() {
    var heroBgUse = document.getElementById("heroBgUse");
    var heroBgSvg = document.querySelector(".hero-bg-svg");
    var thumbs = document.querySelectorAll(".hero-thumbs .hero-thumb");
    if (!heroBgUse || !heroBgSvg || !thumbs.length) {
      return;
    }

    function activateThumb(el) {
      thumbs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-pressed", "false");
      });
      el.classList.add("is-active");
      el.setAttribute("aria-pressed", "true");

      var scene = el.getAttribute("data-bg");
      heroBgSvg.style.opacity = "0";
      setTimeout(function () {
        heroBgUse.setAttribute("href", "#" + scene);
        heroBgSvg.style.opacity = "1";
      }, 120);
    }

    if (typeof Swiper !== "undefined") {
      new Swiper("#heroThumbSwiper", {
        slidesPerView: 3,
        spaceBetween: 9,
        watchOverflow: true,
        allowTouchMove: false,
      });
    }

    thumbs.forEach(function (el) {
      el.addEventListener("click", function () {
        activateThumb(el);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateThumb(el);
        }
      });
    });

    var confettiWrap = document.getElementById("heroConfetti");
    if (confettiWrap) {
      var colors = [
        "#F2D24B",
        "#F2799F",
        "#6FCBF0",
        "#F2A64B",
        "#fff",
        "#8B4A6B",
      ];
      var pieces = "";
      for (var i = 0; i < 40; i++) {
        var left = Math.random() * 100;
        var top = 78 + Math.random() * 20;
        var rot = Math.random() * 360;
        var c = colors[i % colors.length];
        var w = 4 + Math.random() * 4;
        var h = w * 2.2;
        pieces +=
          '<span style="position:absolute;left:' +
          left +
          "%;top:" +
          top +
          "%;width:" +
          w +
          "px;height:" +
          h +
          "px;background:" +
          c +
          ";border-radius:2px;transform:rotate(" +
          rot +
          'deg);opacity:.85"></span>';
      }
      confettiWrap.innerHTML = pieces;
    }
  }

  /* ---------- Mobile bottom nav: active state ---------- */
  function initMobileNav() {
    var items = document.querySelectorAll(".mobile-nav-item");
    if (!items.length) {
      return;
    }
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        items.forEach(function (i) {
          i.classList.remove("is-active");
        });
        item.classList.add("is-active");
      });
    });
  }

  /* ---------- Scroll-in reveal (any section with .reveal) ---------- */
  function initReveal() {
    var reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) {
      return;
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
      );
      reveals.forEach(function (el) {
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add("is-in");
      });
    }
  }

  /* ---------- Story: text flowing around the pill outline ---------- */
  function initStoryRing() {
    var storyTextPath = document.getElementById("storyTextPath");
    var storyPath = document.getElementById("storyRingPath");
    if (!storyTextPath || !storyPath) {
      return;
    }

    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var storyText = storyTextPath.parentNode;
    var STORY_REPEATS = 6; // phrases present in the markup
    var STORY_LAPS = 2; // whole laps of text around the pill

    function startStoryFlow() {
      var P = 0;
      try {
        P = storyPath.getTotalLength();
      } catch (e) {}
      if (!P) {
        return;
      }
      /* Pin the text so it tiles the loop a whole number of times ->
         the start/end junction lines up perfectly (no seam). */
      var tile = P / STORY_LAPS;
      storyText.setAttribute("textLength", STORY_REPEATS * tile);
      storyText.setAttribute("lengthAdjust", "spacing");
      if (prefersReduced) {
        return;
      }

      var speed = tile / 15000; // one tile every 15s
      var startTs = null;
      function step(ts) {
        if (startTs === null) {
          startTs = ts;
        }
        /* increasing offset -> letters travel left-to-right along the top */
        var off = -tile + (((ts - startTs) * speed) % tile);
        storyTextPath.setAttribute("startOffset", off);
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startStoryFlow);
    } else {
      startStoryFlow();
    }
  }

  function init() {
    initHeader();
    initDropdown();
    initHero();
    initMobileNav();
    initReveal();
    initStoryRing();
  }

  /* include.js sets window.sectionsReady; wait for the partials to land. */
  if (window.sectionsReady && typeof window.sectionsReady.then === "function") {
    window.sectionsReady.then(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();



        
    