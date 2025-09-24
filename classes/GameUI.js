// Game UI and result display functions

function drawGameResult() {
  push();

  noStroke();

  // Main result box
  let boxWidth = 400;
  let boxHeight = 250;
  let boxX = width / 2 - boxWidth / 2;
  let boxY = height / 2 - boxHeight / 2;

  // Background box with border
  stroke(255);
  strokeWeight(4);
  if (gameResult.outcome === "success") {
    fill(0, 100, 0, 150); // Dark green for success
  } else {
    fill(100, 0, 0, 150); // Dark red for failure
  }
  rect(boxX + boxWidth / 2, boxY + boxHeight / 2, boxWidth, boxHeight, 20);

  // Main message
  fill(255);
  noStroke();
  textSize(32);
  textStyle(BOLD);
  text(gameResult.message, width / 2, boxY + 60);

  // Detail message
  textSize(16);
  textStyle(NORMAL);
  let lines = gameResult.detailMessage.split("\n");
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width / 2, boxY + 120 + i * 25);
  }

  // Restart instruction
  textSize(18);
  textStyle(BOLD);
  if (gameResult.outcome === "success") {
    fill(150, 255, 150);
  } else {
    fill(255, 150, 150);
  }
  const showEnter = millis() - lastGameResultTime > 3000;
  text(
    "Bấm SPACE" + (showEnter ? " / ENTER" : "") + " để chơi lại!",
    width / 2,
    boxY + boxHeight - 40
  );
  if (gameResult.outcome === "success") {
    fill(255, 200, 0, 200);
    text("Bấm S để lưu kết quả!", width / 2, boxY + boxHeight - 20);
  }

  // drawSaveResult();

  pop();
}

function drawSaveResult() {
  const allUserName = new Set(winHistory.map((item) => item.name));
  if (allUserName.size === 0) return;

  // calculate score for each user, based on level
  const scoreMap = new Map();
  for (let item of winHistory) {
    if (!scoreMap.has(item.name)) {
      scoreMap.set(item.name, 0);
    }
    scoreMap.set(item.name, scoreMap.get(item.name) + item.level);
  }

  // sort by score
  const scoreList = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map((item) => ({
      name: item[0],
      score: item[1],
    }));
  const best5Result = scoreList.slice(0, 5);

  const p = document.getElementById("history");
  p.innerHTML = "🌟 Bảng vàng 🌟" + "<br>";
  for (let i = 0; i < best5Result.length; i++) {
    p.innerHTML +=
      best5Result[i].name + " - " + best5Result[i].score + " điểm" + "<br>";
  }

  // draw list win history at bottom right corner
  // push();
  // fill(255, 255, 255, 200);
  // noStroke();
  // textAlign(RIGHT, BOTTOM);
  // textSize(16);

  // // draw list win history
  // let y = height - 20;
  // for (let i = 0; i < best5Result.length; i++) {
  //   text(
  //     best5Result[i].name + " - " + best5Result[i].score + " điểm",
  //     width - 20,
  //     y
  //   );
  //   y -= 20;
  // }

  // text("Kết quả", width - 20, y);

  // pop();
}

function drawEnterButtonAnimation() {
  // Only show animation when a cow is caught and we need the user to press ENTER rapidly
  if (gameState !== "pulling" || !rope || !rope.attachedCow) return;

  push();

  // Position beside power bar (to the right)
  let animX = powerBar.x + powerBar.width + 60;
  let animY = powerBar.y + powerBar.height - 60;

  // More intense animation to show rapid pressing is needed
  let pulseTime = frameCount * 0.1; // Faster pulse
  let bounceOffset = sin(pulseTime) * 12; // More bounce
  let alphaValue = map(sin(pulseTime * 3), -1, 1, 180, 255); // Faster flashing

  textStyle(BOLD);

  // Draw "ENTER" text with pulsing effect
  fill(255, 255, 0, alphaValue);
  textSize(16);
  text("ENTER", animX, animY - 55 + bounceOffset);

  // Draw multiple animated arrows for rapid effect
  stroke(255, 255, 0, alphaValue);
  strokeWeight(2);
  fill(255, 255, 0, alphaValue);

  // Multiple arrows with different phases
  for (let i = 0; i < 2; i++) {
    let arrowOffset = sin(pulseTime + i * 0.5) * 6;
    let arrowY = animY - 35 + i * 8 + arrowOffset;

    // Arrow shaft
    line(animX, arrowY, animX, arrowY + 15);

    // Arrow head
    triangle(
      animX - 4,
      arrowY + 10,
      animX + 4,
      arrowY + 10,
      animX,
      arrowY + 15
    );
  }

  // Draw red circle button with more intense pulsing
  let buttonSize = 60 + sin(pulseTime * 2) * 8;

  // // Red circle with glow effect
  // noStroke();
  // fill(255, 0, 0, 120);
  // ellipse(animX, animY + 25, buttonSize + 15, buttonSize + 15); // Outer glow

  // fill(255, 0, 0, alphaValue);
  // ellipse(animX, animY + 25, buttonSize, buttonSize); // Main button

  // // Inner highlight
  // fill(255, 150, 150, alphaValue * 0.9);
  // ellipse(animX - 4, animY + 21, buttonSize * 0.5, buttonSize * 0.5);

  translate(animX - buttonSize / 2, animY + 25 - buttonSize / 2);
  rotate(sin(pulseTime * 2) * 0.1);
  image(enterImg, 0, 0, buttonSize, buttonSize);

  pop();
}

function drawInstructions() {
  // Don't show instructions when game is over (success/failed states)
  if (gameState === "success" || gameState === "failed") {
    return;
  }

  push();
  fill(255, 255, 255, 200);
  noStroke();

  if (gameState === "running") {
    textSize(16);
    text("Bấm ENTER để ném sợi dây và bắt Moni!", width / 2, 30);
  } else if (gameState === "pulling") {
    if (rope.attachedCow) {
      let cowLevel = rope.attachedCow.level;
      textSize(40);
      fill("yellow");
      text("Level " + cowLevel, width / 2, 30);
    }
  }

  pop();
}

function restartGame() {
  // Reset game state
  gameState = "running";
  gameResult.outcome = "";
  gameResult.message = "";
  gameResult.detailMessage = "";

  // Reset rope
  rope.reset();

  // Reset power bar
  powerBar.currentPower = 50;
  powerBar.currentDecreaseRate = powerBar.baseDecreaseRate;
  powerBar.stopTimer();

  // Reset all cows to running state
  cows.forEach((cow) => {
    cow.talkDuration = 0; // reset talk
    if (cow.state !== "running") {
      cow.resetPosition();
    }
  });

  // Clear smoke effects
  smokes.length = 0;

  // Note: Particle system will stop automatically when game state changes
}
