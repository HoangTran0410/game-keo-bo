class Smoke {
  constructor(x, y, life, r) {
    this.pos = createVector(x, y);
    this.radius = r || floor(random(10, 50));
    this.born = millis();
    this.life = life;
  }

  update() {
    this.pos.add(random(-2, 2), random(-1));
    if (this.radius < 30) this.radius += random(1);
  }

  isFinished() {
    return millis() - this.born > this.life;
  }

  show() {
    push();
    var c = map(this.life - (millis() - this.born), 0, this.life, 200, 255);
    fill(c, c / 2);
    noStroke();

    ellipse(this.pos.x, this.pos.y, this.radius * 2);
    pop();
  }
}
