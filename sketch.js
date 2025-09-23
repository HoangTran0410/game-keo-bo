let gameState = "running"; // running, pulling, success, failed
let gameResult = {
  outcome: "", // "success" or "failed"
  message: "",
  detailMessage: "",
};

let backgroundImg;
let handImg;
let handPullImg;

const cowCount = 3;
const cows = [];
const cowImgs = [];
const cowPullImgs = [];

let hand;
let rope;
let powerBar;
let particleSystem;

const smokes = [];

const TEXT_MESSAGES = {
  random(obj) {
    return obj[floor(random(obj.length))];
  },
  loser: [
    "Bye🤫🧏🏻‍♂️Bye🗿",
    "🫵🏼🤣 Hahaha. Losser",
    "🤡 oh no. Losser",
    "😂🤣🤪😁",
    "🤘🤏 No no",
  ],
};

function preload() {
  backgroundImg = loadImage(`assets/bg.png`);
  handImg = loadImage(`assets/hand.png`);
  handPullImg = loadImage(`assets/hand_pull.png`);

  for (let i = 1; i < cowCount + 1; i++) {
    cowImgs.push(loadImage(`assets/cow${i}.png`));
    cowPullImgs.push(loadImage(`assets/cow${i}_pull.png`));
  }
}

function getRandomY() {
  return random(height / 2 - 60, height / 2 + 50);
}

function setup() {
  createCanvas(800, 600);

  rope = new Rope();
  powerBar = new PowerBar();
  powerBar.y = height - 250; // Set position after canvas is created
  particleSystem = new ParticleSystem();

  hand = {
    w: 120,
    h: 120,
    y: height - 100,
    x: width / 2 - 75,
  };

  let currentCowId = 0;
  for (let i = 0; i < 7; i++) {
    cows.push(
      new Cow({
        img: cowImgs[currentCowId],
        pullImg: cowPullImgs[currentCowId],
        x: 50 + i * 150,
        y: getRandomY(),
        speed: random(1, 3),
        level: random([1, 2, 3]),
      })
    );
    currentCowId++;
    if (currentCowId >= cowCount) {
      currentCowId = 0;
    }
  }
}

function draw() {
  background(backgroundImg);

  // sort cows by y
  cows.sort((a, b) => a.y - b.y);

  for (let i = smokes.length - 1; i >= 0; i--) {
    smokes[i].update();
    smokes[i].show();

    if (smokes[i].isFinished()) {
      smokes.splice(i, 1);
    }
  }

  cows.forEach((cow) => cow.update());
  cows.forEach((cow) => cow.draw());

  // Update and draw rope
  rope.update();
  rope.draw();

  // Update and draw power bar
  powerBar.update();
  powerBar.draw();

  // Draw enter button animation beside power bar
  drawEnterButtonAnimation();

  // draw hand at bottom
  drawHand();

  // Draw instructions
  drawInstructions();

  // Draw game result if game is over
  if (gameState === "success" || gameState === "failed") {
    drawGameResult();

    // Only update and draw particle system during game result state
    particleSystem.update();
    particleSystem.draw();
  }
}

function drawHand() {
  if (gameState === "pulling") {
    push();
    translate(hand.x + hand.w / 2, hand.y + hand.h + 10);
    rotate(sin(frameCount * 0.2) * 0.1);

    image(handPullImg, -hand.w / 2, -hand.h, hand.w, hand.h);

    pop();
  } else {
    push();
    translate(hand.x + hand.w / 2, hand.y + hand.h);
    // wiggle effect
    rotate(sin(frameCount * 0.1) * 0.1);

    image(handImg, -hand.w / 2, -hand.h, hand.w, hand.h);

    pop();
  }
}

function keyPressed() {
  if (key === "Enter" || keyCode === ENTER) {
    if (gameState === "running" && !rope.isActive) {
      // Throw rope vertically to center of screen from very bottom
      let handCenterX = hand.x + hand.w / 2;
      let ropeStartY = height - 10; // Very bottom of screen
      rope.throw(handCenterX, ropeStartY, handCenterX, height / 2);
      gameState = "pulling";
      // Don't start power management until cow is caught
    } else if (gameState === "pulling" && rope.attachedCow) {
      // Each Enter press increases power (no holding)
      powerBar.increasePower();

      // Start timer and pulling animation on first power increase
      if (!powerBar.timerActive) {
        powerBar.startTimer(rope.attachedCow.level);
        rope.startPulling();
      }
    }
  }

  if (key === " " || keyCode === 32) {
    // SPACE key
    if (gameState === "success" || gameState === "failed") {
      restartGame();
    }
  }
}
