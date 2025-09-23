class Cow {
  constructor({
    img,
    pullImg,
    x = 100,
    y = 100,
    size = 150,
    speed = 1,
    level = 1,
  }) {
    this.img = img;
    this.pullImg = pullImg;

    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.level = level;
    this.state = "running"; // running, pulling, success, failed

    this.talkText = "";
    this.talkDuration = 0;
  }

  update() {
    if (this.state === "running") {
      this.x += this.speed;

      if (this.x > width) {
        this.x = -this.size - random(100, 200);
        this.y = getRandomY();
      }
    }
    if (this.state === "pulling") {
      this.x = mouseX;
      this.y = mouseY;
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
      if (this.state == "pulling") {
        this.talk(TEXT_MESSAGES.random(TEXT_MESSAGES.loser));
      } else this.talkText = "";
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

  talk(text, duration = 2000) {
    this.talkText = text;
    this.talkDuration = duration;
  }
}

const PERSPECTIVE_MIN_Y = 150; // Furthest point (smallest scale) - top of screen
const PERSPECTIVE_MAX_Y = 400; // Closest point (largest scale) - bottom of screen
const PERSPECTIVE_MIN_SCALE = 0.2; // Minimum scale factor (far away)
const PERSPECTIVE_MAX_SCALE = 1.3; // Maximum scale factor (close up)

function getPerspectiveScale(y) {
  // Clamp Y between min and max
  let clampedY = constrain(y, PERSPECTIVE_MIN_Y, PERSPECTIVE_MAX_Y);

  // Map Y to scale factor (higher Y = larger scale, lower Y = smaller scale)
  let scale = map(
    clampedY,
    PERSPECTIVE_MIN_Y,
    PERSPECTIVE_MAX_Y,
    PERSPECTIVE_MIN_SCALE,
    PERSPECTIVE_MAX_SCALE
  );

  return scale;
}
