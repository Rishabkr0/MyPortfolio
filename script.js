document.addEventListener('DOMContentLoaded', () => {

  const header = document.querySelector('.site-header');
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollThreshold = 8;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const delta = currentScrollY - lastScrollY;

    if (currentScrollY <= 60) {
      if (header) header.classList.remove('header-hidden');
    } else if (delta > scrollThreshold) {
      if (header) header.classList.add('header-hidden');
    } else if (delta < -scrollThreshold) {
      if (header) header.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

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

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
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

  const thumbSwitchers = document.querySelectorAll('[data-switch-target]');
  thumbSwitchers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent opening lightbox when switching preview
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
      if (e.target.closest('.project-thumb-switch')) return; // Ignore switcher clicks

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

  const pathCanvas = document.getElementById('pathfindingCanvas');
  const pathCounter = document.getElementById('pathStepsCounter');
  if (pathCanvas) {
    const pCtx = pathCanvas.getContext('2d');
    const cols = 18;
    const rows = 11;
    let grid = [];
    const start = { c: 2, r: 5 };
    const end = { c: 15, r: 5 };
    let openSet = [];
    let closedSet = [];
    let path = [];
    let state = 'searching';
    let pauseCounter = 0;

    const initPathGrid = () => {
      grid = [];
      openSet = [];
      closedSet = [];
      path = [];
      state = 'searching';
      pauseCounter = 0;

      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          row.push({
            c, r,
            isWall: false,
            g: Infinity,
            h: 0,
            f: Infinity,
            parent: null
          });
        }
        grid.push(row);
      }

      const gap1 = 2 + Math.floor(Math.random() * (rows - 4));
      const gap2 = 2 + Math.floor(Math.random() * (rows - 4));
      for (let r = 0; r < rows; r++) {
        if (Math.abs(r - gap1) > 1) grid[r][6].isWall = true;
        if (Math.abs(r - gap2) > 1) grid[r][11].isWall = true;
      }
      grid[start.r][start.c].isWall = false;
      grid[end.r][end.c].isWall = false;

      const startNode = grid[start.r][start.c];
      startNode.g = 0;
      startNode.h = Math.abs(start.c - end.c) + Math.abs(start.r - end.r);
      startNode.f = startNode.h;
      openSet.push(startNode);
    };

    const resizePathCanvas = () => {
      const rect = pathCanvas.getBoundingClientRect();
      pathCanvas.width = rect.width * (window.devicePixelRatio || 1);
      pathCanvas.height = rect.height * (window.devicePixelRatio || 1);
    };
    window.addEventListener('resize', resizePathCanvas);
    resizePathCanvas();
    initPathGrid();

    let stepTick = 0;
    const runPathStep = () => {
      if (state === 'searching') {
        if (openSet.length > 0) {
          let lowestIdx = 0;
          for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
          }
          const current = openSet.splice(lowestIdx, 1)[0];
          closedSet.push(current);

          if (pathCounter) {
            pathCounter.textContent = `visited: ${closedSet.length} / ${cols * rows}`;
          }

          if (current.c === end.c && current.r === end.r) {
            let temp = current;
            path = [];
            while (temp) {
              path.push(temp);
              temp = temp.parent;
            }
            state = 'found';
            if (pathCounter) {
              pathCounter.textContent = `solved: ${path.length} steps ✓`;
            }
          } else {
            const neighbors = [
              { c: current.c + 1, r: current.r },
              { c: current.c - 1, r: current.r },
              { c: current.c, r: current.r + 1 },
              { c: current.c, r: current.r - 1 }
            ];
            for (const n of neighbors) {
              if (n.c >= 0 && n.c < cols && n.r >= 0 && n.r < rows) {
                const neighbor = grid[n.r][n.c];
                if (!neighbor.isWall && !closedSet.includes(neighbor)) {
                  const tentativeG = current.g + 1;
                  if (!openSet.includes(neighbor)) {
                    neighbor.g = tentativeG;
                    neighbor.h = Math.abs(neighbor.c - end.c) + Math.abs(neighbor.r - end.r);
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                    openSet.push(neighbor);
                  } else if (tentativeG < neighbor.g) {
                    neighbor.g = tentativeG;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.parent = current;
                  }
                }
              }
            }
          }
        } else {
          state = 'pause';
        }
      } else if (state === 'found' || state === 'pause') {
        pauseCounter++;
        if (pauseCounter > 110) {
          initPathGrid();
        }
      }
    };

    const drawPathGrid = () => {
      if (!pCtx) return;
      const w = pathCanvas.width;
      const h = pathCanvas.height;
      const cellW = w / cols;
      const cellH = h / rows;

      pCtx.fillStyle = '#0a0b0e';
      pCtx.fillRect(0, 0, w, h);

      pCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      pCtx.lineWidth = 1;
      for (let c = 0; c <= cols; c++) {
        pCtx.beginPath();
        pCtx.moveTo(c * cellW, 0);
        pCtx.lineTo(c * cellW, h);
        pCtx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        pCtx.beginPath();
        pCtx.moveTo(0, r * cellH);
        pCtx.lineTo(w, r * cellH);
        pCtx.stroke();
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c].isWall) {
            pCtx.fillStyle = '#22252e';
            pCtx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
          }
        }
      }

      for (const node of closedSet) {
        pCtx.fillStyle = 'rgba(30, 64, 175, 0.35)';
        pCtx.fillRect(node.c * cellW + 2, node.r * cellH + 2, cellW - 4, cellH - 4);
        pCtx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
        pCtx.strokeRect(node.c * cellW + 2, node.r * cellH + 2, cellW - 4, cellH - 4);
      }

      for (const node of openSet) {
        pCtx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        pCtx.fillRect(node.c * cellW + 2, node.r * cellH + 2, cellW - 4, cellH - 4);
      }

      if (path.length > 0) {
        for (const node of path) {
          pCtx.fillStyle = '#ea580c';
          pCtx.fillRect(node.c * cellW + 3, node.r * cellH + 3, cellW - 6, cellH - 6);
        }
      }

      pCtx.fillStyle = '#2563eb';
      pCtx.fillRect(start.c * cellW + 3, start.r * cellH + 3, cellW - 6, cellH - 6);

      pCtx.fillStyle = '#ea580c';
      pCtx.fillRect(end.c * cellW + 3, end.r * cellH + 3, cellW - 6, cellH - 6);

      stepTick++;
      if (stepTick % 2 === 0) {
        runPathStep();
      }

      requestAnimationFrame(drawPathGrid);
    };

    drawPathGrid();
  }

  const sortCanvas = document.getElementById('sortingCanvas');
  const sortCounter = document.getElementById('sortSwapsCounter');
  if (sortCanvas) {
    const sCtx = sortCanvas.getContext('2d');
    const barCount = 18;
    let array = [];
    let state = 'sorting';
    let pauseCounter = 0;
    let pivot = -1;
    let comparingA = -1;
    let comparingB = -1;
    let swaps = 0;
    let comparisons = 0;
    let steps = [];

    const initSort = () => {
      array = [];
      for (let i = 0; i < barCount; i++) {
        array.push(Math.floor(20 + Math.random() * 75));
      }
      swaps = 0;
      comparisons = 0;
      state = 'sorting';
      pauseCounter = 0;
      pivot = -1;
      comparingA = -1;
      comparingB = -1;

      steps = [];
      const arrCopy = [...array];

      const partition = (low, high) => {
        const pVal = arrCopy[high];
        let i = low - 1;
        steps.push({ type: 'pivot', idx: high });
        for (let j = low; j < high; j++) {
          steps.push({ type: 'compare', i: j, j: high });
          if (arrCopy[j] < pVal) {
            i++;
            const temp = arrCopy[i];
            arrCopy[i] = arrCopy[j];
            arrCopy[j] = temp;
            steps.push({ type: 'swap', i, j, arr: [...arrCopy] });
          }
        }
        const temp = arrCopy[i + 1];
        arrCopy[i + 1] = arrCopy[high];
        arrCopy[high] = temp;
        steps.push({ type: 'swap', i: i + 1, j: high, arr: [...arrCopy] });
        return i + 1;
      };

      const quickSort = (low, high) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        }
      };

      quickSort(0, arrCopy.length - 1);
      steps.push({ type: 'done' });
    };

    const resizeSortCanvas = () => {
      const rect = sortCanvas.getBoundingClientRect();
      sortCanvas.width = rect.width * (window.devicePixelRatio || 1);
      sortCanvas.height = rect.height * (window.devicePixelRatio || 1);
    };
    window.addEventListener('resize', resizeSortCanvas);
    resizeSortCanvas();
    initSort();

    let sortTick = 0;
    const runSortStep = () => {
      if (state === 'sorting' && steps.length > 0) {
        const step = steps.shift();
        if (step.type === 'pivot') {
          pivot = step.idx;
        } else if (step.type === 'compare') {
          comparingA = step.i;
          comparingB = step.j;
          comparisons++;
          if (sortCounter) sortCounter.textContent = `cmp: ${comparisons} • swp: ${swaps}`;
        } else if (step.type === 'swap') {
          array = step.arr;
          comparingA = step.i;
          comparingB = step.j;
          swaps++;
          if (sortCounter) sortCounter.textContent = `cmp: ${comparisons} • swp: ${swaps}`;
        } else if (step.type === 'done') {
          state = 'sorted';
          pivot = -1;
          comparingA = -1;
          comparingB = -1;
          if (sortCounter) sortCounter.textContent = `sorted! [O(n log n)]`;
        }
      } else if (state === 'sorted') {
        pauseCounter++;
        if (pauseCounter > 90) {
          initSort();
        }
      }
    };

    const drawSortBars = () => {
      if (!sCtx) return;
      const w = sortCanvas.width;
      const h = sortCanvas.height;
      const barW = (w - (barCount + 1) * 6) / barCount;

      sCtx.fillStyle = '#0a0b0e';
      sCtx.fillRect(0, 0, w, h);

      sCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      sCtx.lineWidth = 1;
      sCtx.beginPath();
      sCtx.moveTo(0, h - 16);
      sCtx.lineTo(w, h - 16);
      sCtx.stroke();

      for (let i = 0; i < array.length; i++) {
        const val = array[i];
        const barH = (val / 100) * (h - 40);
        const x = 6 + i * (barW + 6);
        const y = h - 18 - barH;

        if (state === 'sorted') {
          sCtx.fillStyle = '#22c55e';
        } else if (i === pivot) {
          sCtx.fillStyle = '#ea580c';
        } else if (i === comparingA || i === comparingB) {
          sCtx.fillStyle = '#3b82f6';
        } else {
          sCtx.fillStyle = '#27272a';
        }

        sCtx.fillRect(x, y, barW, barH);
        sCtx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        sCtx.fillRect(x, y, barW, 2);
      }

      sortTick++;
      if (sortTick % 3 === 0) {
        runSortStep();
      }

      requestAnimationFrame(drawSortBars);
    };

    drawSortBars();
  }

  const studioClock = document.getElementById('liveStudioClock');
  if (studioClock) {
    const updateClock = () => {
      const now = new Date();
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
