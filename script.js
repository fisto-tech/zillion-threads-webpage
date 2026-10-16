/* ============================================================
   ZillionThreads – Hero Section JS
   ============================================================ */

(function () {
  'use strict';

  // ── Elements ───────────────────────────────────────────
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const overlay   = document.getElementById('mobile-nav-overlay');
  const statNums  = document.querySelectorAll('.stat-number');

  // ── Hero Scroll Video & Text Animation ────────────────
  const heroTrack   = document.getElementById('hero-track');
  const heroContent = document.getElementById('hero-content');
  const heroCanvas  = document.getElementById('hero-canvas');
  const ctx         = heroCanvas ? heroCanvas.getContext('2d') : null;

  const TOTAL_FRAMES = 240;
  const frames       = new Array(TOTAL_FRAMES + 1);
  let targetFrame    = 1;
  let currentFrame   = 1;
  let lastDrawnFrame = 0;
  let isCanvasReady  = false;

  function getFrameUrl(idx) {
    const padded = String(idx).padStart(5, '0');
    return 'assets/Hero-section-video-images/' + padded + '.webp';
  }

  function getNearestLoadedFrame(idx) {
    if (frames[idx] && frames[idx].complete && frames[idx].naturalWidth > 0) return frames[idx];
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const down = idx - offset;
      if (down >= 1 && frames[down] && frames[down].complete && frames[down].naturalWidth > 0) return frames[down];
      const up = idx + offset;
      if (up <= TOTAL_FRAMES && frames[up] && frames[up].complete && frames[up].naturalWidth > 0) return frames[up];
    }
    return frames[1] || null;
  }

  function renderFrame(idx) {
    if (!ctx || !heroCanvas) return;
    const img = getNearestLoadedFrame(idx);
    if (!img) return;

    const cw = heroCanvas.width;
    const ch = heroCanvas.height;
    if (cw === 0 || ch === 0) return;

    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const cx = (cw - nw) / 2;
    const cy = (ch - nh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, cx, cy, nw, nh);
    lastDrawnFrame = idx;
  }

  function resizeHeroCanvas() {
    if (!heroCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    heroCanvas.width  = Math.round(w * dpr);
    heroCanvas.height = Math.round(h * dpr);
    heroCanvas.style.width  = w + 'px';
    heroCanvas.style.height = h + 'px';
    renderFrame(Math.round(currentFrame));
  }

  // Preloader with keyframe priority
  function initFrameLoader() {
    if (!heroCanvas) return;

    // Load first frame immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(1);
    firstImg.onload = function () {
      frames[1] = firstImg;
      isCanvasReady = true;
      resizeHeroCanvas();
    };

    // Queue keyframes every 8 frames first, then remainder
    const keyframes = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 8) {
      if (i !== 1) keyframes.push(i);
    }
    const remaining = [];
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      if ((i - 1) % 8 !== 0) remaining.push(i);
    }

    const queue = keyframes.concat(remaining);
    let activeLoads = 0;
    const MAX_CONCURRENT = 6;

    function loadNext() {
      while (activeLoads < MAX_CONCURRENT && queue.length > 0) {
        const nextIdx = queue.shift();
        activeLoads++;
        const img = new Image();
        img.src = getFrameUrl(nextIdx);
        img.onload = img.onerror = function () {
          frames[nextIdx] = img;
          activeLoads--;
          loadNext();
        };
      }
    }

    loadNext();
  }

  // Animation loop with LERP smoothing for video playback
  function startPlaybackLoop() {
    function loop() {
      if (isCanvasReady) {
        currentFrame += (targetFrame - currentFrame) * 0.10;
        const rounded = Math.round(currentFrame);
        if (rounded !== lastDrawnFrame) {
          renderFrame(rounded);
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  initFrameLoader();
  startPlaybackLoop();
  window.addEventListener('resize', resizeHeroCanvas, { passive: true });

  // ── Scroll handler (Hero video, text exit animation, navbar theme) ──
  function onScroll() {
    const y = window.scrollY;

    // 1. Navbar scrolled style (switches when past the hero track)
    const threshold = heroTrack ? (heroTrack.offsetTop + heroTrack.offsetHeight - 90) : 100;
    navbar.classList.toggle('scrolled', y > threshold);

    // 2. Hero scroll track progress
    if (heroTrack) {
      const rect = heroTrack.getBoundingClientRect();
      const maxScroll = heroTrack.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const progress = maxScroll > 0 ? Math.min(Math.max(scrolled / maxScroll, 0), 1) : 0;

      // Scrub frames: maps progress (0.0 to 1.0) across 240 frames
      targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(progress * (TOTAL_FRAMES - 1)) + 1));

      // Hero text exit animation: moves upward and smoothly hides on initial scroll
      if (heroContent) {
        const exitProgress = Math.min(Math.max(progress / 0.12, 0), 1);
        const translateY   = -exitProgress * 150;
        const opacity      = 1 - exitProgress;
        const scale        = 1 - exitProgress * 0.06;

        heroContent.style.transform     = 'translateY(' + translateY + 'px) scale(' + scale + ')';
        heroContent.style.opacity       = opacity;
        heroContent.style.pointerEvents = exitProgress > 0.85 ? 'none' : 'auto';
      }
    }

    // 3. Delivery Van Driving & Tire Rotation Scroll Progress
    const deliverySection = document.getElementById('delivery-section');
    const vanActor        = document.getElementById('van-actor');
    const rearWheel       = document.getElementById('van-wheel-rear');
    const frontWheel      = document.getElementById('van-wheel-front');

    if (deliverySection && vanActor) {
      const vRect        = deliverySection.getBoundingClientRect();
      const winH         = window.innerHeight;
      const startTrigger = winH * 1.05;
      const endTrigger   = -winH * 0.45;
      const rawProgress  = (startTrigger - vRect.top) / (startTrigger - endTrigger);
      const vProgress    = Math.min(Math.max(rawProgress, 0), 1);

      // Calculate horizontal translation across viewport
      const vanWidth = vanActor.offsetWidth || 340;
      const startX   = window.innerWidth < 768 ? 16 : 36;
      const endX     = Math.max(startX, window.innerWidth - vanWidth - (window.innerWidth < 768 ? 16 : 36));
      const currentX = startX + vProgress * (endX - startX);

      vanActor.style.transform = 'translate3d(' + currentX + 'px, 0, 0)';

      // Wheel rotation:
      // In the SVG coordinate space (1225 x 494), wheel diameter is 150px.
      // Physical wheel diameter on screen = (150 / 1225) * vanWidth.
      // Circumference = PI * wheelDiameter
      const wheelDiameter = (150 / 1225) * vanWidth;
      const circumference = Math.PI * wheelDiameter;
      const wheelAngle    = circumference > 0 ? ((currentX - startX) / circumference) * 360 : 0;

      if (rearWheel) {
        rearWheel.setAttribute('transform', 'translate(291, 419) rotate(' + wheelAngle + ')');
      }
      if (frontWheel) {
        frontWheel.setAttribute('transform', 'translate(1046, 416) rotate(' + wheelAngle + ')');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // ── Mobile Nav ─────────────────────────────────────────
  function openNav() {
    navLinks.classList.add('open');
    overlay.classList.add('active');
    hamburger.classList.add('open');
    navbar.classList.add('menu-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeNav() {
    navLinks.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('open');
    navbar.classList.remove('menu-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    navLinks.classList.contains('open') ? closeNav() : openNav();
  });
  overlay.addEventListener('click', closeNav);

  // Close on link click
  navLinks.querySelectorAll('.nav-link, .mobile-cta').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  // ── Active nav link on scroll ──────────────────────────
  navLinks.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');
    });
  });

  // ── Counter Animation ──────────────────────────────────
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const dur     = 2000;
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const value    = Math.round(easeOutQuart(progress) * target);
      el.textContent = value >= 1000 ? (value / 1000).toFixed(value % 1000 === 0 ? 0 : 1) + 'K' : value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000 ? (target / 1000) + 'K' : target;
    }
    requestAnimationFrame(step);
  }

  // Use IntersectionObserver to trigger counters when visible
  if ('IntersectionObserver' in window) {
    const statsObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(function (el) { statsObs.observe(el); });
  } else {
    // Fallback: run immediately
    statNums.forEach(animateCounter);
  }

  // ── Resize: close nav if desktop ──────────────────────
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) closeNav();
  });


  // ── Visual cards tilt on mouse move (desktop) ─────────
  const cards = document.querySelectorAll('.visual-card');
  if (window.matchMedia('(hover: hover)').matches) {
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = 'perspective(400px) rotateX(' + (-dy * 8) + 'deg) rotateY(' + (dx * 8) + 'deg) translateY(-4px) scale(1.04)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // ── Smooth ripple on buttons ───────────────────────────
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const rect  = btn.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.style.cssText = 'position:absolute;width:6px;height:6px;background:rgba(255,255,255,0.5);border-radius:50%;left:' + x + 'px;top:' + y + 'px;transform:scale(0);animation:ripple-expand 0.6s ease-out forwards;pointer-events:none;';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 700);
    });
  });

  // ── Section 3: Product Categories GSAP Horizontal Scroll & Card Reveal (Ref Code) ──
  function initProductsHorizontalScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector(".reveal-section");
    const container = document.querySelector(".reveal-container");
    const items = gsap.utils.toArray(".reveal-item");
    if (!section || !container || items.length === 0) return;

    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 769px)",
      isMobile: "(max-width: 768px)"
    }, (context) => {
      let { isDesktop } = context.conditions;

      const getScrollAmount = () => {
        const extraPad = isDesktop ? 60 : 24;
        return Math.max(0, container.scrollWidth - window.innerWidth + extraPad);
      };

      // 1. Move the container to the left with pin & scrub
      const scrollTween = gsap.to(container, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(getScrollAmount(), window.innerHeight * 1.2)}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // 2. Individual Card 3D Reveal effect with 100% visible text
      items.forEach((item, index) => {
        // Initial cards visible in viewport on arrival are always 100% visible
        const startsInView = index === 0 || (isDesktop && (index === 1 || index === 2));

        if (!startsInView) {
          gsap.fromTo(item,
            {
              x: isDesktop ? 40 : 20,
              y: 24,
              scale: 0.94,
              rotateY: isDesktop ? 8 : 4,
              transformPerspective: 1200
            },
            {
              x: 0,
              y: 0,
              scale: 1,
              rotateY: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                containerAnimation: scrollTween,
                start: "left 98%",
                end: "left 70%",
                scrub: 0.6,
                id: `card-reveal-${index}`
              }
            }
          );
        } else {
          gsap.set(item, {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0
          });
        }
      });
    });

    // Refresh ScrollTrigger once images finish loading
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });

    const cardImgs = container.querySelectorAll('.product-card-img');
    cardImgs.forEach((img) => {
      if (img.complete) return;
      img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    });
  }

  initProductsHorizontalScroll();

})();
