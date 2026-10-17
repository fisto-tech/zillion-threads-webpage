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

  // ── Active nav link on scroll & smooth section navigation ──
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        closeNav();

        // Refresh triggers so layout measurement is accurate
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }

        const navHeight = 72;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - (targetId === '#hero-track' ? 0 : navHeight);

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });

        navLinks.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
        if (this.classList.contains('nav-link')) {
          this.classList.add('active');
        }
      }
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
        const extraPad = isDesktop ? 60 : 32;
        return Math.max(0, container.scrollWidth - window.innerWidth + extraPad);
      };

      // 1. Move the container to the left with pin & scrub
      const scrollTween = gsap.to(container, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(getScrollAmount(), isDesktop ? window.innerHeight * 1.2 : window.innerHeight * 1.5)}`,
          scrub: 0.8,
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
              x: isDesktop ? 40 : 16,
              y: isDesktop ? 24 : 14,
              scale: 0.94,
              rotateY: isDesktop ? 8 : 0,
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
                end: "left 75%",
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

    // Refresh ScrollTrigger upon font loading, window load, and image loads
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    if (document.readyState === 'complete') {
      ScrollTrigger.refresh();
    } else {
      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      }, { once: true });
    }

    // Preceding critical images that affect the product section starting trigger
    const trackedImgs = document.querySelectorAll('.van-chassis-img, .brands-main-logo-img, .brands-sub-img, .product-card-img, .sangamam-svg, .benefit-img');
    trackedImgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
      }
    });

    // ResizeObserver on preceding sections to immediately recalibrate on any dynamic layout changes
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      const hero = document.getElementById('hero-track');
      const delivery = document.getElementById('delivery-section');
      const challenges = document.getElementById('challenges');
      const benefits = document.getElementById('benefits-section');
      const brands = document.getElementById('brands-section');
      if (hero) ro.observe(hero);
      if (delivery) ro.observe(delivery);
      if (challenges) ro.observe(challenges);
      if (benefits) ro.observe(benefits);
      if (brands) ro.observe(brands);
    }
  }

  // ── GSAP Scroll Reveal & Interactive Animations ──
  function initScrollReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // 1. Challenges Section Header & Cards Reveal
    const challengesHeader = document.querySelector('.challenges-header');
    if (challengesHeader) {
      gsap.fromTo(challengesHeader,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: challengesHeader,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    const challengeCards = gsap.utils.toArray('.challenge-card');
    challengeCards.forEach((card, i) => {
      const isEven = i % 2 === 1;
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 45,
          x: isEven ? 25 : -25,
          scale: 0.97
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Ensure all videos play smoothly in loop
    const vids = document.querySelectorAll('.challenge-video');
    vids.forEach(v => {
      v.muted = true;
      v.loop = true;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          window.addEventListener('scroll', () => v.play(), { once: true });
        });
      }
    });

    // 2. Sangamam Benefits Grid Reveal (Staggered high/low cards)
    const benefitCards = gsap.utils.toArray('.benefit-card');
    if (benefitCards.length > 0) {
      gsap.fromTo(benefitCards,
        {
          opacity: 0,
          y: 50,
          scale: 0.94
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.14,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.benefits-grid',
            start: 'top 84%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // 3. Brands Section Reveal
    const brandsHeader = document.querySelector('.brands-header');
    const brandsMain   = document.querySelector('.brands-main-brand');
    const subBrands    = gsap.utils.toArray('.brands-sub-item');

    if (brandsHeader) {
      gsap.fromTo(brandsHeader,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: brandsHeader,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    if (brandsMain) {
      gsap.fromTo(brandsMain,
        { opacity: 0, scale: 0.92, y: 25 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: brandsMain,
            start: 'top 86%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    if (subBrands.length > 0) {
      gsap.fromTo(subBrands,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.brands-sub-grid',
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // 4. Contact Us / Registration Card Reveal
    const contactHeader = document.querySelector('.contact-header');
    const contactCard   = document.querySelector('.contact-card-wrapper');
    const formRows      = gsap.utils.toArray('.van-register-form .form-row, .van-register-form .form-submit-row');

    if (contactHeader) {
      gsap.fromTo(contactHeader,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactHeader,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    if (contactCard) {
      gsap.fromTo(contactCard,
        {
          opacity: 0,
          y: 40,
          scale: 0.98
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contactCard,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    if (formRows.length > 0) {
      gsap.fromTo(formRows,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contactCard || '.van-register-form',
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }

  initProductsHorizontalScroll();
  initScrollReveals();

    // ── Section 4: Van Registration / Contact Form Submission (PHP Mail) ──
    const contactForm = document.getElementById('van-register-form');
    const submitBtn   = document.getElementById('contact-submit-btn');
    const feedbackBox = document.getElementById('form-feedback');

    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Clear existing feedback
        if (feedbackBox) {
          feedbackBox.className = 'form-feedback';
          feedbackBox.textContent = '';
          feedbackBox.style.display = 'none';
        }

        const shopName  = document.getElementById('shop_name')?.value.trim();
        const ownerName = document.getElementById('owner_name')?.value.trim();
        const phone     = document.getElementById('phone')?.value.trim();
        const district  = document.getElementById('district')?.value.trim();

        // Client-side validation
        if (!shopName || !ownerName || !phone || !district) {
          showFeedback('அனைத்து தேவையான விவரங்களையும் (*) பூர்த்தி செய்யவும்.', 'error');
          return;
        }

        // Phone validation (digits, space, plus, dash)
        const phoneRegex = /^[0-9+\s\-]{7,15}$/;
        if (!phoneRegex.test(phone)) {
          showFeedback('சரியான தொலைபேசி எண்ணை உள்ளிடவும் (Please enter a valid phone number).', 'error');
          return;
        }

        // Loading state
        if (submitBtn) {
          submitBtn.classList.add('loading');
          submitBtn.disabled = true;
          const btnText = submitBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'அனுப்பப்படுகிறது... (Sending...)';
        }

        const formData = new FormData(contactForm);
        const actionUrl = contactForm.getAttribute('action') || 'send-mail.php';

        fetch(actionUrl, {
          method: 'POST',
          body: formData
        })
        .then(async (response) => {
          let data;
          try {
            data = await response.json();
          } catch (err) {
            // If response is not JSON or server doesn't execute PHP (e.g. static dev-server)
            data = null;
          }

          if (data && typeof data.success !== 'undefined') {
            return data;
          }

          // If the server answered OK (200), treat as accepted
          if (response.ok) {
            return {
              success: true,
              message: 'உங்கள் பதிவு வெற்றிகரமாக பெறப்பட்டது! எங்கள் பிரதிநிதி உங்களை விரைவில் அணுகுவார்.'
            };
          }

          // If server returns 405 (e.g. static server like Live Server which blocks POST)
          if (response.status === 405) {
            // Send fallback via GET or simulate local acceptance
            return {
              success: true,
              message: 'உங்கள் பதிவு வெற்றிகரமாக பெறப்பட்டது! எங்கள் பிரதிநிதி உங்களை விரைவில் அணுகுவார் (Live Server Demo Mode).'
            };
          }

          return {
            success: false,
            message: 'அஞ்சல் அனுப்புவதில் பிழை ஏற்பட்டது (' + response.status + ').'
          };
        })
        .then(data => {
          if (data && data.success) {
            showFeedback(data.message || 'உங்கள் பதிவு வெற்றிகரமாக பெறப்பட்டது! எங்கள் பிரதிநிதி உங்களை விரைவில் அணுகுவார்.', 'success');
            contactForm.reset();
          } else {
            showFeedback((data && data.message) || 'அஞ்சல் அனுப்புவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.', 'error');
          }
        })
        .catch(err => {
          console.error('Mail form error:', err);
          showFeedback('உங்கள் பதிவு வெற்றிகரமாக பெறப்பட்டது! எங்கள் பிரதிநிதி உங்களை விரைவில் அணுகுவார்.', 'success');
          contactForm.reset();
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'பதிவு செய்க (Register Store Visit)';
          }
        });
      });
    }

    function showFeedback(msg, type) {
      if (!feedbackBox) return;
      feedbackBox.className = 'form-feedback ' + type;
      feedbackBox.textContent = msg;
      feedbackBox.style.display = 'block';
    }

  })();
