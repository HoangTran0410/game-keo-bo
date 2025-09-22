// Game Kéo Bò - P5.js
// Biến background
let backgroundImg;

// Các biến game state
let gameState = "playing"; // 'playing', 'catching', 'pulling', 'success', 'failed'
let score = 0;
let cows = [];
let rope = null;
let handPosition = {};
let pullProgress = 0;
let pullTarget = 0;
let pullCount = 0;
let caughtCow = null;
let message = "";
let messageTimer = 0;

// Animation variables
let pullAnimation = {
  cowStartX: 0,
  cowStartY: 0,
  ropeLength: 0,
  playerShake: 0,
  pullIntensity: 0,
  progressPulse: 0,
};

// Escape animation variables
let escapeAnimation = {
  isEscaping: false,
  escapingCow: null,
  escapeStartTime: 0,
  escapeEndTime: 0,
  trollMessages: [
    "😈 Hehe!",
    "🐄 Bye bye!",
    "💨 Too slow!",
    "😝 Nice try!",
    "🏃 Zoom zoom!",
  ],
  currentMessage: "",
  messageTimer: 0,
  particles: [],
};

// Success animation variables
let successAnimation = {
  isActive: false,
  startTime: 0,
  duration: 180, // 3 seconds at 60fps
  particles: [],
  pulseEffect: 0,
  cowFloat: 0,
  screenShake: 0,
  celebration: {
    messages: [
      "🎉 Tuyệt vời!",
      "⭐ Xuất sắc!",
      "🏆 Thành công!",
      "💪 Giỏi quá!",
      "🔥 Tài giỏi!",
    ],
    currentMessage: "",
    messageScale: 1,
    rainbow: 0,
  },
};

// Cài đặt game
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const COW_COUNT = 4;
const ROPE_SPEED = 8;
const COW_SPEED = 2;

// 3D Perspective settings
const PERSPECTIVE_MIN_Y = 200; // Furthest point (smallest scale) - top of screen
const PERSPECTIVE_MAX_Y = 400; // Closest point (largest scale) - bottom of screen
const PERSPECTIVE_MIN_SCALE = 0.5; // Minimum scale factor (far away)
const PERSPECTIVE_MAX_SCALE = 1.2; // Maximum scale factor (close up)

// Cow size system
const COW_SIZES = {
  small: { size: 30, difficulty: 0.9, pullMin: 8, pullMax: 12, points: 5 },
  medium: { size: 50, difficulty: 0.7, pullMin: 12, pullMax: 18, points: 10 },
  large: { size: 70, difficulty: 0.4, pullMin: 18, pullMax: 25, points: 20 },
};

function preload() {
  // Load background image
  backgroundImg = loadImage("assets/background.png");
}

function setup() {
  let canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent(document.body);
  canvas.id("game-canvas");

  // Khởi tạo hand position
  handPosition = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 80,
    size: 30,
  };

  // Khởi tạo đàn bò
  initializeCows();
}

// Calculate perspective scale based on Y position
function getPerspectiveScale(y) {
  // Clamp Y between min and max
  let clampedY = constrain(y, PERSPECTIVE_MIN_Y, PERSPECTIVE_MAX_Y);

  // Map Y to scale factor (higher Y = larger scale, lower Y = smaller scale)
  let scale = map(
    clampedY,
    PERSPECTIVE_MIN_Y,
    PERSPECTIVE_MAX_Y,
    PERSPECTIVE_MIN_SCALE,
    PERSPECTIVE_MAX_SCALE
  );

  return scale;
}

function draw() {
  // Vẽ background image
  if (backgroundImg) {
    image(backgroundImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    // Fallback to colored background if image fails to load
    background(135, 206, 235); // Sky blue
  }

  // Vẽ đất
  //   fill(34, 139, 34);
  //   rect(0, CANVAS_HEIGHT - 100, CANVAS_WIDTH, 100);

  // Update và vẽ bò
  updateAndDrawCows();

  // Update và vẽ dây thòng lọng
  updateAndDrawRope();

  // Vẽ hand
  drawHand();

  // Vẽ UI
  drawUI();

  // Kiểm tra va chạm
  checkCollisions();

  // Update pulling mechanic
  updatePulling();

  // Update escape animation
  updateEscapeAnimation();

  // Update success animation
  updateSuccessAnimation();

  // Update message timer
  if (messageTimer > 0) {
    messageTimer--;
    if (messageTimer <= 0) {
      message = "";
    }
  }

  // Draw success animation effects (drawn last to appear on top)
  drawSuccessEffects();
}

function initializeCows() {
  cows = [];
  for (let i = 0; i < COW_COUNT; i++) {
    // Random cow size type
    let sizeTypes = Object.keys(COW_SIZES);
    let randomType = sizeTypes[floor(random(sizeTypes.length))];
    let cowData = COW_SIZES[randomType];

    cows.push({
      x: CANVAS_WIDTH + 50 + i * 150, // Start from right side
      y: random(PERSPECTIVE_MIN_Y, PERSPECTIVE_MAX_Y), // Random depth for 3D effect
      size: cowData.size,
      sizeType: randomType,
      speed: -(COW_SPEED + random(-0.5, 0.5)), // Negative speed (left direction)
      caught: false,
      color: color(random(100, 255), random(100, 200), random(100, 150)),
      difficulty: cowData.difficulty,
      pullMin: cowData.pullMin,
      pullMax: cowData.pullMax,
      points: cowData.points,
    });
  }
}

function updateAndDrawCows() {
  for (let i = cows.length - 1; i >= 0; i--) {
    let cow = cows[i];

    if (!cow.caught) {
      // Di chuyển bò
      cow.x += cow.speed;

      // Nếu bò chạy ra ngoài màn hình bên trái, respawn từ bên phải
      if (cow.x < -100) {
        cow.x = random(CANVAS_WIDTH + 100, CANVAS_WIDTH + 400);
        cow.y = random(PERSPECTIVE_MIN_Y, PERSPECTIVE_MAX_Y); // Random depth for 3D effect
        cow.speed = -(COW_SPEED + random(-0.5, 0.5));

        // Generate new random size when respawning
        let sizeTypes = Object.keys(COW_SIZES);
        let randomType = sizeTypes[floor(random(sizeTypes.length))];
        let cowData = COW_SIZES[randomType];

        cow.size = cowData.size;
        cow.sizeType = randomType;
        cow.difficulty = cowData.difficulty;
        cow.pullMin = cowData.pullMin;
        cow.pullMax = cowData.pullMax;
        cow.points = cowData.points;
        cow.color = color(random(100, 255), random(100, 200), random(100, 150));
      }
    }

    // Vẽ bò
    drawCow(cow);
  }
}

function drawCow(cow) {
  push();
  translate(cow.x, cow.y);

  // Calculate perspective scale based on Y position
  let perspectiveScale = getPerspectiveScale(cow.y);

  // Add escape animation effects
  let bounceY = 0;
  let isEscaping =
    escapeAnimation.isEscaping && escapeAnimation.escapingCow === cow;

  if (isEscaping) {
    // Bouncing animation when escaping
    bounceY = sin(frameCount * 0.8) * 15;
    translate(0, bounceY);

    // Add rotation/wobble effect
    rotate(sin(frameCount * 0.6) * 0.3);
  }

  // Apply perspective scaling and flip horizontally
  scale(-perspectiveScale, perspectiveScale);

  // Thân bò
  fill(cow.color);
  ellipse(0, 0, cow.size, cow.size * 0.7);

  // Đầu bò
  fill(cow.color);
  ellipse(-cow.size * 0.4, -cow.size * 0.2, cow.size * 0.6, cow.size * 0.5);

  // Chân bò (animated when escaping)
  fill(0);
  for (let i = 0; i < 4; i++) {
    let x = -cow.size * 0.3 + i * cow.size * 0.2;
    let legOffset = isEscaping ? sin(frameCount * 0.5 + i) * 3 : 0;
    rect(x - 2, cow.size * 0.25 + legOffset, 4, cow.size * 0.3);
  }

  // Mắt (troll expression when escaping)
  fill(255);
  ellipse(-cow.size * 0.5, -cow.size * 0.3, 8, 8);
  fill(0);

  if (isEscaping) {
    // Winking troll eye
    ellipse(-cow.size * 0.5, -cow.size * 0.3, 8, 2); // Squinted eye

    // Troll mouth
    stroke(0);
    strokeWeight(2);
    noFill();
    arc(-cow.size * 0.45, -cow.size * 0.15, 12, 8, 0, PI); // Smile
  } else {
    ellipse(-cow.size * 0.5, -cow.size * 0.3, 4, 4);
  }

  // Sừng
  fill(139, 69, 19);
  triangle(
    -cow.size * 0.6,
    -cow.size * 0.4,
    -cow.size * 0.55,
    -cow.size * 0.6,
    -cow.size * 0.5,
    -cow.size * 0.4
  );
  triangle(
    -cow.size * 0.4,
    -cow.size * 0.4,
    -cow.size * 0.35,
    -cow.size * 0.6,
    -cow.size * 0.3,
    -cow.size * 0.4
  );

  // Size indicator (crown for large cows, dot for small cows)
  if (cow.sizeType === "large") {
    // Crown for large cows
    fill(255, 215, 0); // Gold
    triangle(
      -cow.size * 0.3,
      -cow.size * 0.7,
      -cow.size * 0.25,
      -cow.size * 0.9,
      -cow.size * 0.2,
      -cow.size * 0.7
    );
    triangle(
      -cow.size * 0.15,
      -cow.size * 0.7,
      -cow.size * 0.1,
      -cow.size * 0.85,
      -cow.size * 0.05,
      -cow.size * 0.7
    );
    triangle(
      -cow.size * 0.45,
      -cow.size * 0.7,
      -cow.size * 0.4,
      -cow.size * 0.85,
      -cow.size * 0.35,
      -cow.size * 0.7
    );
  } else if (cow.sizeType === "small") {
    // Small dot for small cows
    fill(0, 255, 0); // Green
    ellipse(-cow.size * 0.3, -cow.size * 0.6, 5, 5);
  }

  pop();

  // Draw escape particles
  if (isEscaping) {
    drawEscapeParticles(cow);
  }

  // Draw troll speech bubble
  if (isEscaping && escapeAnimation.messageTimer > 0) {
    drawTrollSpeechBubble(cow);
  }

  // Size and difficulty indicator text above cow
  push();
  textAlign(CENTER);
  textSize(12);
  fill(255);
  stroke(0);
  strokeWeight(1);

  let sizeText = cow.sizeType.toUpperCase();
  let difficultyText = Math.round((1 - cow.difficulty) * 100) + "%";
  text(sizeText, cow.x, cow.y - cow.size * 0.6 - 15);
  text(difficultyText, cow.x, cow.y - cow.size * 0.6 - 5);
  pop();
}

function updateAndDrawRope() {
  if (rope && gameState === "catching") {
    // Di chuyển dây lên trên
    rope.y -= ROPE_SPEED;

    // Nếu dây ra khỏi màn hình, reset
    if (rope.y < 200) {
      rope = null;
      gameState = "playing";
    }
  }

  // Vẽ dây
  if (rope) {
    drawRope();
  }
}

function drawRope() {
  if (!rope) return;

  push();

  // Calculate rope thickness based on perspective
  let ropePerspectiveScale = getPerspectiveScale(rope.y);
  let ropeThickness = 4 * ropePerspectiveScale;
  let loopThickness = 3 * ropePerspectiveScale;

  // Vẽ dây thòng lọng
  stroke(139, 69, 19);
  strokeWeight(ropeThickness);
  line(handPosition.x, handPosition.y - 20, rope.x, rope.y);

  // Vẽ vòng thòng lọng với perspective scaling
  stroke(139, 69, 19);
  strokeWeight(loopThickness);
  noFill();
  let scaledLoopSize = rope.loopSize * ropePerspectiveScale;
  ellipse(rope.x, rope.y, scaledLoopSize, scaledLoopSize);

  pop();
}

function drawHand() {
  push();

  // Add shake animation when pulling
  let shakeX = 0;
  let shakeY = 0;
  if (gameState === "pulling") {
    shakeX = pullAnimation.playerShake;
    shakeY = sin(frameCount * 0.7) * 2;
  }

  translate(handPosition.x + shakeX, handPosition.y + shakeY);

  // Draw hand holding rope
  fill(255, 220, 177); // Skin color
  noStroke();

  // Palm
  ellipse(0, -10, 20, 25);

  // Fingers
  ellipse(-6, -18, 4, 12); // Index finger
  ellipse(-2, -20, 4, 14); // Middle finger
  ellipse(2, -19, 4, 13); // Ring finger
  ellipse(6, -16, 4, 10); // Pinky

  // Thumb
  ellipse(-8, -8, 6, 10);

  // Wrist/arm connection
  fill(255, 220, 177);
  ellipse(0, 5, 18, 15);

  pop();

  // Draw rope when pulling
  if (gameState === "pulling" && caughtCow) {
    drawPullingRope();
  }
}

function drawUI() {
  // Score
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(24);
  textAlign(LEFT);
  text("Điểm: " + score, 20, 40);

  // Hướng dẫn
  if (gameState === "playing") {
    textAlign(CENTER);
    textSize(18);
    text(
      "Nhấn ENTER để thả dây thòng lọng!",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 25
    );
  } else if (gameState === "pulling") {
    textAlign(CENTER);
    textSize(18);

    // Animated pulling text
    let textY = CANVAS_HEIGHT - 25 + sin(frameCount * 0.2) * 2;
    fill(255, 255, 255);
    stroke(0);
    strokeWeight(2);
    text(
      "Nhấn liên tục ENTER để kéo bò " +
        (caughtCow ? caughtCow.sizeType.toUpperCase() : "") +
        "! (" +
        pullCount +
        "/" +
        pullTarget +
        ")",
      CANVAS_WIDTH / 2,
      textY
    );

    // Animated Progress bar
    let barWidth = 200;
    let barHeight = 20;
    let barX = CANVAS_WIDTH / 2 - barWidth / 2;
    let barY = CANVAS_HEIGHT - 20;

    // Background with pulse
    fill(100 + pullAnimation.progressPulse);
    rect(barX, barY, barWidth, barHeight);

    // Progress with color transition
    let progress = pullCount / pullTarget;
    let r = lerp(255, 0, progress);
    let g = lerp(0, 255, progress);
    let b = 0;

    // Add pulsing effect to progress bar
    let pulseIntensity = 1 + sin(frameCount * 0.5) * 0.1;
    fill(r, g, b, 200);
    rect(barX, barY, barWidth * progress * pulseIntensity, barHeight);

    // Border with glow effect when near completion
    noFill();
    if (progress > 0.8) {
      stroke(255, 255, 0, 150 + sin(frameCount * 0.8) * 100);
      strokeWeight(3 + sin(frameCount * 0.6) * 1);
    } else {
      stroke(255);
      strokeWeight(2);
    }
    rect(barX, barY, barWidth, barHeight);
  }

  // Animated Message
  if (message !== "") {
    textAlign(CENTER);
    textSize(32 + sin(frameCount * 0.3) * 3); // Pulsing text size

    // Rainbow effect for success messages
    if (message.includes("Thành công")) {
      let hue = (frameCount * 2) % 360;
      colorMode(HSB);
      fill(hue, 80, 100);
      colorMode(RGB);
    } else {
      fill(255, 255, 0);
    }

    stroke(0);
    strokeWeight(3);

    // Floating text effect
    let messageY = CANVAS_HEIGHT / 2 + sin(frameCount * 0.15) * 5;
    text(message, CANVAS_WIDTH / 2, messageY);
  }
}

function checkCollisions() {
  if (!rope || gameState !== "catching") return;

  for (let cow of cows) {
    if (cow.caught) continue;

    let distance = dist(rope.x, rope.y, cow.x, cow.y);
    let cowPerspectiveScale = getPerspectiveScale(cow.y);
    let ropePerspectiveScale = getPerspectiveScale(rope.y);
    let scaledCowSize = cow.size * cowPerspectiveScale;
    let scaledRopeLoopSize = rope.loopSize * ropePerspectiveScale;
    if (distance < scaledRopeLoopSize / 2 + scaledCowSize / 2) {
      // Bắt được bò!
      cow.caught = true;
      caughtCow = cow;
      gameState = "pulling";
      pullCount = 0;

      // Initialize pull animation
      pullAnimation.cowStartX = cow.x;
      pullAnimation.cowStartY = cow.y;
      pullAnimation.ropeLength = dist(
        handPosition.x,
        handPosition.y - 20,
        cow.x,
        cow.y
      );
      pullAnimation.playerShake = 0;
      pullAnimation.pullIntensity = 0;
      pullAnimation.progressPulse = 0;

      // Set pull target based on cow size
      pullTarget = floor(random(cow.pullMin, cow.pullMax));

      rope = null;

      showMessage(
        "Bắt được bò " + cow.sizeType.toUpperCase() + "! Kéo nhanh!",
        120
      );
      break;
    }
  }
}

function updatePulling() {
  if (gameState !== "pulling" || !caughtCow) return;

  // Update animation values
  pullAnimation.playerShake = sin(frameCount * 0.5) * 3; // Player shake
  pullAnimation.pullIntensity = pullCount / pullTarget; // Pull intensity
  pullAnimation.progressPulse = sin(frameCount * 0.3) * 10; // Progress pulse

  // Animate cow position - pull towards player
  let targetX = handPosition.x + cos(frameCount * 0.1) * 20; // Slight swaying
  let targetY = handPosition.y - 60 + sin(frameCount * 0.2) * 10; // Up and down motion

  if (caughtCow) {
    // Smoothly interpolate cow position
    let lerpAmount = pullAnimation.pullIntensity * 0.3;
    caughtCow.x = lerp(pullAnimation.cowStartX, targetX, lerpAmount);
    caughtCow.y = lerp(pullAnimation.cowStartY, targetY, lerpAmount);
  }

  if (pullCount >= pullTarget) {
    // Quyết định thành công hay thất bại dựa trên size bò
    if (random() < caughtCow.difficulty) {
      // Thành công! Trigger success animation
      score += caughtCow.points;
      gameState = "success";

      // Initialize success animation
      successAnimation.isActive = true;
      successAnimation.startTime = frameCount;
      successAnimation.particles = [];
      successAnimation.pulseEffect = 0;
      successAnimation.cowFloat = 0;
      successAnimation.screenShake = 0;

      // Random celebration message
      let messages = successAnimation.celebration.messages;
      successAnimation.celebration.currentMessage =
        messages[floor(random(messages.length))];
      successAnimation.celebration.messageScale = 1;
      successAnimation.celebration.rainbow = 0;

      // Create celebration particles
      for (let i = 0; i < 20; i++) {
        successAnimation.particles.push({
          x: caughtCow.x + random(-50, 50),
          y: caughtCow.y + random(-30, 30),
          vx: random(-5, 5),
          vy: random(-8, -3),
          life: 60,
          maxLife: 60,
          size: random(3, 8),
          color: color(random(200, 255), random(150, 255), random(100, 255)),
        });
      }

      showMessage("Thành công! +" + caughtCow.points + " điểm", 120);

      // Remove cow
      let index = cows.indexOf(caughtCow);
      if (index > -1) {
        cows.splice(index, 1);
      }

      // Add new cow with random size
      let sizeTypes = Object.keys(COW_SIZES);
      let randomType = sizeTypes[floor(random(sizeTypes.length))];
      let cowData = COW_SIZES[randomType];

      cows.push({
        x: random(CANVAS_WIDTH + 100, CANVAS_WIDTH + 400),
        y: random(PERSPECTIVE_MIN_Y, PERSPECTIVE_MAX_Y),
        size: cowData.size,
        sizeType: randomType,
        speed: -(COW_SPEED + random(-0.5, 0.5)),
        caught: false,
        color: color(random(100, 255), random(100, 200), random(100, 150)),
        difficulty: cowData.difficulty,
        pullMin: cowData.pullMin,
        pullMax: cowData.pullMax,
        points: cowData.points,
      });
    } else {
      // Thất bại! Start escape animation
      gameState = "playing";

      // Initialize escape animation
      escapeAnimation.isEscaping = true;
      escapeAnimation.escapingCow = caughtCow;
      escapeAnimation.escapeStartTime = frameCount;
      escapeAnimation.escapeEndTime = frameCount + 180; // 3 seconds at 60fps

      // Random troll message
      escapeAnimation.currentMessage =
        escapeAnimation.trollMessages[
          floor(random(escapeAnimation.trollMessages.length))
        ];
      escapeAnimation.messageTimer = 120; // 2 seconds

      // Speed boost for escaping cow
      caughtCow.speed *= 2.5; // Much faster escape

      // Create escape particles
      for (let i = 0; i < 10; i++) {
        escapeAnimation.particles.push({
          x: caughtCow.x,
          y: caughtCow.y,
          vx: random(-5, -2),
          vy: random(-3, 3),
          life: 60,
          maxLife: 60,
          size: random(3, 8),
        });
      }

      showMessage(
        "Bò " + caughtCow.sizeType.toUpperCase() + " chạy thoát!",
        120
      );
      caughtCow.caught = false;

      // Reset cow position
      caughtCow.x = pullAnimation.cowStartX;
      caughtCow.y = pullAnimation.cowStartY;
    }

    caughtCow = null;
    pullCount = 0;

    // Reset animation
    pullAnimation.playerShake = 0;
    pullAnimation.pullIntensity = 0;
  }
}

function showMessage(msg, duration) {
  message = msg;
  messageTimer = duration;
}

function drawPullingRope() {
  if (!caughtCow) return;

  push();

  // Calculate perspective-based rope thickness
  let cowPerspectiveScale = getPerspectiveScale(caughtCow.y);
  let baseThickness = 4 * cowPerspectiveScale;
  let tensionThickness = pullAnimation.pullIntensity * 2 * cowPerspectiveScale;

  // Animated rope with tension
  stroke(139, 69, 19);
  strokeWeight(baseThickness + tensionThickness);

  // Calculate rope points with sag and tension
  let startX = handPosition.x;
  let startY = handPosition.y - 20;
  let endX = caughtCow.x;
  let endY = caughtCow.y;

  // Add rope sag and vibration
  let midX = (startX + endX) / 2;
  let midY =
    (startY + endY) / 2 +
    sin(frameCount * 0.6) * 10 * (1 - pullAnimation.pullIntensity);

  // Add tension shake to rope
  let shakeAmount = (1 - pullAnimation.pullIntensity) * 5;
  midX += sin(frameCount * 0.8) * shakeAmount;
  midY += cos(frameCount * 0.9) * shakeAmount;

  // Draw rope as curve
  noFill();
  beginShape();
  vertex(startX, startY);
  quadraticVertex(midX, midY, endX, endY);
  endShape();

  // Draw lasso around cow
  stroke(139, 69, 19);
  strokeWeight(3);
  let loopSize = 50 - pullAnimation.pullIntensity * 20; // Tightening loop
  ellipse(endX, endY, loopSize, loopSize);

  pop();
}

function updateEscapeAnimation() {
  if (!escapeAnimation.isEscaping) return;

  // Update message timer
  if (escapeAnimation.messageTimer > 0) {
    escapeAnimation.messageTimer--;
  }

  // Update particles
  for (let i = escapeAnimation.particles.length - 1; i >= 0; i--) {
    let particle = escapeAnimation.particles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;

    if (particle.life <= 0) {
      escapeAnimation.particles.splice(i, 1);
    }
  }

  // Check if escape animation should end
  if (frameCount >= escapeAnimation.escapeEndTime) {
    escapeAnimation.isEscaping = false;
    escapeAnimation.escapingCow = null;
    escapeAnimation.particles = [];
  }
}

function drawEscapeParticles(cow) {
  for (let particle of escapeAnimation.particles) {
    push();

    let alpha = map(particle.life, 0, particle.maxLife, 0, 255);
    fill(139, 69, 19, alpha); // Brown dust
    noStroke();

    ellipse(particle.x, particle.y, particle.size, particle.size);

    pop();
  }
}

function drawTrollSpeechBubble(cow) {
  push();

  // Speech bubble
  let bubbleX = cow.x + 40;
  let bubbleY = cow.y - cow.size * 0.8;
  let bubbleW = 80;
  let bubbleH = 30;

  // Bubble background
  fill(255, 255, 255, 200);
  stroke(0);
  strokeWeight(2);
  ellipse(bubbleX, bubbleY, bubbleW, bubbleH);

  // Bubble tail
  noStroke();
  fill(255, 255, 255, 200);
  triangle(
    bubbleX - 20,
    bubbleY + 10,
    bubbleX - 30,
    bubbleY + 20,
    bubbleX - 10,
    bubbleY + 15
  );

  // Message text
  fill(0);
  textAlign(CENTER);
  textSize(12);
  text(escapeAnimation.currentMessage, bubbleX, bubbleY + 5);

  pop();
}

// Update success animation
function updateSuccessAnimation() {
  if (!successAnimation.isActive) return;

  let elapsed = frameCount - successAnimation.startTime;
  let progress = elapsed / successAnimation.duration;

  if (elapsed >= successAnimation.duration) {
    // End animation
    successAnimation.isActive = false;
    gameState = "playing";
    return;
  }

  // Update animation effects
  successAnimation.pulseEffect = sin(elapsed * 0.3) * (1 - progress);
  successAnimation.cowFloat = sin(elapsed * 0.2) * 10 * (1 - progress);
  successAnimation.screenShake =
    sin(elapsed * 0.8) * 5 * (1 - progress * progress);

  // Update celebration effects
  successAnimation.celebration.messageScale = 1 + sin(elapsed * 0.2) * 0.2;
  successAnimation.celebration.rainbow = elapsed * 0.1;

  // Update particles
  for (let i = successAnimation.particles.length - 1; i >= 0; i--) {
    let particle = successAnimation.particles[i];

    // Update physics
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.2; // Gravity
    particle.life--;

    // Remove dead particles
    if (particle.life <= 0) {
      successAnimation.particles.splice(i, 1);
    }
  }
}

// Draw success animation effects
function drawSuccessEffects() {
  if (!successAnimation.isActive) return;

  push();

  // Screen shake
  translate(
    random(-successAnimation.screenShake, successAnimation.screenShake),
    random(-successAnimation.screenShake, successAnimation.screenShake)
  );

  // Draw celebration particles
  for (let particle of successAnimation.particles) {
    let alpha = map(particle.life, 0, particle.maxLife, 0, 255);

    push();
    translate(particle.x, particle.y);

    // Particle color with fade
    fill(
      red(particle.color),
      green(particle.color),
      blue(particle.color),
      alpha
    );
    noStroke();

    // Sparkling effect
    rotate(frameCount * 0.1);
    for (let i = 0; i < 6; i++) {
      rotate(PI / 3);
      ellipse(0, 0, particle.size, particle.size * 0.5);
    }

    pop();
  }

  // Draw celebration message
  if (successAnimation.celebration.currentMessage) {
    push();

    // Rainbow text effect
    let r = sin(successAnimation.celebration.rainbow) * 127 + 128;
    let g = sin(successAnimation.celebration.rainbow + PI / 3) * 127 + 128;
    let b =
      sin(successAnimation.celebration.rainbow + (2 * PI) / 3) * 127 + 128;

    textAlign(CENTER, CENTER);
    textSize(48 * successAnimation.celebration.messageScale);

    // Text shadow
    fill(0, 100);
    text(
      successAnimation.celebration.currentMessage,
      CANVAS_WIDTH / 2 + 3,
      CANVAS_HEIGHT / 2 - 100 + 3 + successAnimation.cowFloat
    );

    // Main text
    fill(r, g, b);
    text(
      successAnimation.celebration.currentMessage,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 - 100 + successAnimation.cowFloat
    );

    pop();
  }

  // Pulse overlay effect
  if (successAnimation.pulseEffect > 0) {
    push();
    fill(255, 255, 255, successAnimation.pulseEffect * 50);
    rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    pop();
  }

  pop();
}

function keyPressed() {
  if (key === "Enter" || keyCode === ENTER) {
    if (gameState === "playing") {
      // Thả dây thòng lọng
      rope = {
        x: handPosition.x,
        y: handPosition.y - 20,
        loopSize: 50,
      };
      gameState = "catching";
    } else if (gameState === "pulling") {
      // Kéo bò with screen shake effect
      pullCount++;

      // Add screen shake when pulling hard
      if (pullCount > pullTarget * 0.7) {
        // Intense pulling near the end
        pullAnimation.playerShake = random(-5, 5);
      }
    } else if (gameState === "success") {
      // Skip success animation
      successAnimation.isActive = false;
      gameState = "playing";
    }
  }
}
