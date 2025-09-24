class PowerBar {
  constructor() {
    this.x = 50;
    this.y = 0; // Will be set in setup
    this.width = 30;
    this.height = 200;
    this.maxPower = 100;
    this.currentPower = 50; // Start at center
    this.increasePerClick = 2; // Amount increased per Enter press (reduced for better balance)
    this.currentDecreaseRate = 0.5; // Current decrease rate based on cow level

    // Timer system
    this.maxTime = 0; // Will be set based on cow level (level * 3 seconds)
    this.remainingTime = 0;
    this.timerActive = false;
  }

  update() {
    // Only update power when a cow is actually caught
    if (gameState === "pulling" && rope && rope.attachedCow) {
      // Continuously decrease power based on cow level

      // Update timer if active
      if (this.timerActive) {
        this.currentPower = max(
          0,
          this.currentPower - this.currentDecreaseRate
        );
        this.remainingTime -= 1000 / frameRate(); // Decrease by milliseconds

        // Check win condition: time reached 0 and power > 0
        if (this.remainingTime <= 0 && this.currentPower > 0) {
          const rand = random();
          const level = rope.attachedCow.level;
          const id = level - 1;
          const percent = winPercentage[id];

          console.log(rand, percent, level, rope.attachedCow);

          console.log(
            level,
            "cow3LoseCount",
            cow3LoseCount,
            "autoWinCow3AfterLoseCount",
            autoWinCow3AfterLoseCount
          );
          if (
            (level === 3 && cow3LoseCount >= autoWinCow3AfterLoseCount) ||
            (rand < percent && !reachLimit(level))
          ) {
            if (level === 3) cow3LoseCount = 0; // reset lose count
            this.onWin();
          } else {
            if (level === 3) cow3LoseCount++;
            this.onLose();
          }
          lastGameResultTime = millis();
          return;
        }

        // Check lose condition: power reached 0 before time runs out
        if (this.currentPower <= 5) {
          this.onLose();
          lastGameResultTime = millis();
          return;
        }
      }
    }
  }

  increasePower() {
    // Called when Enter is pressed - single increase
    if (gameState === "pulling" && rope && rope.attachedCow) {
      this.currentPower = min(
        this.maxPower,
        this.currentPower + this.increasePerClick
      );
    }
  }

  startTimer(cowLevel) {
    this.maxTime = pullTime[cowLevel - 1] * 1000;
    this.remainingTime = this.maxTime;
    this.timerActive = true;

    this.currentDecreaseRate = decreaseSpeed[cowLevel - 1];
  }

  stopTimer() {
    this.timerActive = false;
    this.remainingTime = 0;
    // Also stop rope pulling animation
    if (rope) {
      rope.stopPulling();
    }
  }

  onWin() {
    // Player successfully held the cow for required time
    if (rope && rope.attachedCow) {
      let cow = rope.attachedCow;
      lastWinCowLevel = cow.level;
      gameState = "success";
      gameResult.outcome = "success";
      gameResult.message = "🎉 THÀNH CÔNG! 🎉";
      gameResult.detailMessage = `Bạn đã bắt được Moni Level ${
        cow.level
      }!\n${random(TEXT_MESSAGES.winner)}`;
      cow.talk(random(TEXT_MESSAGES.winner), 5000);
      cow.resetPosition();
      rope.reset();
      this.stopTimer();

      // Start success particle effect
      particleSystem.start("success");
    }
  }

  onLose() {
    // Player failed to maintain power
    if (rope && rope.attachedCow) {
      let cow = rope.attachedCow;
      gameState = "failed";
      gameResult.outcome = "failed";
      gameResult.message = "💔 THẤT BẠI! 💔";
      gameResult.detailMessage = `Moni Level ${cow.level} quá mạnh!\n${random(
        TEXT_MESSAGES.loser
      )}`;
      cow.talk(random(TEXT_MESSAGES.loser), 5000);
      cow.escape();
      rope.reset();
      this.stopTimer();

      // Start failure particle effect
      particleSystem.start("failed");
    }
  }

  draw() {
    // Only show power bar when a cow is caught
    if (gameState !== "pulling" || !rope || !rope.attachedCow) return;

    push();

    // Draw background bar
    stroke(0);
    strokeWeight(2);
    fill(100, 100, 100, 150);
    rect(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width,
      this.height
    );

    // Draw power level
    let powerHeight = map(this.currentPower, 0, this.maxPower, 0, this.height);

    // Color based on power level
    if (this.currentPower > 70) {
      fill(0, 255, 0); // Green - strong
    } else if (this.currentPower > 30) {
      fill(255, 255, 0); // Yellow - medium
    } else {
      fill(255, 0, 0); // Red - weak
    }

    noStroke();
    rect(
      this.x + this.width / 2,
      this.y + this.height - powerHeight / 2,
      this.width,
      powerHeight
    );

    // Draw center line
    stroke(255);
    strokeWeight(2);
    let centerY = this.y + this.height / 2;
    line(this.x - 5, centerY, this.x + this.width + 5, centerY);

    // Draw danger zone
    stroke(255, 0, 0);
    strokeWeight(3);
    let dangerY = this.y + this.height - 10;
    line(this.x - 5, dangerY, this.x + this.width + 5, dangerY);

    // Label
    fill(255);
    noStroke();
    textSize(12);
    text("SỨC MẠNH", this.x + this.width / 2, this.y - 20);

    // Timer display
    // if (this.timerActive) {
    //   textSize(14);
    //   let timeLeft = max(0, this.remainingTime / 1000);
    //   let timeText = timeLeft.toFixed(1) + "s";

    //   // Color based on remaining time
    //   if (timeLeft > this.maxTime / 3000) {
    //     fill(0, 255, 0); // Green - plenty of time
    //   } else if (timeLeft > this.maxTime / 6000) {
    //     fill(255, 255, 0); // Yellow - getting low
    //   } else {
    //     fill(255, 0, 0); // Red - critical
    //   }

    //   text(timeText, this.x + this.width / 2, this.y - 40);
    // }

    pop();
  }

  getPowerPercentage() {
    return this.currentPower / this.maxPower;
  }
}
