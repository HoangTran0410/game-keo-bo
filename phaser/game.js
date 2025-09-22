class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Preload method - không cần tạo assets ở đây
    // Assets sẽ được tạo trong create()
  }

  createAssets() {
    // Tạo sprite bò đơn giản
    const cowGraphics = this.add.graphics();
    cowGraphics.fillStyle(0x8b4513);
    cowGraphics.fillRect(0, 0, 60, 30);
    cowGraphics.fillStyle(0xffffff);
    cowGraphics.fillCircle(15, 8, 3);
    cowGraphics.fillCircle(45, 8, 3);
    cowGraphics.fillStyle(0x000000);
    cowGraphics.fillCircle(15, 8, 1);
    cowGraphics.fillCircle(45, 8, 1);
    cowGraphics.generateTexture("cow", 60, 30);
    cowGraphics.destroy();

    // Tạo sprite cowboy
    const cowboyGraphics = this.add.graphics();
    cowboyGraphics.fillStyle(0xffdbb3);
    cowboyGraphics.fillRect(15, 5, 30, 35);
    cowboyGraphics.fillStyle(0x8b4513);
    cowboyGraphics.fillRect(10, 0, 40, 15);
    cowboyGraphics.fillStyle(0x000080);
    cowboyGraphics.fillRect(18, 20, 24, 25);
    cowboyGraphics.generateTexture("cowboy", 60, 45);
    cowboyGraphics.destroy();

    // Tạo sprite dây thòng lọng
    const lassoGraphics = this.add.graphics();
    lassoGraphics.lineStyle(3, 0x8b4513);
    lassoGraphics.strokeCircle(15, 15, 12);
    lassoGraphics.generateTexture("lasso", 30, 30);
    lassoGraphics.destroy();

    // Tạo background cỏ
    const grassGraphics = this.add.graphics();
    grassGraphics.fillStyle(0x228b22);
    grassGraphics.fillRect(0, 0, 32, 32);
    grassGraphics.fillStyle(0x32cd32);
    grassGraphics.fillRect(8, 8, 16, 16);
    grassGraphics.generateTexture("grass", 32, 32);
    grassGraphics.destroy();
  }

  create() {
    // Game config
    this.gameWidth = 800;
    this.gameHeight = 600;
    this.score = 0;
    this.gameRunning = true;
    this.cowsCaught = 0;

    // Tạo assets trước
    this.createAssets();

    // Tạo background
    this.createBackground();

    // Tạo cowboy player
    this.player = this.add.sprite(100, 500, "cowboy");
    this.player.setScale(1.2);

    // Test cow để kiểm tra texture
    const testCow = this.add.sprite(300, 400, "cow");
    testCow.setScale(1.5);
    console.log(
      "Test cow created at:",
      testCow.x,
      testCow.y,
      "texture:",
      testCow.texture.key
    );

    // Group cho đàn bò
    this.cows = this.physics.add.group();

    // Group cho dây thòng lọng
    this.lassos = this.physics.add.group();

    // Timer tạo bò
    this.cowTimer = this.time.addEvent({
      delay: 2000,
      callback: this.spawnCow,
      callbackScope: this,
      loop: true,
    });

    // Input controls
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // UI
    this.createUI();

    // Collision detection
    this.physics.add.overlap(this.lassos, this.cows, this.catchCow, null, this);

    // Game instructions
    this.showInstructions();
  }

  createBackground() {
    // Sky gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x98fb98, 0x98fb98, 1);
    graphics.fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Ground
    graphics.fillStyle(0x8b7355);
    graphics.fillRect(0, 520, this.gameWidth, 80);

    // Grass texture tiling
    for (let x = 0; x < this.gameWidth; x += 32) {
      for (let y = 480; y < 520; y += 32) {
        this.add.image(x, y, "grass").setOrigin(0, 0).setAlpha(0.7);
      }
    }

    // Clouds
    this.createClouds();
  }

  createClouds() {
    const cloudPositions = [
      { x: 150, y: 100 },
      { x: 400, y: 80 },
      { x: 650, y: 120 },
    ];

    cloudPositions.forEach((pos) => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.8);
      cloud.fillCircle(0, 0, 30);
      cloud.fillCircle(25, 0, 25);
      cloud.fillCircle(50, 0, 30);
      cloud.fillCircle(25, -15, 20);
      cloud.x = pos.x;
      cloud.y = pos.y;
    });
  }

  createUI() {
    // Score text
    this.scoreText = this.add.text(20, 20, "Điểm: 0", {
      fontSize: "24px",
      fontFamily: "Arial",
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Cows caught text
    this.cowsText = this.add.text(20, 50, "Bò đã bắt: 0", {
      fontSize: "20px",
      fontFamily: "Arial",
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Instructions
    this.instructionText = this.add
      .text(
        this.gameWidth / 2,
        this.gameHeight - 30,
        "Nhấn ENTER để quăng dây, giữ ENTER để kéo bò về!",
        {
          fontSize: "16px",
          fontFamily: "Arial",
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5);
  }

  showInstructions() {
    const instructions = this.add
      .text(
        this.gameWidth / 2,
        this.gameHeight / 2,
        "🤠 GAME KÉO BÒ 🐄\n\n" +
          "Hướng dẫn:\n" +
          "• Nhấn ENTER để quăng dây thòng lọng\n" +
          "• Nhấn và giữ ENTER để kéo bò về\n" +
          "• Bắt được bò = +100 điểm\n\n" +
          "Nhấn SPACE để bắt đầu!",
        {
          fontSize: "24px",
          fontFamily: "Arial",
          color: "#FFFFFF",
          stroke: "#000000",
          strokeThickness: 3,
          align: "center",
        }
      )
      .setOrigin(0.5);

    this.gameRunning = false;

    this.input.keyboard.once("keydown-SPACE", () => {
      instructions.destroy();
      this.gameRunning = true;
    });
  }

  spawnCow() {
    if (!this.gameRunning) return;

    const spawnX = this.gameWidth + 50;
    const spawnY = Phaser.Math.Between(400, 480);
    console.log(
      "Spawning cow at:",
      spawnX,
      spawnY,
      "Game size:",
      this.gameWidth,
      this.gameHeight
    );

    const cow = this.physics.add.sprite(spawnX, spawnY, "cow");

    console.log(
      "Cow created:",
      cow.x,
      cow.y,
      "visible:",
      cow.visible,
      "alpha:",
      cow.alpha,
      "scale:",
      cow.scaleX,
      cow.scaleY
    );

    cow.setScale(1.5);
    cow.body.setVelocityX(-150 - Math.random() * 100);
    cow.setCollideWorldBounds(false);

    // Add to cows group
    this.cows.add(cow);

    // Remove cow when it goes off screen
    cow.body.checkWorldBounds = true;
    cow.body.onWorldBounds = true;
    this.physics.world.on("worldbounds", (event, body) => {
      if (body.gameObject === cow) {
        cow.destroy();
      }
    });

    // Cow animation (simple bouncing)
    this.tweens.add({
      targets: cow,
      y: cow.y - 10,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  update() {
    if (!this.gameRunning) return;

    // Handle lasso throwing
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.throwLasso();
    }

    // Handle lasso pulling (when holding ENTER)
    if (this.enterKey.isDown) {
      this.pullLassos();
    }

    // Clean up off-screen lassos
    this.lassos.children.entries.forEach((lasso) => {
      if (lasso.x > this.gameWidth + 100 || lasso.y < -100) {
        lasso.destroy();
      }
    });
  }

  throwLasso() {
    // Limit lasso count
    if (this.lassos.children.size >= 3) return;

    console.log("Throwing lasso...");

    const lasso = this.physics.add.sprite(
      this.player.x + 30,
      this.player.y,
      "lasso"
    );

    lasso.setScale(0.8);
    lasso.body.setVelocityX(400);
    lasso.body.setVelocityY(-100);
    lasso.body.setGravityY(200);

    this.lassos.add(lasso);

    // Lasso rotation animation
    this.tweens.add({
      targets: lasso,
      rotation: Math.PI * 4,
      duration: 2000,
      ease: "Linear",
    });

    // Sound effect simulation (visual feedback)
    this.cameras.main.shake(50, 0.01);
  }

  pullLassos() {
    this.lassos.children.entries.forEach((lasso) => {
      if (lasso.getData("caught")) {
        // Pull the caught cow towards player
        const cow = lasso.getData("caughtCow");
        if (cow && cow.active) {
          const pullForce = 300;
          this.physics.moveToObject(cow, this.player, pullForce);

          // Check if cow reached player
          const distance = Phaser.Math.Distance.Between(
            cow.x,
            cow.y,
            this.player.x,
            this.player.y
          );

          if (distance < 80) {
            this.completeCatch(cow, lasso);
          }
        }
      }
    });
  }

  catchCow(lasso, cow) {
    if (lasso.getData("caught")) return;

    // Mark lasso as caught
    lasso.setData("caught", true);
    lasso.setData("caughtCow", cow);
    lasso.body.setVelocity(0, 0);
    lasso.body.setGravityY(0);

    // Stop cow movement
    cow.body.setVelocityX(0);

    // Visual feedback
    lasso.setTint(0x00ff00);
    cow.setTint(0xffff00);

    // Connect lasso to cow visually
    this.drawRope(lasso, cow);
  }

  drawRope(lasso, cow) {
    if (lasso.rope) lasso.rope.destroy();

    const rope = this.add.graphics();
    rope.lineStyle(3, 0x8b4513);
    rope.strokePoints([
      { x: lasso.x, y: lasso.y },
      { x: cow.x, y: cow.y },
    ]);

    lasso.rope = rope;

    // Update rope position continuously
    lasso.ropeUpdate = () => {
      if (rope && rope.active && cow.active) {
        rope.clear();
        rope.lineStyle(3, 0x8b4513);
        rope.strokePoints([
          { x: lasso.x, y: lasso.y },
          { x: cow.x, y: cow.y },
        ]);
      }
    };

    this.time.addEvent({
      delay: 16,
      callback: lasso.ropeUpdate,
      callbackScope: this,
      repeat: 500,
    });
  }

  completeCatch(cow, lasso) {
    // Update score
    this.score += 100;
    this.cowsCaught += 1;

    // Update UI
    this.scoreText.setText("Điểm: " + this.score);
    this.cowsText.setText("Bò đã bắt: " + this.cowsCaught);

    // Visual celebration
    const celebration = this.add
      .text(cow.x, cow.y - 50, "+100!", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#00FF00",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: celebration,
      y: celebration.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => celebration.destroy(),
    });

    // Screen flash
    this.cameras.main.flash(200, 0, 255, 0);

    // Clean up
    if (lasso.rope) lasso.rope.destroy();
    cow.destroy();
    lasso.destroy();

    // Increase difficulty slightly
    if (this.cowsCaught % 5 === 0) {
      this.cowTimer.delay = Math.max(1000, this.cowTimer.delay - 200);
    }
  }
}

// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#87CEEB",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 320,
      height: 240,
    },
    max: {
      width: 1200,
      height: 900,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: GameScene,
};

// Start the game
const game = new Phaser.Game(config);
