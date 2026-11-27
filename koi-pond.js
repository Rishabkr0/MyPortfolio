class KoiPond {
  constructor(canvasId, hudConfig = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.hudKoi = document.getElementById(hudConfig.koiId || 'koiCount');
    this.hudFood = document.getElementById(hudConfig.foodId || 'foodCount');

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;

    this.koi = [];
    this.foods = [];
    this.ripples = [];
    this.mouse = { x: -1000, y: -1000, active: false };
    this.foodCounter = 0;

    this.isRunning = false;
    this.rafId = null;
    this.lastTime = performance.now();

    this.palettes = {
      sanke: {
        base: ['#1E40AF', '#1D4ED8', '#2563EB', '#1E3A8A'],
        accent: ['#EA580C', '#F97316', '#C2410C', '#FB923C'],
        light: ['rgba(245, 240, 230, 0.75)', 'rgba(255, 255, 255, 0.6)'],
        fin: 'rgba(255, 255, 255, 0.42)',
        eye: '#0E1726'
      },
      kohaku: {
        base: ['#F97316', '#EA580C', '#FB923C', '#C2410C'],
        accent: ['#F43F5E', '#BE123C'],
        light: ['rgba(250, 246, 238, 0.85)', 'rgba(255, 255, 255, 0.7)'],
        fin: 'rgba(255, 255, 255, 0.48)',
        eye: '#1C1917'
      },
      cobalt: {
        base: ['#1E3A8A', '#1E40AF', '#1D4ED8', '#2563EB'],
        accent: ['#3B82F6', '#60A5FA', '#93C5FD'],
        light: ['rgba(230, 240, 255, 0.75)', 'rgba(255, 255, 255, 0.55)'],
        fin: 'rgba(219, 234, 254, 0.45)',
        eye: '#0F172A'
      },
      minnow: {
        base: ['#1E40AF', '#2563EB', '#3B82F6'],
        accent: ['#60A5FA'],
        light: ['rgba(255, 255, 255, 0.6)'],
        fin: 'rgba(255, 255, 255, 0.4)',
        eye: '#0F172A'
      }
    };

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.spawnPresetSchool();

    this.bindEvents();

    this.setupIntersectionObserver();

    this.start();
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    this.width = rect.width;
    this.height = Math.max(rect.height, 420);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  bindEvents() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    parent.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, textarea')) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.addFood(x, y);
      this.addRipple(x, y, '#2563EB');
    });

    parent.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    });

    parent.addEventListener('mouseleave', () => {
      this.mouse.active = false;
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    parent.addEventListener('touchstart', (e) => {
      if (e.target.closest('a, button, input, textarea')) return;
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.addFood(x, y);
      this.addRipple(x, y, '#2563EB');
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.active = true;
    }, { passive: true });
  }

  spawnPresetSchool() {
    this.koi = [];

    const configs = [
      { xRatio: 0.84, yRatio: 0.38, type: 'sanke', scale: 1.25, angle: -0.85, speed: 0.95 },
      { xRatio: 0.88, yRatio: 0.18, type: 'kohaku', scale: 1.15, angle: 1.8, speed: 0.9 },
      { xRatio: 0.76, yRatio: 0.78, type: 'sanke', scale: 0.95, angle: -2.2, speed: 0.85 },
      { xRatio: 0.35, yRatio: 0.85, type: 'sanke', scale: 1.0, angle: 0.2, speed: 1.0 },
      { xRatio: 0.92, yRatio: 0.58, type: 'cobalt', scale: 0.85, angle: -1.4, speed: 1.15 },
      { xRatio: 0.52, yRatio: 0.88, type: 'minnow', scale: 0.65, angle: 3.1, speed: 1.4 },
      { xRatio: 0.78, yRatio: 0.12, type: 'minnow', scale: 0.6, angle: 1.2, speed: 1.35 }
    ];

    configs.forEach(cfg => {
      const x = (this.width || 800) * cfg.xRatio;
      const y = (this.height || 600) * cfg.yRatio;
      this.koi.push(new PixelKoi(this, x, y, cfg.type, cfg.scale, cfg.angle, cfg.speed));
    });

    if (this.hudKoi) {
      this.hudKoi.textContent = String(this.koi.length).padStart(2, '0');
    }
  }

  // Keeps wandering koi out of the hero headline area
  getTextExclusionBox() {
    const headline = document.querySelector('.hero-headline-wrap');
    if (!headline || !this.canvas) {
      return {
        left: 0,
        top: 0,
        right: (this.width || 800) * 0.65,
        bottom: (this.height || 600) * 0.52
      };
    }

    const cRect = this.canvas.getBoundingClientRect();
    const hRect = headline.getBoundingClientRect();

    const buffer = 45;
    const right = Math.min((hRect.right - cRect.left) + buffer, this.width - 120);
    const bottom = Math.min((hRect.bottom - cRect.top) + buffer, this.height - 80);

    return {
      left: 0,
      top: 0,
      right: Math.max(right, 260),
      bottom: Math.max(bottom, 220)
    };
  }

  addFood(x, y) {
    if (this.foods.length >= 12) {
      this.foods.shift();
    }

    this.foods.push({
      x,
      y,
      size: 5,
      pulse: 0,
      life: 1.0,
      eaten: false
    });

    this.foodCounter++;
    if (this.hudFood) {
      this.hudFood.textContent = String(this.foodCounter).padStart(2, '0');
    }
  }

  addRipple(x, y, color = '#2563EB') {
    this.ripples.push({
      x,
      y,
      radius: 6,
      maxRadius: 48,
      alpha: 0.6,
      color
    });
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!this.isRunning) this.start();
        } else {
          this.stop();
        }
      });
    }, { threshold: 0.05 });

    observer.observe(this.canvas);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  loop(now = performance.now()) {
    if (!this.isRunning) return;

    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt);
    this.draw();

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      f.pulse += dt * 4;
      if (f.eaten) {
        this.foods.splice(i, 1);
      }
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += dt * 38;
      r.alpha -= dt * 0.7;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    this.koi.forEach(fish => fish.update(dt));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawWaterGrid();

    this.drawRipples();

    this.drawFood();

    this.koi.forEach(fish => fish.draw(this.ctx));
  }

  drawWaterGrid() {
    const step = 28;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(20, 20, 18, 0.015)';

    const startX = 0;
    const startY = 0;

    for (let x = startX; x < this.width; x += step) {
      for (let y = startY; y < this.height; y += step) {
        this.ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
    this.ctx.restore();
  }

  drawRipples() {
    this.ctx.save();
    this.ripples.forEach(r => {
      this.ctx.strokeStyle = `rgba(37, 99, 235, ${Math.max(r.alpha, 0)})`;
      this.ctx.lineWidth = 1.2;

      const rHalf = r.radius;
      this.ctx.strokeRect(r.x - rHalf, r.y - rHalf, rHalf * 2, rHalf * 2);

      if (r.radius > 16) {
        const innerHalf = r.radius * 0.55;
        this.ctx.strokeStyle = `rgba(37, 99, 235, ${Math.max(r.alpha * 0.45, 0)})`;
        this.ctx.strokeRect(r.x - innerHalf, r.y - innerHalf, innerHalf * 2, innerHalf * 2);
      }
    });
    this.ctx.restore();
  }

  drawFood() {
    this.ctx.save();
    this.foods.forEach(f => {
      const pulseSize = f.size + Math.sin(f.pulse) * 1.5;
      this.ctx.fillStyle = 'rgba(234, 88, 12, 0.85)';
      this.ctx.fillRect(f.x - pulseSize / 2, f.y - pulseSize / 2, pulseSize, pulseSize);

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(f.x - 1.5, f.y - 1.5, 3, 3);
    });
    this.ctx.restore();
  }
}

class PixelKoi {
  constructor(pond, x, y, type = 'sanke', scale = 1, angle = 0, speed = 1) {
    this.pond = pond;
    this.x = x;
    this.y = y;
    this.type = type;
    this.scale = scale;
    this.angle = angle;
    this.targetAngle = angle;

    this.baseSpeed = (38 + Math.random() * 18) * speed;
    this.speed = this.baseSpeed;
    this.turnSpeed = 1.8 + Math.random() * 0.6;

    this.wigglePhase = Math.random() * Math.PI * 2;
    this.wiggleFreq = 3.6;
    this.wiggleAmp = 0.22;

    this.numSegments = type === 'minnow' ? 8 : 15;
    this.segmentDist = (type === 'minnow' ? 4.5 : 6.2) * scale;
    this.tileSize = Math.round((type === 'minnow' ? 5 : 7.2) * scale);
    this.tileGap = 1.0;

    this.spine = [];
    for (let i = 0; i < this.numSegments; i++) {
      this.spine.push({
        x: this.x - Math.cos(this.angle) * i * this.segmentDist,
        y: this.y - Math.sin(this.angle) * i * this.segmentDist,
        angle: this.angle
      });
    }

    this.palette = pond.palettes[type] || pond.palettes.sanke;

    this.bodyStructure = this.buildBodyStructure(type);

    this.wanderTimer = Math.random() * 3;
    this.wanderTargetX = this.x;
    this.wanderTargetY = this.y;
    this.pickNewWanderTarget();
  }

  buildBodyStructure(type) {
    if (type === 'minnow') {
      return [
        { count: 1, fins: false },
        { count: 2, fins: false },
        { count: 3, fins: true, finLen: 1 },
        { count: 3, fins: false },
        { count: 2, fins: false },
        { count: 2, fins: true, finLen: 1 },
        { count: 1, fins: false },
        { count: 2, fins: false }
      ];
    }

    return [
      { count: 2, fins: false },
      { count: 3, fins: false },
      { count: 4, fins: false },
      { count: 5, fins: false, eyes: true },
      { count: 5, fins: true, finLen: 2 },
      { count: 6, fins: true, finLen: 3 },
      { count: 6, fins: true, finLen: 2 },
      { count: 5, fins: false },
      { count: 5, fins: false },
      { count: 4, fins: true, finLen: 2 },
      { count: 4, fins: false },
      { count: 3, fins: false },
      { count: 2, fins: false },
      { count: 2, fins: false },
      { count: 4, fins: false, tail: true },
      { count: 5, fins: false, tail: true }
    ];
  }

  pickNewWanderTarget() {
    const margin = 50;
    const w = this.pond.width || 800;
    const h = this.pond.height || 600;
    const box = this.pond.getTextExclusionBox();

    const canDoBottom = box.bottom < (h - margin - 50);
    const canDoRight = box.right < (w - margin - 60);

    let chooseBottom = false;
    if (canDoBottom && canDoRight) {
      chooseBottom = Math.random() < 0.5;
    } else if (canDoBottom) {
      chooseBottom = true;
    }

    if (chooseBottom) {
      this.wanderTargetX = margin + Math.random() * (w - margin * 2);
      this.wanderTargetY = box.bottom + Math.random() * Math.max(h - margin - box.bottom, 60);
    } else {
      const minX = Math.min(box.right + 10, w - 180);
      this.wanderTargetX = minX + Math.random() * Math.max(w - margin - minX, 100);
      this.wanderTargetY = margin + Math.random() * (h - margin * 2);
    }

    this.wanderTimer = 3.2 + Math.random() * 4.2;
  }

  update(dt) {
    this.wigglePhase += dt * this.wiggleFreq * (this.speed / this.baseSpeed);

    let targetX = this.wanderTargetX;
    let targetY = this.wanderTargetY;
    let huntingFood = false;

    if (this.pond.foods.length > 0) {
      let closestDist = Infinity;
      let closestFood = null;

      this.pond.foods.forEach(f => {
        if (f.eaten) return;
        const dx = f.x - this.x;
        const dy = f.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d < closestDist && d < 650) {
          closestDist = d;
          closestFood = f;
        }
      });

      if (closestFood) {
        targetX = closestFood.x;
        targetY = closestFood.y;
        huntingFood = true;

        if (closestDist < 16 * this.scale) {
          closestFood.eaten = true;
          this.pond.addRipple(closestFood.x, closestFood.y, '#EA580C');
          this.speed = this.baseSpeed * 1.5;
        }
      }
    }

    if (!huntingFood && this.pond.mouse.active) {
      const dx = this.pond.mouse.x - this.x;
      const dy = this.pond.mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 140) {
        const steerAway = Math.atan2(this.y - this.pond.mouse.y, this.x - this.pond.mouse.x);
        targetX = this.x + Math.cos(steerAway) * 200;
        targetY = this.y + Math.sin(steerAway) * 200;
        this.speed = this.baseSpeed * 1.6;
      }
    }

    if (!huntingFood) {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.pickNewWanderTarget();
      }
    }

    const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);
    let diff = angleToTarget - this.angle;

    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    this.angle += diff * Math.min(this.turnSpeed * dt, 1);

    const margin = 45;
    const w = this.pond.width;
    const h = this.pond.height;

    if (this.x < margin) this.angle += (0 - this.angle) * 0.14;
    if (this.x > w - margin) this.angle += (Math.PI - this.angle) * 0.14;
    if (this.y < margin) this.angle += (Math.PI / 2 - this.angle) * 0.14;
    if (this.y > h - margin) this.angle += (-Math.PI / 2 - this.angle) * 0.14;

    // Bypass text exclusion while chasing food
    if (!huntingFood) {
      const box = this.pond.getTextExclusionBox();
      const insideX = this.x < box.right;
      const insideY = this.y < box.bottom;

      if (insideX && insideY) {
        const distToRight = box.right - this.x;
        const distToBottom = box.bottom - this.y;

        if (distToRight < distToBottom || box.bottom > (h - 100)) {
          this.angle += (0 - this.angle) * Math.min(dt * 7, 1);
        } else {
          this.angle += (Math.PI / 2 - this.angle) * Math.min(dt * 7, 1);
        }
      } else {
        if (this.x < box.right + 50 && this.y < box.bottom && Math.cos(this.angle) < 0) {
          this.angle += (0 - this.angle) * Math.min(dt * 5, 1);
        }
        if (this.y < box.bottom + 50 && this.x < box.right && Math.sin(this.angle) < 0) {
          this.angle += (Math.PI / 2 - this.angle) * Math.min(dt * 5, 1);
        }
      }
    }

    this.speed += (this.baseSpeed - this.speed) * dt * 2;

    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;

    this.spine[0].x = this.x;
    this.spine[0].y = this.y;
    this.spine[0].angle = this.angle;

    for (let i = 1; i < this.numSegments; i++) {
      const prev = this.spine[i - 1];
      const cur = this.spine[i];

      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const angle = Math.atan2(dy, dx);

      cur.x = prev.x + Math.cos(angle) * this.segmentDist;
      cur.y = prev.y + Math.sin(angle) * this.segmentDist;
      cur.angle = angle;
    }
  }

  draw(ctx) {
    const step = this.tileSize + this.tileGap;

    ctx.save();

    this.drawFins(ctx, step);

    for (let r = 0; r < this.spine.length; r++) {
      const seg = this.spine[r];
      const rowInfo = this.bodyStructure[r] || { count: 2 };
      const count = rowInfo.count;

      const wave = Math.sin(this.wigglePhase - r * 0.42) * (r * 0.65 * this.scale);

      const nx = -Math.sin(seg.angle);
      const ny = Math.cos(seg.angle);

      for (let c = 0; c < count; c++) {
        const offset = (c - (count - 1) / 2) * step + wave;
        const tx = seg.x + nx * offset;
        const ty = seg.y + ny * offset;

        const color = this.getTileColor(r, c, count);

        this.drawSquareTile(ctx, tx, ty, this.tileSize, seg.angle, color, r, c);
      }
    }

    ctx.restore();
  }

  drawFins(ctx, step) {
    for (let r = 0; r < this.spine.length; r++) {
      const seg = this.spine[r];
      const rowInfo = this.bodyStructure[r];
      if (!rowInfo || !rowInfo.fins) continue;

      const finLen = rowInfo.finLen || 2;
      const count = rowInfo.count;
      const nx = -Math.sin(seg.angle);
      const ny = Math.cos(seg.angle);

      const finSway = Math.sin(this.wigglePhase * 1.2 - r * 0.3) * 0.35;

      [-1, 1].forEach(side => {
        const baseOffset = (side * ((count - 1) / 2 + 1)) * step;

        for (let f = 0; f < finLen; f++) {
          const finOffset = baseOffset + side * f * step;
          const finLag = -Math.cos(seg.angle + finSway * side) * (f * 3.5);
          const fx = seg.x + nx * finOffset + finLag;
          const fy = seg.y + ny * finOffset + finLag;

          this.drawSquareTile(ctx, fx, fy, this.tileSize * 0.88, seg.angle + finSway * side, this.palette.fin);
        }
      });
    }

    if (this.type !== 'minnow' && this.spine.length > 0) {
      const head = this.spine[0];
      const nx = -Math.sin(head.angle);
      const ny = Math.cos(head.angle);
      const whiskerWiggle = Math.sin(this.wigglePhase * 2) * 2;

      [-1, 1].forEach(side => {
        const wx = head.x + Math.cos(head.angle) * 8 + nx * (side * 8 + whiskerWiggle);
        const wy = head.y + Math.sin(head.angle) * 8 + ny * (side * 8 + whiskerWiggle);
        this.drawSquareTile(ctx, wx, wy, this.tileSize * 0.45, head.angle, this.palette.base[0]);
      });
    }
  }

  getTileColor(row, col, totalCols) {
    const normRow = row / this.spine.length;
    const isEdge = col === 0 || col === totalCols - 1;

    if (this.type === 'sanke') {
      const isOrangePatch = (row >= 4 && row <= 8 && col >= 1 && col <= totalCols - 2) ||
                            (row === 2 && col === 1);
      if (isOrangePatch) {
        return this.palette.accent[Math.floor(Math.sin(row + col) * 1.5 + 2) % this.palette.accent.length];
      }

      if (normRow > 0.82) {
        return this.palette.light[0];
      }

      if (isEdge && normRow > 0.3) {
        return this.palette.base[0];
      }

      return this.palette.base[(row + col) % this.palette.base.length];
    }

    if (this.type === 'kohaku') {
      const isWhitePatch = (row >= 6 && row <= 9 && (col === 1 || col === 2)) || normRow > 0.8;
      if (isWhitePatch) {
        return this.palette.light[0];
      }
      return this.palette.base[(row * 2 + col) % this.palette.base.length];
    }

    if (this.type === 'cobalt') {
      if (normRow > 0.82) return this.palette.light[0];
      if (row % 3 === 0 && col === 1) return this.palette.accent[1];
      return this.palette.base[(row + col) % this.palette.base.length];
    }

    return this.palette.base[(row + col) % this.palette.base.length];
  }

  drawSquareTile(ctx, x, y, size, angle, color, r = 0, c = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    if ((r * 3 + c) % 5 === 0 && size >= 6 && !color.includes('rgba')) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(-0.8, -0.8, 1.6, 1.6);
    }

    ctx.restore();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('koiPondCanvas')) {
    window.koiPondInstance = new KoiPond('koiPondCanvas', {
      koiId: 'koiCount',
      foodId: 'foodCount'
    });
  }
});
