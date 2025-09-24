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
let bgMusic;
let lastGameResultTime = 0;

const cowCount = 5;
const cows = [];
const cowImgs = [];
const cowPullImgs = [];
let lastWinCowLevel = null;

// based on cow level
let cow3LoseCount = 0;
const autoWinCow3AfterLoseCount = 4;
const winPercentage = [0.9, 0.7, 0.6];
const winLimit = [70, 20, 10];
const pullTime = [3, 5, 7];
const decreaseSpeed = [0.25, 0.3, 0.36];
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

  drawSaveResult();
}
function saveHistory() {
  localStorage.setItem("gameKeyBo", JSON.stringify(winHistory));
  drawSaveResult();
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
    "💨 Moni nhanh hơn bạn",
    "🪦 Thua rồi kìa lêu lêu",
    "😹 Ez game, noob",
    "🧊 Đơ luôn kìa",
    "🥴 Gà quá",
    "🙃 Better luck next life",
    "🎣 Bị kéo ngược rồi",
    "🍌 Banana skill?",
    "💤 Ngủ quên à?",
    "🤣 Ôi trời ơi",
    "🐂 Hú hú khẹc khẹc",
    "📉 Skill tụt dốc",
    "🥱 Chán dị",
    "🤖 Bot mode on?",
    "👶 Baby level",
    "📴 Ối giời ơi",
    "🪫 Hết pin à?",
  ],
  winner: [
    "🔥 Ez win!",
    "👑 King of cow pulling",
    "💪 Sức mạnh vô địch",
    "🤣 Quá nhanh quá nguy hiểm",
    "🚀 Tốc độ bàn thờ",
    "🍗 Ăn gọn gàng",
    "🐂 Moni cũng phải nể",
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
    "😂 Ae ơi cứu tui!",
    "🤔 Hình như dây này fake?",
    "🙃 Thôi xong...",
    "🦴 Kéo gãy xương rồi 😭",
    "🤡 Sao dây bên tui yếu vậy?",
    "🪢 Trượt tay tí thôi mà...",
    "🍌 Ai vứt vỏ chuối ở đây thế?",
    "😹 Đừng kéo tóc tui chứ!",
    "💨 Bayyy luôn rồi",
    "🥴 Tạm biệt các bạn",
    "🥹 Tha cho tui phát này đi",
    "🤣 Ôi trời, mất lực bám rồi",
    "🤮 Gồng hết nổi huhu",
    "😵‍💫 Chóng mặt quá",
    "💤 Kéo kiểu này chớt tui",
    "🤲 Cho tui cơ hội làm lại",
  ],
  throw_failed: [
    "🙃 Quăng cái gì vậy trời?",
    "🤡 Ném mà trượt luôn!",
    "🤣 Hụt rồi bạn ơi!",
    "🥴 Tay run hả?",
    "🫠 Ném còn sai thì thôi",
    "🤲 Ném như chưa ném",
    "😵 Lệch hẳn một mét!",
    "😏 Xem lại tầm mắt đi bạn",
    "📦 Ship sai địa chỉ rồi",
    "🎯 Mục tiêu còn ở xa lắm!",
    "🕳️ Ném thẳng xuống hố à?",
    "🔥 Cú ném tệ nhất năm",
  ],
  waiting_throw: [
    "🙄 Còn chờ gì nữa?",
    "😏 Run tay à?",
    "😂 Đứng ngắm thôi hả?",
    "🥱 Ném nhanh mình còn đi",
    "📉 Delay ném như delay task",
    "🫢 Moni sắp chạy mất kìa",
    "🤣 Cứ đứng vậy thì auto thua",
    "😹 Đang tính toán gì thế?",
    "🔥 Khịa nhiều hơn ném",
    "🤔 Đợi thần linh nhập à?",
    "😵 Xong, não lag rồi",
    "🙃 AFK thì nói 1 tiếng",
    "🪀 Đứng đó chơi thôi hả?",
    "🕰️ Đồng hồ kêu kìa!",
    "🚶‍♂️ Chờ tới mùa quýt?",
    "🎯 Mục tiêu còn đang đợi kìa",
    "😴 Ném trong mơ hả?",
    "😏 Để tui ném cho nhanh",
    "💀 Đứng thêm tí nữa thành tượng đá",
  ],
  cow_cheer: [
    "🐂 Ráng lên, đừng thua!",
    "📢 Cứu, nó kéo bạn tui!",
    "😱 Ôi không, giữ chặt!",
    "💪 Gồng nữa đi!",
    "😭 Đừng bỏ cuộc!",
    "🤲 Ai đó cứu với!",
    "🙀 Moni nhà mình sắp toang!",
    "🔥 Đứng dậy, phản công!",
    "🐮 Tin ở bạn!",
    "🫨 Kéo lại lẹ lên!",
    "📣 Moni ơi cố tí nữa!",
    "🤣 Đừng để mất mặt đàn moni!",
    "😵 Ê, sắp bay rồi kìa!",
    "👀 Tất cả đang nhìn bạn đó!",
    "😤 Thua thì đừng về phòng!",
    "🍀 Niềm tin cuối cùng!",
    "🥵 Mồ hôi rơi như mưa!",
    "📢 Trọng tài, cứu nó đi!",
    "🙄 Gồng kiểu gì kỳ vậy?",
    "😂 Nhìn mà hồi hộp quá!",
    "😹 Cố lên bạn ơi!",
    "🐴 Ngựa còn kéo giỏi hơn!",
    "🪢 Đừng để tuột dây!",
    "👋 Sắp mất dấu rồi kìa!",
    "🚨 Báo động đỏ, kéo mạnh lên!",
    "😬 Không ổn rồi!",
    "🥶 Lạnh sống lưng quá!",
    "🥳 Lật kèo đi chứ!",
    "💀 Gãy giò thì khổ!",
  ],
};

function preload() {
  backgroundImg = loadImage(`assets/bg.png`);
  handImg = loadImage(`assets/hand.png`);
  handPullImg = loadImage(`assets/hand_pull.png`);
  enterImg = loadImage(`assets/enter.png`);
  bgMusic = loadSound(`assets/AdhesiveWombat - 8 Bit Adventure (1).mp3`);

  for (let i = 1; i <= cowCount; i++) {
    cowImgs.push(loadImage(`assets/cow${i}.png`));
    cowPullImgs.push(loadImage(`assets/cow${i}_pull.png`));
  }
}

function getRandomY(level = 1) {
  const range = [
    [height / 2 - 60, height / 2 + 50],
    [height / 2 - 60, height / 2 + 20],
    [height / 2 - 60, height / 2 - 60],
  ][level - 1];
  return random(range[0], range[1]);
}

function setup() {
  loadHistory();

  const maxHeight = windowHeight - 50;
  let canvas = createCanvas(maxHeight * (4 / 3), maxHeight);
  canvas.parent("#game-container");

  rectMode(CENTER);
  textAlign(CENTER, CENTER);

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
    const level = random([1, 2, 3]);
    cows.push(
      new Cow({
        imgs: cowImgs,
        pullImgs: cowPullImgs,
        x: 50 + i * 150,
        y: getRandomY(level),
        level: level,
        speed: random(1, 3),
      })
    );
    currentCowId++;
    if (currentCowId >= cowCount) {
      currentCowId = 0;
    }
  }

  bgMusic.loop();
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

  // Update and draw rope
  rope.update();
  rope.draw();

  cows.forEach((cow) => cow.update());
  cows.forEach((cow) => cow.draw());

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

  // drawSaveResult();
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
    } else if (
      (gameState === "success" || gameState === "failed") &&
      millis() - lastGameResultTime > 3000
    ) {
      restartGame();
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
