/**
 * NOCTURNE ATELIER — PORTFOLIO SCRIPT
 * Author: Rishab Kumar
 * Inspiration: HelloAkriti.com Editorial Precision & Micro-Interactions
 * 100% Pure Vanilla JavaScript (Zero Frameworks, Zero External Libraries)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. SMART STICKY HEADER (Hide on scroll down, slide in on scroll up)
  // ------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const delta = currentScrollY - lastScrollY;

    if (currentScrollY <= 60) {
      // Near top of page — always show header
      if (header) header.classList.remove('header-hidden');
    } else if (delta > scrollThreshold) {
      // Scrolling down — hide header
      if (header) header.classList.add('header-hidden');
    } else if (delta < -scrollThreshold) {
      // Scrolling up — reveal header smoothly
      if (header) header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });


  // ------------------------------------------------------------------------
  // 2. MOBILE MENU DRAWER TOGGLE
  // ------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenuBtn.classList.toggle('open');
      mobileNavDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileNavDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('open');
        mobileNavDrawer.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }


  // ------------------------------------------------------------------------
  // 3. SCROLL REVEAL VIA INTERSECTION OBSERVER
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // once revealed, keep visible
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }


  // ------------------------------------------------------------------------
  // 4. ACTIVE NAVIGATION LINK TRACKING
  // ------------------------------------------------------------------------
  const trackedSections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.site-nav .nav-link, .mobile-nav-drawer .nav-link');

  if ('IntersectionObserver' in window && trackedSections.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      rootMargin: '-25% 0px -65% 0px',
      threshold: 0
    });

    trackedSections.forEach(section => sectionObserver.observe(section));
  }


  // ------------------------------------------------------------------------
  // 5. SERVICES ACCORDION (HelloAkriti Non-Exclusive Expandable Rows)
  // ------------------------------------------------------------------------
  const accordionItems = document.querySelectorAll('.service-accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.service-accordion-header');
    const body = item.querySelector('.service-accordion-body');
    const icon = item.querySelector('.service-accordion-icon');

    if (header && body) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.toggle('is-open');

        if (isOpen) {
          body.style.maxHeight = body.scrollHeight + 'px';
          if (icon) icon.textContent = '—';
        } else {
          body.style.maxHeight = '0px';
          if (icon) icon.textContent = '+';
        }
      });
    }
  });


  // ------------------------------------------------------------------------
  // 7. PROJECT SCREENSHOT SWITCHER BUTTONS
  // ------------------------------------------------------------------------
  const thumbSwitchers = document.querySelectorAll('[data-switch-target]');
  thumbSwitchers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't trigger lightbox immediately
      const targetId = btn.getAttribute('data-switch-target');
      const newSrc = btn.getAttribute('data-img-src');
      const newAlt = btn.getAttribute('data-img-alt') || '';
      const targetImg = document.getElementById(targetId);

      if (targetImg && newSrc) {
        targetImg.src = newSrc;
        targetImg.alt = newAlt;

        const parentBar = btn.closest('.project-interactive-bar');
        if (parentBar) {
          parentBar.querySelectorAll('.project-thumb-switch').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      }
    });
  });


  // ------------------------------------------------------------------------
  // 8. LIGHTBOX MODAL FOR SCREENSHOT ZOOM
  // ------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  const openLightbox = (src, caption) => {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.project-media-wrap[data-lightbox]').forEach(wrap => {
    wrap.addEventListener('click', (e) => {
      // Don't trigger if user clicked a switcher button inside
      if (e.target.closest('.project-thumb-switch')) return;

      const img = wrap.querySelector('img');
      if (img) {
        openLightbox(img.src, img.alt || wrap.getAttribute('data-lightbox-title') || 'Project Preview');
      }
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });


  // ------------------------------------------------------------------------
  // 9. DYNAMIC AUDIO VISUALIZER CANVAS (Explorations Section)
  // ------------------------------------------------------------------------
  const audioCanvas = document.getElementById('audioVisualizerCanvas');
  if (audioCanvas) {
    const ctx = audioCanvas.getContext('2d');
    let time = 0;

    const resizeCanvas = () => {
      const rect = audioCanvas.getBoundingClientRect();
      audioCanvas.width = rect.width * (window.devicePixelRatio || 1);
      audioCanvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const renderAudioWave = () => {
      if (!ctx) return;
      const w = audioCanvas.width;
      const h = audioCanvas.height;

      ctx.fillStyle = '#0a0a09';
      ctx.fillRect(0, 0, w, h);

      // Fine oscilloscope background grid
      ctx.strokeStyle = 'rgba(51, 51, 46, 0.4)';
      ctx.lineWidth = 1;
      const gridStep = 24 * (window.devicePixelRatio || 1);
      for (let x = 0; x < w; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Three layered frequency waves
      const waves = [
        { color: 'rgba(60, 148, 232, 0.9)', speed: 0.04, amp: 0.28, freq: 0.015, offset: 0 },
        { color: 'rgba(195, 235, 56, 0.8)', speed: 0.03, amp: 0.20, freq: 0.022, offset: 2 },
        { color: 'rgba(255, 175, 210, 0.7)', speed: 0.05, amp: 0.15, freq: 0.030, offset: 4 }
      ];

      waves.forEach(wave => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2 * (window.devicePixelRatio || 1);

        for (let x = 0; x < w; x++) {
          const ny = Math.sin(x * wave.freq + time * wave.speed + wave.offset) * 
                     Math.cos(x * 0.005 + time * 0.02) * (h * wave.amp);
          const y = h / 2 + ny;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      time += 1;
      requestAnimationFrame(renderAudioWave);
    };

    renderAudioWave();
  }


  // ------------------------------------------------------------------------
  // 10. HELLOAKRITI LIVE STUDIO CLOCK (Footer)
  // ------------------------------------------------------------------------
  const studioClock = document.getElementById('liveStudioClock');
  if (studioClock) {
    const updateClock = () => {
      const now = new Date();
      // Format as Lucknow / IST time: 1:31:48 PM
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const timeStr = now.toLocaleTimeString('en-US', options);
      studioClock.textContent = `LUCKNOW ${timeStr} [GMT +5:30]`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }


  // ------------------------------------------------------------------------
  // 11. CONTACT FORM TRANSMISSION HANDLING
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('formName');
      const emailInput = document.getElementById('formEmail');
      const projectInput = document.getElementById('formProject');

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const projectVal = projectInput ? projectInput.value.trim() : '';

      if (!nameVal || !emailVal || !projectVal) {
        alert('Please fill out all fields before transmitting.');
        return;
      }

      contactStatus.textContent = `Transmission received, ${nameVal}. Rishab will review your brief within 24 hours.`;
      contactStatus.classList.add('visible');

      contactForm.reset();
      contactStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }


  // ------------------------------------------------------------------------
  // 12. BACK TO TOP SMOOTH TRIGGER
  // ------------------------------------------------------------------------
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
