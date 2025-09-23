let gameState = "running"; // running, pulling, success, failed

let backgroundImg;

const cowCount = 3;
const cows = [];
const cowImgs = [];
const cowPullImgs = [];

let handImg;
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

  hand = new Hand({
    img: handImg,
    w: 120,
    h: 120,
    y: height - 100,
    x: width / 2 - 75,
  });

  rope = new Rope();
  powerBar = new PowerBar();
  powerBar.y = height - 250; // Set position after canvas is created

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

  hand.draw();

  // Update and draw rope
  rope.update();
  rope.draw();

  // Update and draw power bar
  powerBar.update();
  powerBar.draw();

  // Draw instructions
  drawInstructions();
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
