class Rope {
  constructor() {
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.isActive = false;
    this.isExtending = false;
    this.isRetracting = false;
    this.isPulling = false; // New state for when user is actively pulling
    this.speed = 8;
    this.pullSpeed = 2; // Slower pulling speed
    this.resistanceSpeed = 1; // Speed at which cow resists/pulls back
    this.attachedCow = null;
    this.thickness = 6;
    this.cowPullDistance = 0; // How far cow has been pulled
  }

  throw(startX, startY, targetX, targetY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = startX;
    this.endY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.isActive = true;
    this.isExtending = true;
    this.isRetracting = false;
    this.attachedCow = null;
  }

  update() {
    if (!this.isActive) return;

    if (this.isExtending) {
      // Extend rope towards target
      let dx = this.targetX - this.endX;
      let dy = this.targetY - this.endY;
      let distance = dist(this.endX, this.endY, this.targetX, this.targetY);

      if (distance > this.speed) {
        let angle = atan2(dy, dx);
        this.endX += cos(angle) * this.speed;
        this.endY += sin(angle) * this.speed;

        // Check collision with cows
        this.checkCowCollision();
      } else {
        // Reached target, start retracting if no cow caught
        this.endX = this.targetX;
        this.endY = this.targetY;
        if (!this.attachedCow) {
          this.isExtending = false;
          this.isRetracting = true;
        } else {
          this.isExtending = false;
          // Cow is caught, now player can pull
        }
      }
    } else if (this.attachedCow) {
      // Handle cow pulling mechanics
      this.updateCowPulling();
    } else if (this.isRetracting) {
      // Retract empty rope back to start
      let dx = this.startX - this.endX;
      let dy = this.startY - this.endY;
      let distance = dist(this.endX, this.endY, this.startX, this.startY);

      if (distance > this.speed) {
        let angle = atan2(dy, dx);
        this.endX += cos(angle) * this.speed;
        this.endY += sin(angle) * this.speed;
      } else {
        // Rope fully retracted
        this.endX = this.startX;
        this.endY = this.startY;
        this.isActive = false;
        this.isRetracting = false;
        gameState = "running";
      }
    }
  }

  updateCowPulling() {
    if (!this.attachedCow) return;

    let cow = this.attachedCow;
    let targetDistance = dist(
      cow.x + cow.size / 2,
      cow.y + cow.size / 2,
      this.startX,
      this.startY
    );

    if (this.isPulling) {
      // Player is pulling - move cow towards rope start
      let dx = this.startX - (cow.x + cow.size / 2);
      let dy = this.startY - (cow.y + cow.size / 2);
      let distance = sqrt(dx * dx + dy * dy);

      if (distance > 50) {
        // Don't pull too close
        let pullForce = this.pullSpeed * (powerBar.getPowerPercentage() * 2); // Power affects pull strength
        let angle = atan2(dy, dx);
        cow.x += cos(angle) * pullForce;
        cow.y += sin(angle) * pullForce;
        this.cowPullDistance += pullForce;
      }
    } else {
      // Cow resists and tries to pull back
      if (this.cowPullDistance > 0) {
        let dx = this.targetX - (cow.x + cow.size / 2);
        let dy = this.targetY - (cow.y + cow.size / 2);
        let resistForce = this.resistanceSpeed * cow.level; // Stronger cows resist more
        let angle = atan2(dy, dx);
        cow.x += cos(angle) * resistForce;
        cow.y += sin(angle) * resistForce;
        this.cowPullDistance = max(0, this.cowPullDistance - resistForce);
      }
    }

    // Update rope end to cow position
    this.endX = cow.x + cow.size / 2;
    this.endY = cow.y + cow.size / 2;
  }

  checkCowCollision() {
    for (let cow of cows) {
      if (cow.state === "running" && cow.isCollide(this.endX, this.endY, 10)) {
        // Rope hit a cow
        this.attachedCow = cow;
        cow.state = "pulling";
        cow.talk("Help! I'm being pulled! 😱", 3000);
        this.isExtending = false;

        // Store cow's original position for resistance calculation
        this.targetX = cow.x + cow.size / 2;
        this.targetY = cow.y + cow.size / 2;
        this.cowPullDistance = 0;
        break;
      }
    }
  }

  draw() {
    if (!this.isActive) return;

    push();
    stroke(139, 69, 19); // Brown color for rope
    strokeWeight(this.thickness);
    strokeCap(ROUND);

    // Draw main rope line with slight sag
    let distance = dist(this.startX, this.startY, this.endX, this.endY);
    let sagAmount = min(distance, 100);

    // Draw rope as curved line
    noFill();
    bezier(
      this.startX,
      this.startY,
      this.startX,
      this.startY + sagAmount * 0.3,
      this.endX,
      this.endY - sagAmount * 0.3,
      this.endX,
      this.endY
    );

    // Draw rope end lasso
    // fill(139, 69, 19);
    // stroke(101, 67, 33);
    // strokeWeight(3);
    // ellipse(this.endX, this.endY, 15, 15);

    // Draw lasso opening
    noFill();
    stroke(139, 69, 19);
    strokeWeight(2);
    ellipse(this.endX, this.endY, 25, 25);

    pop();
  }

  startPulling() {
    this.isPulling = true;
  }

  stopPulling() {
    this.isPulling = false;
  }

  reset() {
    this.isActive = false;
    this.isExtending = false;
    this.isRetracting = false;
    this.isPulling = false;
    this.cowPullDistance = 0;
    if (this.attachedCow) {
      this.attachedCow.state = "running";
      this.attachedCow = null;
    }
  }
}
