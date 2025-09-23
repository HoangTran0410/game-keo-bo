// Game UI and result display functions

function checkGameConditions() {
  if (!rope || !rope.attachedCow) return;

  let cow = rope.attachedCow;
  let cowCenterX = cow.x + cow.size / 2;
  let cowCenterY = cow.y + cow.size / 2;

  // Calculate distance from cow to hand position (success threshold)
  let distanceToHand = dist(
    cowCenterX,
    cowCenterY,
    hand.x + hand.w / 2,
    hand.y + hand.h / 2
  );

  // Success condition: cow pulled close enough to hand (within 100 pixels)
  if (distanceToHand < 100) {
    gameState = "success";
    gameResult.outcome = "success";
    gameResult.message = "🎉 THÀNH CÔNG! 🎉";
    gameResult.detailMessage = `Bạn đã kéo được bò Level ${cow.level}!\nTuyệt vời, cowboy! 🤠`;
    cow.talk("You got me! Well done! 😊", 5000);
    rope.reset();
    powerBar.stopIncreasing();

    // Start success particle effect
    particleSystem.start("success");
    return;
  }

  // Failure condition: power reached zero (already handled in PowerBar.onCowEscape)
  // But we need to set game state to failed instead of returning to running
  if (powerBar.currentPower <= 0) {
    gameState = "failed";
    gameResult.outcome = "failed";
    gameResult.message = "💔 THẤT BẠI! 💔";
    gameResult.detailMessage = `Bò Level ${cow.level} quá mạnh!\nLực kéo của bạn đã hết 💪`;
    cow.talk("Lêu lêu, sao bắt được tui 💪🐄", 5000);
    cow.escape();
    rope.reset();
    powerBar.stopIncreasing();

    // Start failure particle effect
    particleSystem.start("failed");
    return;
  }
}

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
    text("Press ENTER to throw rope and catch a cow!", width / 2, 30);
  } else if (gameState === "pulling") {
    textAlign(CENTER, CENTER);
    textSize(14);
    if (rope.attachedCow) {
      text(
        "Hold ENTER to pull! Release to let cow resist. Pull the cow close to win!",
        width / 2,
        30
      );
    } else {
      text("Rope thrown! Try to catch a cow!", width / 2, 30);
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
  powerBar.isIncreasing = false;

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
