class Cow {
  constructor({
    imgs,
    pullImgs,
    x = 100,
    y = 100,
    size = 150,
    speed = 1,
    level = random([1, 2, 3]),
  }) {
    this.imgs = imgs;
    this.pullImgs = pullImgs;
    this.imgIndex = random(
      Array.from({ length: this.imgs.length }, (_, i) => i)
    );

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
    }

    // add smoke
    if (random() < 0.02 * this.speed) {
      smokes.push(
        new Smoke(
          this.x + this.size / 3,
          this.y + this.size,
          1000,
          random(1, 5)
        )
      );
    }

    // update talk
    this.talkDuration -= 1000 / frameRate();
    if (this.talkDuration <= 0) {
      let text = "";
      let duration = 0;

      // bị kéo
      if (this.state == "pulling") {
        text = random(TEXT_MESSAGES.being_pulled);
        duration = 2000;
      }

      // thành công / thất bại
      else if (gameState === "success" || gameState === "failed") {
        if (random() < 0.005) {
          text = random(
            gameState === "success" ? TEXT_MESSAGES.winner : TEXT_MESSAGES.loser
          );
          duration = 1000;
        }
      }

      // bò khác đang bị kéo
      else if (this.state === "running" && gameState === "pulling") {
        if (random() < 0.0015) {
          text = random(TEXT_MESSAGES.cow_cheer);
          duration = 2000;
        }
      }

      // đang chờ ném
      else if (this.state === "running") {
        if (random() < 0.002) {
          text = random(TEXT_MESSAGES.waiting_throw);
          duration = 3000;
        }
      }

      if (text && duration) {
        this.talk(text, duration);
      } else {
        this.talkText = "";
      }
    }

    if (this.x > width) {
      // this.x = -this.size - random(100, 200);
      // this.y = getRandomY(this.level);
      // // reset state
      // this.state = "running";
      // this.speed = this.originalSpeed;
      this.resetPosition();
    }
  }

  isCollide(x, y, r) {
    const realSize = this.size * getPerspectiveScale(this.y);
    const realX = this.x + realSize / 2;
    const realY = this.y + realSize / 2;
    const realR = realSize / 2.5;

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
      image(this.imgs[this.imgIndex], -halfSize, -halfSize, realSize, realSize);
    } else if (this.state === "pulling") {
      image(
        this.pullImgs[this.imgIndex],
        -halfSize,
        -halfSize,
        realSize,
        realSize
      );
    }
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
      // ellipse(w * 0.25, 25, 10, 10);
      // ellipse(w * 0.2, 20, 15, 15);

      fill(0);
      textSize(19);
      text(this.talkText, 0, 0);
      pop();
    }

    // draw level
    push();
    translate(0, -halfSize);
    fill(255, 150);
    noStroke();
    ellipse(0, 0, 30, 30);

    fill(30);
    textSize(25);
    text(this.level, 0, 0);
    pop();

    pop();

    // debug collide edge
    // const realX = this.x + realSize / 2;
    // const realY = this.y + realSize / 2;
    // const realR = realSize / 2.5;
    // push();
    // stroke(255, 0, 0);
    // strokeWeight(2);
    // noFill();
    // ellipse(realX, realY, realR * 2, realR * 2);
    // pop();
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
    this.imgIndex = random(
      Array.from({ length: this.imgs.length }, (_, i) => i)
    );
  }
}
