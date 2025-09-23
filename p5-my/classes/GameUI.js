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
  rect(boxX, boxY, boxWidth, boxHeight, 20);

  // Main message
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
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
  text("Bấm SPACE để chơi lại!", width / 2, boxY + boxHeight - 40);

  pop();
}

function drawEnterButtonAnimation() {
  // Only show animation when a cow is caught and we need the user to press ENTER rapidly
  if (gameState !== "pulling" || !rope || !rope.attachedCow) return;

  push();

  // Position beside power bar (to the right)
  let animX = powerBar.x + powerBar.width + 40;
  let animY = powerBar.y + powerBar.height - 40;

  // More intense animation to show rapid pressing is needed
  let pulseTime = frameCount * 0.3; // Faster pulse
  let bounceOffset = sin(pulseTime) * 12; // More bounce
  let alphaValue = map(sin(pulseTime * 3), -1, 1, 180, 255); // Faster flashing

  textAlign(CENTER, CENTER);
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
  for (let i = 0; i < 3; i++) {
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
  let buttonSize = 30 + sin(pulseTime * 2) * 8;

  // Red circle with glow effect
  noStroke();
  fill(255, 0, 0, 120);
  ellipse(animX, animY + 25, buttonSize + 15, buttonSize + 15); // Outer glow

  fill(255, 0, 0, alphaValue);
  ellipse(animX, animY + 25, buttonSize, buttonSize); // Main button

  // Inner highlight
  fill(255, 150, 150, alphaValue * 0.9);
  ellipse(animX - 4, animY + 21, buttonSize * 0.5, buttonSize * 0.5);

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
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Bấm ENTER để ném sợi dây và bắt bò!", width / 2, 30);
  } else if (gameState === "pulling") {
    textAlign(CENTER, CENTER);
    textSize(14);
    if (rope.attachedCow) {
      if (powerBar.timerActive) {
        let cowLevel = rope.attachedCow.level;
        let requiredSpeed = (1.5 + cowLevel * 0.5).toFixed(1); // 2, 2.5, 3 clicks/sec
        text(
          "Level " +
            cowLevel +
            " - Cần " +
            requiredSpeed +
            " lần/giây! Còn " +
            (powerBar.remainingTime / 1000).toFixed(1) +
            "s",
          width / 2,
          30
        );
      } else {
        text("Bấm ENTER để bắt đầu kéo bò!", width / 2, 30);
      }
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
    if (cow.state !== "running") {
      cow.resetPosition();
    }
  });

  // Clear smoke effects
  smokes.length = 0;

  // Stop particle system
  particleSystem.stop();
}
