let gameState = "running"; // running, pulling, success, failed
let gameResult = {
  outcome: "",
  message: "",
  detailMessage: "",
};

let backgroundImg;
let handImg;
let handPullImg;
let enterImg;

const cowCount = 3;
const cows = [];
const cowImgs = [];
const cowPullImgs = [];
let lastWinCowLevel = null;

// based on cow level
const winPercentage = [0.9, 0.7, 0.6];
const winLimit = [70, 20, 10];
const decreaseSpeed = [0.1, 0.2, 0.3];
const winHistory = [
  // {
  //   name: 'user',
  //   level: 1,
  // }
];

function reachLimit(level) {
  const count = winHistory.filter((_) => _.level == level && _.win).length;
  return count >= winLimit[level - 1];
}
function loadHistory() {
  const data = localStorage.getItem("gameKeyBo");
  try {
    if (data) {
      const history = JSON.parse(data);
      winHistory.push(...history);
      console.log(winHistory);
    } else {
      console.log("No history found");
    }
  } catch (error) {
    console.error(error);
  }
}
function saveHistory() {
  localStorage.setItem("gameKeyBo", JSON.stringify(winHistory));
}

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
    "🐌 Chậm như rùa!",
    "💨 Bò còn nhanh hơn bạn",
    "🪦 Thua rồi kìa lêu lêu",
    "😹 Ez game, noob",
    "🧊 Đơ luôn kìa",
    "🥴 Gà quá",
    "🙃 Better luck next life",
    "🎣 Bị kéo ngược rồi",
    "🍌 Banana skill?",
    "💤 Ngủ quên à?",
    "🤣 Ôi trời ơi",
    "🐂 Bò còn cười bạn",
    "📉 Skill tụt dốc",
    "🥱 Chán ghê",
    "🤖 Bot mode on?",
    "👶 Baby level",
    "📴 Disconnect não?",
    "🪫 Hết pin à?",
  ],
  winner: [
    "🔥 Ez win!",
    "👑 King of cow pulling",
    "💪 Sức mạnh vô địch",
    "🤣 Quá nhanh quá nguy hiểm",
    "🚀 Tốc độ bàn thờ",
    "🍗 Ăn gọn gàng",
    "🐂 Bò cũng phải nể",
    "⚡ Boom! Done",
    "🥇 Top 1 server",
    "🎯 Chuẩn không cần chỉnh",
    "🥶 Đỉnh của chóp",
    "🕺 Easy dance",
    "🎮 Pro player mode",
    "💯 Không trượt phát nào",
    "🧨 Kéo phát nổ tung",
    "🍀 Nhân phẩm max rank",
    "😎 Trùm cuối thật sự",
    "🏆 Cúp về tay ta",
    "📈 Kéo lên đỉnh",
  ],
  being_pulled: [
    "🫣 Ơ kìa, từ từ đã!",
    "😵 Kéo nhẹ thôi chứ!",
    "😂 Bò ơi cứu tao!",
    "🤔 Hình như dây này fake?",
    "🙃 Thôi xong...",
    "🦴 Kéo gãy xương rồi 😭",
    "🤡 Sao dây bên tui yếu vậy?",
    "🪢 Trượt tay tí thôi mà...",
    "🍌 Ai vứt vỏ chuối ở đây thế?",
    "😹 Đừng kéo tóc tui chứ!",
    "💨 Bayyy luôn rồi",
    "🥴 Tạm biệt các bạn",
    "📉 Skill tụt dốc không phanh",
    "🥹 Tha cho tui phát này đi",
    "🤣 Ôi trời, mất grip rồi",
    "😵‍💫 Chóng mặt quá",
    "💤 Kéo kiểu này thì ngủ luôn",
    "🤲 Cho tui cơ hội làm lại",
  ],
};

function preload() {
  backgroundImg = loadImage(`assets/bg.png`);
  handImg = loadImage(`assets/hand.png`);
  handPullImg = loadImage(`assets/hand_pull.png`);
  enterImg = loadImage(`assets/enter.png`);

  for (let i = 1; i < cowCount + 1; i++) {
    cowImgs.push(loadImage(`assets/cow${i}.png`));
    cowPullImgs.push(loadImage(`assets/cow${i}_pull.png`));
  }
}

function getRandomY() {
  return random(height / 2 - 60, height / 2 + 50);
}

function setup() {
  loadHistory();

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

  drawSaveResult();
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
      rope.throw(handCenterX, ropeStartY, handCenterX, height / 2 - 40);
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

  if (key === "s" && gameState === "success") {
    // get user name
    Swal.fire({
      title: "Nhập tên của bạn",
      input: "text",
      confirmButtonText: "OK",
    }).then((result) => {
      if (result.isConfirmed) {
        winHistory.push({
          name: result.value,
          level: lastWinCowLevel,
        });
        saveHistory();
      }
    });
  }

  if (key === " " || keyCode === 32) {
    // SPACE key
    if (gameState === "success" || gameState === "failed") {
      restartGame();
    }
  }
}
