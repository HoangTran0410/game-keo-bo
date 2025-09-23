class Cow {
  constructor({
    img,
    pullImg,
    x = 100,
    y = 100,
    size = 150,
    speed = 1,
    level = random([1, 2, 3]),
  }) {
    this.img = img;
    this.pullImg = pullImg;

    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.level = level;
    this.state = "running"; // running, pulling, escaping, success, failed

    this.talkText = "";
    this.talkDuration = 0;

    // Escape animation properties
    this.originalSpeed = speed;
    this.escapeSpeed = 5;
    this.escapeDirection = 1; // 1 for right, -1 for left

    this.flipped = false;
  }

  update() {
    if (this.state === "running") {
      this.x += this.speed;

      if (this.x > width) {
        this.x = -this.size - random(100, 200);
        this.y = getRandomY(this.level);
        // reset state
        this.state = "running";
        this.speed = this.originalSpeed;
      }

      this.flipped = false;
    }
    if (this.state === "pulling") {
      // Cow is being managed by rope, only add slight struggle animation
      this.x += random(-0.5, 0.5) * this.level; // Slight visual struggle
      this.y += random(-0.3, 0.3) * this.level;

      if (random() < 0.02) {
        this.flipped = !this.flipped;
      }
    }
    if (this.state === "escaping") {
      // Move quickly in escape direction
      this.x += this.escapeSpeed * this.escapeDirection;
      this.y += random(-1, 1); // Slight random movement

      // Remove cow when it goes off screen
      if (this.x > width + 100 || this.x < -this.size - 100) {
        this.resetPosition();
      }
    }

    // add smoke
    if (random() < 0.02 * this.speed) {
      smokes.push(
        new Smoke(
          this.x + this.size / 3,
          this.y + this.size / 1.5,
          1000,
          random(1, 5)
        )
      );
    }

    // update talk
    this.talkDuration -= 1000 / frameRate();
    if (this.talkDuration <= 0) {
      // bị kéo
      if (this.state == "pulling") {
        this.talk(TEXT_MESSAGES.random(TEXT_MESSAGES.being_pulled));
      }

      // thành công / thất bại
      else if (
        (gameState === "success" || gameState === "failed") &&
        random() < 0.005
      ) {
        this.talk(
          random(
            gameState === "success" ? TEXT_MESSAGES.winner : TEXT_MESSAGES.loser
          ),
          1000
        );
      }

      // bò khác đang bị kéo
      else if (
        this.state === "running" &&
        gameState === "pulling" &&
        random() < 0.0015
      ) {
        this.talk(random(TEXT_MESSAGES.cow_cheer), 2000);
      }

      // đang chờ ném
      else if (this.state === "running" && random() < 0.002) {
        this.talk(random(TEXT_MESSAGES.waiting_throw), 3000);
      }

      // reset
      else this.talkText = "";
    }
  }

  isCollide(x, y, r) {
    const realSize = this.size * getPerspectiveScale(this.y);
    const realX = this.x + realSize / 2;
    const realY = this.y + realSize / 2;
    const realR = realSize / 2;

    return dist(x, y, realX, realY) < realR + r;
  }

  draw() {
    const realSize = this.size * getPerspectiveScale(this.y);
    push();
    translate(this.x + realSize / 2, this.y + realSize / 2);

    // draw cow
    push();
    // wiggle effect
    rotate(sin((frameCount * this.speed) / 20) * Math.min(this.speed / 5, 0.3));
    const halfSize = realSize / 2;
    if (this.flipped) scale(-1, 1);

    if (this.state === "running") {
      image(this.img, -halfSize, -halfSize, realSize, realSize * 0.8);
    } else if (this.state === "pulling") {
      image(this.pullImg, -halfSize, -halfSize, realSize, realSize);
    }
    pop();

    // draw level
    push();
    translate(0, -halfSize);
    fill(255);
    textSize(25);
    text(this.level, 0, 0);
    pop();

    // draw talk
    if (this.talkText) {
      let x = 0;
      let y = -halfSize * 1.2;
      let w = this.talkText.length * 11;

      push();
      translate(x, y);
      stroke(255);
      fill(255, 255, 255, 200);
      ellipse(0, 0, w, 40);
      ellipse(w * 0.25, 25, 10, 10);
      ellipse(w * 0.2, 20, 15, 15);

      fill(0);
      textSize(19);
      textAlign(CENTER, CENTER);
      text(this.talkText, 0, 0);
      pop();
    }

    pop();
  }

  talk(text, duration = 1000) {
    this.talkText = text;
    this.talkDuration = duration;
  }

  escape() {
    this.state = "escaping";
    this.speed = this.escapeSpeed;
    // Determine escape direction based on current position
    this.escapeDirection = this.x < width / 2 ? -1 : 1;
    this.talk(random(TEXT_MESSAGES.loser), 2000);
  }

  resetPosition() {
    this.state = "running";
    this.speed = this.originalSpeed;
    this.x = -this.size - random(100, 300);
    this.y = getRandomY(this.level);
    this.talkText = "";
    this.level = random([1, 2, 3]);
  }
}
