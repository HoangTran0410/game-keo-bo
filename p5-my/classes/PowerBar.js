class PowerBar {
  constructor() {
    this.x = 50;
    this.y = 0; // Will be set in setup
    this.width = 30;
    this.height = 200;
    this.maxPower = 100;
    this.currentPower = 50; // Start at center
    this.increaseRate = 3;
    this.decreaseRate = 1.5;
    this.isIncreasing = false;
    this.escapeThreshold = 0;
  }

  update() {
    // Only update power when a cow is actually caught
    if (gameState === "pulling" && rope && rope.attachedCow) {
      if (this.isIncreasing) {
        this.currentPower = min(
          this.maxPower,
          this.currentPower + this.increaseRate
        );
      } else {
        this.currentPower = max(0, this.currentPower - this.decreaseRate);
      }

      // Check if cow should escape
      if (this.currentPower <= this.escapeThreshold) {
        this.onCowEscape();
      }
    }
  }

  startIncreasing() {
    this.isIncreasing = true;
  }

  stopIncreasing() {
    this.isIncreasing = false;
  }

  onCowEscape() {
    // Find attached cow and make it escape
    if (rope && rope.attachedCow) {
      rope.attachedCow.escape();
      rope.reset();
      gameState = "running";
      this.currentPower = 50; // Reset to center
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
    rect(this.x, this.y, this.width, this.height);

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
    rect(this.x, this.y + this.height - powerHeight, this.width, powerHeight);

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
    textAlign(CENTER, CENTER);
    textSize(12);
    text("POWER", this.x + this.width / 2, this.y - 20);

    // Instructions
    textSize(10);
    text("ENTER", this.x + this.width / 2, this.y + this.height + 15);
    text("to pull", this.x + this.width / 2, this.y + this.height + 28);

    pop();
  }

  getPowerPercentage() {
    return this.currentPower / this.maxPower;
  }
}
