// Optimized emoji particle system for game results

class Particle {
  constructor(x, y, emoji, vx, vy, isRain = false) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.vx = vx;
    this.vy = vy;
    this.isRain = isRain;
    this.gravity = isRain ? 0.05 : 0.15;
    this.life = isRain ? 220 : 180;
    this.maxLife = this.life;
    this.size = isRain ? random(14, 22) : random(16, 28);
    this.rotation = 0;
    this.rotationSpeed = isRain ? random(-0.03, 0.03) : random(-0.08, 0.08);
    this.fadeRate = isRain ? random(1, 2.5) : random(2, 4);

    // Pre-calculate alpha multiplier to avoid map() calls
    this.alphaMultiplier = 255 / this.maxLife;

    // Cache for rendered appearance to reduce calculations
    this.cachedAlpha = 255;
    this.isActive = true;
  }

  update() {
    if (!this.isActive) return;

    // Apply physics
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    // Air resistance (combined operations)
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Update rotation
    this.rotation += this.rotationSpeed;

    // Fade out over time
    this.life -= this.fadeRate;

    // Pre-calculate alpha to avoid map() in draw
    this.cachedAlpha = this.life * this.alphaMultiplier;

    // Edge handling and life check (combined)
    if (
      this.life <= 0 ||
      this.x < -50 ||
      this.x > width + 50 ||
      this.y > height + 50
    ) {
      this.isActive = false;
    }
  }

  // Optimized draw without push/pop - caller handles transformation state
  fastDraw() {
    if (!this.isActive || this.cachedAlpha <= 0) return false;

    fill(255, 255, 255, this.cachedAlpha);
    textSize(this.size);
    text(this.emoji, this.x, this.y);
    return true;
  }

  // Legacy draw method for compatibility
  draw() {
    if (!this.isActive) return;

    push();
    translate(this.x, this.y);
    fill(255, 255, 255, this.cachedAlpha);
    textSize(this.size);
    text(this.emoji, 0, 0);
    pop();
  }

  isDead() {
    return !this.isActive;
  }

  // Reset particle for object pooling
  reset(x, y, emoji, vx, vy, isRain = false) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.vx = vx;
    this.vy = vy;
    this.isRain = isRain;
    this.gravity = isRain ? 0.05 : 0.15;
    this.life = isRain ? 220 : 180;
    this.maxLife = this.life;
    this.size = isRain ? random(14, 22) : random(16, 28);
    this.rotation = 0;
    this.rotationSpeed = isRain ? random(-0.03, 0.03) : random(-0.08, 0.08);
    this.fadeRate = isRain ? random(1, 2.5) : random(2, 4);
    this.alphaMultiplier = 255 / this.maxLife;
    this.cachedAlpha = 255;
    this.isActive = true;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.particlePool = []; // Object pool for reusing particles
    this.activeCount = 0; // Track active particles without array filtering
    this.isActive = false;
    this.lastSpawnTime = 0;
    this.spawnDuration = 1500;
    this.startTime = 0;
    this.maxParticles = 50;
    this.successEmojis = ["🎉", "⭐", "🎊", "🌟", "💫", "✨"];
    this.failureEmojis = [
      "💧",
      "😢",
      "💔",
      "🌧️",
      "😭",
      "💦",
      "☔",
      "😔",
      "⛈️",
      "💙",
    ];
    this.currentEmojis = [];

    // Pre-allocate particle pool to avoid garbage collection
    this.initializePool();
  }

  initializePool() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particlePool.push(new Particle(0, 0, "🎉", 0, 0));
      this.particles.push(this.particlePool[i]);
    }
  }

  getPooledParticle() {
    for (let particle of this.particlePool) {
      if (particle.isDead()) return particle;
    }
    return null;
  }

  start(gameResult) {
    this.isActive = true;
    this.startTime = millis();
    this.gameResult = gameResult;
    this.activeCount = 0;

    for (let particle of this.particlePool) particle.isActive = false;

    if (gameResult === "success") {
      this.currentEmojis = this.successEmojis;
      this.spawnDuration = 3000;
      this.createBurst(width / 2, height / 2, 10);
    } else {
      this.currentEmojis = this.failureEmojis;
      this.spawnDuration = 2500;
      this.createRainBurst();
    }
  }

  update() {
    if (!this.isActive) return;

    let currentTime = millis();

    // Continue spawning particles for a duration
    if (
      currentTime - this.startTime < this.spawnDuration &&
      this.activeCount < this.maxParticles
    ) {
      if (this.gameResult === "success") {
        if (currentTime - this.lastSpawnTime > 400) {
          this.createBurst(
            random(width * 0.3, width * 0.7),
            random(height * 0.4, height * 0.6),
            random(5, 10)
          );
          this.lastSpawnTime = currentTime;
        }
      } else {
        if (currentTime - this.lastSpawnTime > 80) {
          this.createRainBurst();
          this.lastSpawnTime = currentTime;
        }
      }
    }

    // Update particles and count active ones
    this.activeCount = 0;
    for (let particle of this.particlePool) {
      if (particle.isActive) {
        particle.update();
        if (particle.isActive) {
          this.activeCount++;
        }
      }
    }

    // Stop system when no particles left and spawn time is over
    if (
      this.activeCount === 0 &&
      currentTime - this.startTime > this.spawnDuration
    ) {
      this.isActive = false;
    }
  }

  createBurst(x, y, count) {
    if (this.activeCount >= this.maxParticles) return;

    let actualCount = Math.min(count, this.maxParticles - this.activeCount);
    let created = 0;

    for (let i = 0; i < actualCount && created < actualCount; i++) {
      let particle = this.getPooledParticle();
      if (!particle) break;

      let angle = random(TWO_PI);
      let speed = random(3, 6);
      let vx = cos(angle) * speed;
      let vy = sin(angle) * speed - random(1, 3);
      let emoji = random(this.currentEmojis);

      particle.reset(x, y, emoji, vx, vy, false);
      created++;
    }
  }

  createRainBurst() {
    if (this.activeCount >= this.maxParticles) return;

    let rainCount = Math.min(
      random(4, 8),
      this.maxParticles - this.activeCount
    );
    let created = 0;

    for (let i = 0; i < rainCount && created < rainCount; i++) {
      let particle = this.getPooledParticle();
      if (!particle) break;
      particle.reset(
        random(0, width),
        random(-50, -10),
        random(this.currentEmojis),
        random(-1, 1),
        random(2, 5),
        true
      );
      created++;
    }
  }

  draw() {
    if (!this.isActive) return;

    // Batch rendering with fewer state changes
    textAlign(CENTER, CENTER);

    // Use fast draw method to avoid push/pop overhead
    for (let particle of this.particlePool) {
      if (particle.isActive) {
        particle.fastDraw();
      }
    }
  }

  stop() {
    this.isActive = false;
    this.activeCount = 0;
    // Reset all particles to inactive instead of clearing array
    for (let particle of this.particlePool) {
      particle.isActive = false;
    }
  }

  getParticleCount() {
    return this.activeCount;
  }
}
