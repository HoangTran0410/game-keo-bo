// Emoji particle system for game results

class Particle {
  constructor(x, y, emoji, vx, vy, isRain = false) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.vx = vx; // velocity x
    this.vy = vy; // velocity y
    this.isRain = isRain;
    this.gravity = isRain ? 0.05 : 0.15; // less gravity for rain
    this.life = isRain ? 220 : 180; // rain lasts longer
    this.maxLife = this.life;
    this.size = isRain ? random(14, 22) : random(16, 28);
    this.rotation = 0;
    this.rotationSpeed = isRain ? random(-0.03, 0.03) : random(-0.08, 0.08); // less rotation for rain
    this.fadeRate = isRain ? random(1, 2.5) : random(2, 4); // slower fade for rain
  }

  update() {
    // Apply physics
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    // Add air resistance
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Update rotation
    this.rotation += this.rotationSpeed;

    // Fade out over time
    this.life -= this.fadeRate;

    // Simple edge handling - just remove particles that go off screen
    if (this.x < -50 || this.x > width + 50 || this.y > height + 50) {
      this.life = 0; // kill particle immediately
    }
  }

  draw() {
    if (this.life <= 0) return;

    // Calculate alpha based on remaining life
    let alpha = map(this.life, 0, this.maxLife, 0, 255);

    // Simplified rendering - minimal transformations for performance
    push();
    translate(this.x, this.y);
    // Only rotate every few frames to reduce calculations
    // if (frameCount % 3 === 0) {
    //   rotate(this.rotation);
    // }

    fill(255, 255, 255, alpha);
    textAlign(CENTER, CENTER);
    textSize(this.size);
    text(this.emoji, 0, 0);

    pop();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.isActive = false;
    this.lastSpawnTime = 0;
    this.spawnDuration = 1500; // spawn duration for success
    this.startTime = 0;
    this.maxParticles = 50; // limit total particles
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
  }

  start(gameResult) {
    this.isActive = true;
    this.startTime = millis();
    this.particles = [];
    this.gameResult = gameResult;

    // Choose emoji set and duration based on result
    if (gameResult === "success") {
      this.currentEmojis = this.successEmojis;
      this.spawnDuration = 1500; // shorter for success
      // Create initial burst for success
      this.createBurst(width / 2, height / 2, 10);
    } else {
      this.currentEmojis = this.failureEmojis;
      this.spawnDuration = 2500; // longer rain for failure
      // Start rain effect for failure
      this.createRainBurst();
    }
  }

  update() {
    if (!this.isActive) return;

    let currentTime = millis();

    // Continue spawning particles for a duration
    if (
      currentTime - this.startTime < this.spawnDuration &&
      this.particles.length < this.maxParticles
    ) {
      // Different spawn patterns based on game result
      if (this.gameResult === "success") {
        // Burst pattern for success
        if (currentTime - this.lastSpawnTime > 400) {
          this.createBurst(
            random(width * 0.3, width * 0.7),
            random(height * 0.4, height * 0.6),
            random(5, 10)
          );
          this.lastSpawnTime = currentTime;
        }
      } else {
        // Rain pattern for failure - more frequent rain
        if (currentTime - this.lastSpawnTime > 80) {
          this.createRainBurst();
          this.lastSpawnTime = currentTime;
        }
      }
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();

      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }

    // Stop system when no particles left and spawn time is over
    if (
      this.particles.length === 0 &&
      currentTime - this.startTime > this.spawnDuration
    ) {
      this.isActive = false;
    }
  }

  createBurst(x, y, count) {
    // Don't create more particles if we're at the limit
    if (this.particles.length >= this.maxParticles) return;

    let actualCount = Math.min(
      count,
      this.maxParticles - this.particles.length
    );

    for (let i = 0; i < actualCount; i++) {
      let angle = random(TWO_PI);
      let speed = random(3, 6); // reduced speed range
      let vx = cos(angle) * speed;
      let vy = sin(angle) * speed - random(1, 3); // less upward bias

      let emoji = random(this.currentEmojis);

      this.particles.push(new Particle(x, y, emoji, vx, vy));
    }
  }

  createRainBurst() {
    // Don't create more particles if we're at the limit
    if (this.particles.length >= this.maxParticles) return;

    // Create 4-8 rain particles across the top of the screen for heavier rain
    let rainCount = Math.min(
      random(4, 8),
      this.maxParticles - this.particles.length
    );

    for (let i = 0; i < rainCount; i++) {
      // Spawn from top of screen, spread across width
      let x = random(0, width);
      let y = random(-50, -10); // Start above screen

      // Rain falls mostly straight down with slight horizontal drift
      let vx = random(-1, 1); // slight horizontal drift
      let vy = random(2, 5); // consistent downward velocity

      let emoji = random(this.currentEmojis);

      this.particles.push(new Particle(x, y, emoji, vx, vy, true));
    }
  }

  draw() {
    if (!this.isActive) return;

    for (let particle of this.particles) {
      particle.draw();
    }
  }

  stop() {
    this.isActive = false;
    this.particles = [];
  }

  getParticleCount() {
    return this.particles.length;
  }
}
