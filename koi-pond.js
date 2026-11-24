/**
 * ============================================================================
 * KOI POND ENGINE — PIXEL / SQUARE MOSAIC CANVAS SIMULATION
 * Inspired by Kai Linh's tactile square-matrix koi pond
 * 100% Pure Vanilla HTML5 Canvas & Physics (Zero Dependencies)
 * ============================================================================
 */

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

    // Palettes matching reference artwork: Cobalt Blue, Terracotta/Orange, Peach, Translucent White
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

  getTextBounds() {
    // Calculates bounding box of the big text headline in canvas-relative pixels
    const heroHeadline = document.querySelector('.hero-headline-wrap') || document.querySelector('.hero-title');
    if (!heroHeadline) {
      return {
        left: 0,
        right: Math.min(this.width * 0.65, 750),
        top: 0,
        bottom: Math.min(this.height * 0.45, 260)
      };
    }

    const rect = heroHeadline.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    return {
      left: 0,
      right: Math.max((rect.right - canvasRect.left) + 20, 240),
      top: 0,
      bottom: Math.max((rect.bottom - canvasRect.top) + 20, 180)
    };
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Spawn 7 Koi (matching reference 'koi 07')
    this.spawnPresetSchool();

    // Event Listeners for feeding & ripples
    this.bindEvents();

    // Auto-pause when scrolled out of view for 60fps battery efficiency
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

    // Click to drop food & trigger square ripple
    parent.addEventListener('click', (e) => {
      // If clicking interactive buttons/links, ignore
      if (e.target.closest('a, button, input, textarea')) return;

      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.addFood(x, y);
      this.addRipple(x, y, '#2563EB');
    });

    // Mouse move tracking
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

    // Touch support for mobile devices
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

    // Configurations strictly on the right side and bottom of the text by default
    const configs = [
      // 1. Large Alpha Sanke (right side)
      { xRatio: 0.84, yRatio: 0.38, type: 'sanke', scale: 1.25, angle: -0.65, speed: 0.95 },
      // 2. Large Kohaku (right side upper)
      { xRatio: 0.74, yRatio: 0.22, type: 'kohaku', scale: 1.15, angle: 1.1, speed: 0.9 },
      // 3. Medium Pale Sanke (far right)
      { xRatio: 0.90, yRatio: 0.58, type: 'sanke', scale: 0.95, angle: -1.8, speed: 0.85 },
      // 4. Medium Sanke (bottom of text)
      { xRatio: 0.32, yRatio: 0.85, type: 'sanke', scale: 1.0, angle: 0.2, speed: 1.0 },
      // 5. Cobalt Indigo Koi (bottom of text, wandering right)
      { xRatio: 0.52, yRatio: 0.88, type: 'cobalt', scale: 0.85, angle: -0.4, speed: 1.15 },
      // 6. Swift Cobalt Minnow 1 (far right top)
      { xRatio: 0.94, yRatio: 0.16, type: 'minnow', scale: 0.65, angle: -2.4, speed: 1.4 },
      // 7. Swift Cobalt Minnow 2 (bottom-right area)
      { xRatio: 0.76, yRatio: 0.82, type: 'minnow', scale: 0.6, angle: 2.5, speed: 1.35 }
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

  addFood(x, y) {
    if (this.foods.length >= 12) {
      this.foods.shift(); // keep max 12 pellets for neat pond
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
    // 1. Update Food Pellets
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const f = this.foods[i];
      f.pulse += dt * 4;
      if (f.eaten) {
        this.foods.splice(i, 1);
      }
    }

    // 2. Update Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += dt * 38;
      r.alpha -= dt * 0.7;
      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // 3. Update Koi
    this.koi.forEach(fish => fish.update(dt));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw Subtle Mosaic Grid Water Background
    this.drawWaterGrid();

    // Draw Ripples (Geometric Square Rings)
    this.drawRipples();

    // Draw Food Pellets (Pulsing Pixel Squares)
    this.drawFood();

    // Draw All Pixel Koi Fish
    this.koi.forEach(fish => fish.draw(this.ctx));
  }

  drawWaterGrid() {
    // Elegant barely-there water grid pattern
    const step = 28;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(20, 20, 18, 0.015)';

    const startX = 0;
    const startY = 0;

    for (let x = startX; x < this.width; x += step) {
      for (let y = startY; y < this.height; y += step) {
        // Micro square dots in a quiet grid
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

      // Draw concentric square ripple
      const rHalf = r.radius;
      this.ctx.strokeRect(r.x - rHalf, r.y - rHalf, rHalf * 2, rHalf * 2);

      // Inner faint square
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
      // Outer square beacon
      const pulseSize = f.size + Math.sin(f.pulse) * 1.5;
      this.ctx.fillStyle = 'rgba(234, 88, 12, 0.85)';
      this.ctx.fillRect(f.x - pulseSize / 2, f.y - pulseSize / 2, pulseSize, pulseSize);

      // Inner intense core
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(f.x - 1.5, f.y - 1.5, 3, 3);
    });
    this.ctx.restore();
  }
}


/**
 * PixelKoi: Represents a koi constructed out of square mosaic tiles
 */
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

    // Animation waves
    this.wigglePhase = Math.random() * Math.PI * 2;
    this.wiggleFreq = 3.6;
    this.wiggleAmp = 0.22;

    // Spine length and segments
    this.numSegments = type === 'minnow' ? 8 : 15;
    this.segmentDist = (type === 'minnow' ? 4.5 : 6.2) * scale;
    this.tileSize = Math.round((type === 'minnow' ? 5 : 7.2) * scale);
    this.tileGap = 1.0;

    // Initialize Spine
    this.spine = [];
    for (let i = 0; i < this.numSegments; i++) {
      this.spine.push({
        x: this.x - Math.cos(this.angle) * i * this.segmentDist,
        y: this.y - Math.sin(this.angle) * i * this.segmentDist,
        angle: this.angle
      });
    }

    // Palette
    this.palette = pond.palettes[type] || pond.palettes.sanke;

    // Generate Body Matrix & Patch Map
    this.bodyStructure = this.buildBodyStructure(type);

    // AI Wandering
    this.wanderTimer = Math.random() * 3;
    this.wanderTargetX = this.x;
    this.wanderTargetY = this.y;
    this.pickNewWanderTarget();
  }

  buildBodyStructure(type) {
    // Defines each row from snout (0) to tail tip (N)
    // row = { count: numberOfSquares, hasFins: boolean, finLength: number }
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
      { count: 2, fins: false },            // Row 0: Mouth / Whiskers
      { count: 3, fins: false },            // Row 1: Snout
      { count: 4, fins: false },            // Row 2: Forehead
      { count: 5, fins: false, eyes: true },// Row 3: Eyes & head
      { count: 5, fins: true, finLen: 2 },  // Row 4: Shoulders & Pectoral start
      { count: 6, fins: true, finLen: 3 },  // Row 5: Main pectoral fin row
      { count: 6, fins: true, finLen: 2 },  // Row 6: Rear pectoral
      { count: 5, fins: false },            // Row 7: Mid-body
      { count: 5, fins: false },            // Row 8: Belly
      { count: 4, fins: true, finLen: 2 },  // Row 9: Pelvic fins
      { count: 4, fins: false },            // Row 10: Waist
      { count: 3, fins: false },            // Row 11: Tail base
      { count: 2, fins: false },            // Row 12: Narrow caudal stalk
      { count: 2, fins: false },            // Row 13: Caudal base
      { count: 4, fins: false, tail: true },// Row 14: Caudal fan
      { count: 5, fins: false, tail: true } // Row 15: Caudal tip
    ];
  }

  pickNewWanderTarget() {
    const margin = 45;
    const w = this.pond.width || 800;
    const h = this.pond.height || 600;
    const bounds = this.pond.getTextBounds();

    // Default wandering strictly in Zone 1 (Right of text) or Zone 2 (Bottom of text)
    const canGoRight = bounds.right < w - margin;
    const canGoBottom = bounds.bottom < h - margin;

    const chooseRight = (canGoRight && !canGoBottom) || (canGoRight && Math.random() < 0.65);

    if (chooseRight) {
      // Zone 1: Exclusively to the right side of the text
      const minX = bounds.right + 20;
      const maxX = w - margin;
      this.wanderTargetX = minX + Math.random() * Math.max(maxX - minX, 40);
      this.wanderTargetY = margin + Math.random() * (h - margin * 2);
    } else {
      // Zone 2: Exclusively to the bottom of the text
      const minY = bounds.bottom + 20;
      const maxY = h - margin;
      this.wanderTargetX = margin + Math.random() * (w - margin * 2);
      this.wanderTargetY = minY + Math.random() * Math.max(maxY - minY, 40);
    }

    this.wanderTimer = 3.2 + Math.random() * 4.2;
  }

  update(dt) {
    this.wigglePhase += dt * this.wiggleFreq * (this.speed / this.baseSpeed);

    // 1. Check for Food Pellets (Feeding can take fish anywhere on the canvas!)
    let targetX = this.wanderTargetX;
    let targetY = this.wanderTargetY;
    let huntingFood = false;

    if (this.pond.foods.length > 0) {
      // Find closest uneaten food
      let closestDist = Infinity;
      let closestFood = null;

      this.pond.foods.forEach(f => {
        if (f.eaten) return;
        const dx = f.x - this.x;
        const dy = f.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d < closestDist && d < 480) {
          closestDist = d;
          closestFood = f;
        }
      });

      if (closestFood) {
        targetX = closestFood.x;
        targetY = closestFood.y;
        huntingFood = true;

        // Eat food when reached
        if (closestDist < 16 * this.scale) {
          closestFood.eaten = true;
          this.pond.addRipple(closestFood.x, closestFood.y, '#EA580C');
          this.speed = this.baseSpeed * 1.5; // spurt of joy
        }
      }
    }

    // 2. Cursor Avoidance / Interaction
    if (!huntingFood && this.pond.mouse.active) {
      const dx = this.pond.mouse.x - this.x;
      const dy = this.pond.mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 140) {
        // Glide smoothly away from cursor
        const steerAway = Math.atan2(this.y - this.pond.mouse.y, this.x - this.pond.mouse.x);
        targetX = this.x + Math.cos(steerAway) * 200;
        targetY = this.y + Math.sin(steerAway) * 200;
        this.speed = this.baseSpeed * 1.6;
      }
    }

    // 3. Wander Timer
    if (!huntingFood) {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.pickNewWanderTarget();
      }
    }

    // 4. Steer towards target
    const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);
    let diff = angleToTarget - this.angle;

    // Normalize angle difference to -PI..PI
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;

    this.angle += diff * Math.min(this.turnSpeed * dt, 1);

    // 5. Text Exclusion Zone: Disallow swimming around or behind big text by default
    // Note: When huntingFood is true (user clicked to feed), koi are free to go anywhere!
    if (!huntingFood) {
      const bounds = this.pond.getTextBounds();

      // If inside the text exclusion zone (upper-left quadrant containing the big text)
      if (this.x < bounds.right && this.y < bounds.bottom) {
        // Find shortest exit: either steer right (to open right side) or steer down (to bottom water)
        const distRight = bounds.right - this.x;
        const distBottom = bounds.bottom - this.y;

        const escapeAngle = distRight <= distBottom ? 0 : Math.PI / 2;
        let escDiff = escapeAngle - this.angle;
        while (escDiff < -Math.PI) escDiff += Math.PI * 2;
        while (escDiff > Math.PI) escDiff -= Math.PI * 2;

        this.angle += escDiff * 0.28;
        this.speed = Math.max(this.speed, this.baseSpeed * 1.5);
      }
    }

    // 6. Canvas Outer Margin Repulsion
    const margin = 45;
    const w = this.pond.width;
    const h = this.pond.height;

    if (this.x < margin) this.angle += (0 - this.angle) * 0.12;
    if (this.x > w - margin) this.angle += (Math.PI - this.angle) * 0.12;
    if (this.y < margin) this.angle += (Math.PI / 2 - this.angle) * 0.12;
    if (this.y > h - margin) this.angle += (-Math.PI / 2 - this.angle) * 0.12;

    // Dampen speed back to base
    this.speed += (this.baseSpeed - this.speed) * dt * 2;

    // 6. Move Head Position
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;

    // Update Spine using Inverse Kinematics with gentle lateral wave
    this.spine[0].x = this.x;
    this.spine[0].y = this.y;
    this.spine[0].angle = this.angle;

    for (let i = 1; i < this.numSegments; i++) {
      const prev = this.spine[i - 1];
      const cur = this.spine[i];

      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const angle = Math.atan2(dy, dx);

      // Distance constraint
      cur.x = prev.x + Math.cos(angle) * this.segmentDist;
      cur.y = prev.y + Math.sin(angle) * this.segmentDist;
      cur.angle = angle;
    }
  }

  draw(ctx) {
    const step = this.tileSize + this.tileGap;

    ctx.save();

    // 1. Draw Pectoral & Pelvic Fins First (under the body)
    this.drawFins(ctx, step);

    // 2. Draw Main Body Square Grid Rows
    for (let r = 0; r < this.spine.length; r++) {
      const seg = this.spine[r];
      const rowInfo = this.bodyStructure[r] || { count: 2 };
      const count = rowInfo.count;

      // Lateral sine wave wiggle factor for natural spine undulation
      const wave = Math.sin(this.wigglePhase - r * 0.42) * (r * 0.65 * this.scale);

      // Normal vector perpendicular to segment angle
      const nx = -Math.sin(seg.angle);
      const ny = Math.cos(seg.angle);

      for (let c = 0; c < count; c++) {
        const offset = (c - (count - 1) / 2) * step + wave;
        const tx = seg.x + nx * offset;
        const ty = seg.y + ny * offset;

        // Determine Tile Color based on position and type
        const color = this.getTileColor(r, c, count);

        this.drawSquareTile(ctx, tx, ty, this.tileSize, seg.angle, color, r, c);
      }
    }

    ctx.restore();
  }

  drawFins(ctx, step) {
    // Draw trailing square fin elements that sway with the swimming wave
    for (let r = 0; r < this.spine.length; r++) {
      const seg = this.spine[r];
      const rowInfo = this.bodyStructure[r];
      if (!rowInfo || !rowInfo.fins) continue;

      const finLen = rowInfo.finLen || 2;
      const count = rowInfo.count;
      const nx = -Math.sin(seg.angle);
      const ny = Math.cos(seg.angle);

      // Fin sway lag
      const finSway = Math.sin(this.wigglePhase * 1.2 - r * 0.3) * 0.35;

      // Left and right fins
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

    // Whiskers at head (Row 0)
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
    // Generates color pattern matching the iconic Kai Linh Sanke / Kohaku / Cobalt look
    const normRow = row / this.spine.length;
    const isEdge = col === 0 || col === totalCols - 1;

    if (this.type === 'sanke') {
      // Big bold terracotta orange patch on back / mid-body
      const isOrangePatch = (row >= 4 && row <= 8 && col >= 1 && col <= totalCols - 2) ||
                            (row === 2 && col === 1);
      if (isOrangePatch) {
        return this.palette.accent[Math.floor(Math.sin(row + col) * 1.5 + 2) % this.palette.accent.length];
      }

      // Tail fins: translucent white
      if (normRow > 0.82) {
        return this.palette.light[0];
      }

      // Edge shading or pure cobalt body
      if (isEdge && normRow > 0.3) {
        return this.palette.base[0];
      }

      return this.palette.base[(row + col) % this.palette.base.length];
    }

    if (this.type === 'kohaku') {
      // Vibrant orange body with clean white patches
      const isWhitePatch = (row >= 6 && row <= 9 && (col === 1 || col === 2)) || normRow > 0.8;
      if (isWhitePatch) {
        return this.palette.light[0];
      }
      return this.palette.base[(row * 2 + col) % this.palette.base.length];
    }

    if (this.type === 'cobalt') {
      // Monochromatic royal cobalt blue with light azure highlights
      if (normRow > 0.82) return this.palette.light[0];
      if (row % 3 === 0 && col === 1) return this.palette.accent[1];
      return this.palette.base[(row + col) % this.palette.base.length];
    }

    // Minnow: Sleek deep blue
    return this.palette.base[(row + col) % this.palette.base.length];
  }

  drawSquareTile(ctx, x, y, size, angle, color, r = 0, c = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Main Square Fill
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);

    // Micro-glyph / dot details (just like in the reference image)
    // On select tiles, render a subtle micro-dot or plus for retro mosaic charm
    if ((r * 3 + c) % 5 === 0 && size >= 6 && !color.includes('rgba')) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(-0.8, -0.8, 1.6, 1.6);
    }

    ctx.restore();
  }
}

// Auto-instantiate when DOM is ready if canvas exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('koiPondCanvas')) {
    window.koiPondInstance = new KoiPond('koiPondCanvas', {
      koiId: 'koiCount',
      foodId: 'foodCount'
    });
  }
});
