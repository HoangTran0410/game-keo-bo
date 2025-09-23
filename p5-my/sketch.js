let gameState = "running"; // running, pulling, success, failed

let backgroundImg;

const cowCount = 3;
const cows = [];
const cowImgs = [];
const cowPullImgs = [];

let handImg;
let hand;

const smokes = [];

const TEXT_MESSAGES = {
  random(obj) {
    return obj[floor(random(obj.length))];
  },
  loser: [
    "Bye🤫🧏🏻‍♂️Bye🗿",
    "🫵🏼🤣 Hahaha. Losser",
    "🤡 oh no. Losser",
    "😂🤣🤪😁",
    "🤘🤏 No no",
  ],
};

function preload() {
  backgroundImg = loadImage(`assets/bg.png`);
  handImg = loadImage(`assets/hand.png`);
  for (let i = 1; i < cowCount + 1; i++) {
    cowImgs.push(loadImage(`assets/cow${i}.png`));
    cowPullImgs.push(loadImage(`assets/cow${i}_pull.png`));
  }
}

function getRandomY() {
  return random(height / 2 - 60, height / 2 + 50);
}

function setup() {
  createCanvas(800, 600);

  hand = new Hand({
    img: handImg,
    w: 120,
    h: 120,
    y: height - 100,
    x: width / 2 - 75,
  });
  let currentCowId = 0;
  for (let i = 0; i < 7; i++) {
    cows.push(
      new Cow({
        img: cowImgs[currentCowId],
        pullImg: cowPullImgs[currentCowId],
        x: 50 + i * 150,
        y: getRandomY(),
        speed: random(1, 3),
        level: random([1, 2, 3]),
      })
    );
    currentCowId++;
    if (currentCowId >= cowCount) {
      currentCowId = 0;
    }
  }
}

function draw() {
  background(backgroundImg);

  // sort cows by y
  cows.sort((a, b) => a.y - b.y);

  for (let i = smokes.length - 1; i >= 0; i--) {
    smokes[i].update();
    smokes[i].show();

    if (smokes[i].isFinished()) {
      smokes.splice(i, 1);
    }
  }

  cows.forEach((cow) => cow.update());
  cows.forEach((cow) => cow.draw());

  hand.draw();
}
