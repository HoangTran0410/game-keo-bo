class Hand {
  constructor({ img, x = 100, y = 100, w = 150, h = 150 }) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  draw() {
    push();

    translate(this.x + this.w / 2, this.y + this.h);
    // wiggle effect
    rotate(sin(frameCount * 0.1) * 0.1);

    image(this.img, -this.w / 2, -this.h, this.w, this.h);

    pop();
  }
}
