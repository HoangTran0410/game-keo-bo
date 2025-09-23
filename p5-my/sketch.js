let gameState = "running"; // running, pulling, success, failed

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

function drawEnterButtonAnimation() {
  // Only show animation when a cow is caught and we need the user to press ENTER rapidly
  if (gameState !== "pulling" || !rope || !rope.attachedCow) return;

  push();

  // Position beside power bar (to the right)
  let animX = powerBar.x + powerBar.width + 40;
  let animY = powerBar.y + powerBar.height - 40;

  // Animation timing
  let pulseTime = frameCount * 0.15;
  let bounceOffset = sin(pulseTime) * 8;
  let alphaValue = map(sin(pulseTime * 2), -1, 1, 150, 255);

  // Draw "ENTER" text with pulsing effect
  fill(255, 255, 0, alphaValue);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  textStyle(BOLD);
  text("ENTER", animX, animY - 60 + bounceOffset);

  // Draw animated arrow pointing down
  stroke(255, 255, 0, alphaValue);
  strokeWeight(3);
  fill(255, 255, 0, alphaValue);

  // Arrow shaft
  line(animX, animY - 40 + bounceOffset, animX, animY - 10 + bounceOffset);

  // Arrow head (triangle pointing down)
  triangle(
    animX - 6,
    animY - 15 + bounceOffset,
    animX + 6,
    animY - 15 + bounceOffset,
    animX,
    animY - 5 + bounceOffset
  );

  // Draw red circle button with pulsing effect
  let buttonSize = 25 + sin(pulseTime * 1.5) * 5;

  // Red circle with glow effect
  noStroke();
  fill(255, 0, 0, 100);
  ellipse(animX, animY + 15, buttonSize + 10, buttonSize + 10); // Outer glow

  fill(255, 0, 0, alphaValue);
  ellipse(animX, animY + 15, buttonSize, buttonSize); // Main button

  // Inner highlight
  fill(255, 100, 100, alphaValue * 0.8);
  ellipse(animX - 3, animY + 12, buttonSize * 0.4, buttonSize * 0.4);

  // "FAST!" text with urgency effect
  //   fill(255, 50, 50, alphaValue);
  //   textAlign(CENTER, CENTER);
  //   textSize(10);
  //   textStyle(BOLD);
  //   text("FAST!", animX, animY + 45 + bounceOffset * 0.5);

  pop();
}

function drawInstructions() {
  push();
  fill(255, 255, 255, 200);
  noStroke();

  if (gameState === "running") {
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Press ENTER to throw rope and catch a cow!", width / 2, 30);
  } else if (gameState === "pulling") {
    textAlign(CENTER, CENTER);
    textSize(14);
    if (rope.attachedCow) {
      text(
        "Hold ENTER to pull! Release to let cow resist. Don't let power reach zero!",
        width / 2,
        30
      );
    } else {
      text("Rope thrown! Try to catch a cow!", width / 2, 30);
    }
  }

  pop();
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
      // Start pulling cow - now power management begins
      rope.startPulling();
      powerBar.startIncreasing();
    }
  }
}

function keyReleased() {
  if (key === "Enter" || keyCode === ENTER) {
    if (gameState === "pulling" && rope.attachedCow) {
      rope.stopPulling();
      powerBar.stopIncreasing();
    }
  }
}
