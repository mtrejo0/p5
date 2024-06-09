let numDisks = 20;
let towers = [[], [], []];
let moveDelay = 1;
let lastMoveTime = 0;
let moves = [];
let startTime = 0

let startMoves = 0

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = numDisks; i > 0; i--) {
    towers[0].push(i);
  }
  solveHanoi(numDisks, 0, 1, 2);

  startMoves = moves.length

  startTime = millis()

  frameRate(10);
}

function draw() {
  background(0);

  fill(255)
  text("Move # " + (startMoves - moves.length), 100, 100)
  text("Moves left: " + (moves.length.toLocaleString()), 100, 125)
  text("Disc Count " + numDisks, 100, 75)
  text("Time (s): " + ((millis() -startTime) /1000).toFixed(0), 100, 150)
  drawTowers();
  if ( moves.length > 0) {
    let move = moves.shift();
    moveDisk(move.from, move.to);
    lastMoveTime = millis();
  }
}

function drawTowers() {
  for (let i = 0; i < 3; i++) {
    drawTower(i);
  }
}

function drawTower(n) {
  let x = 200 + windowWidth/3 * n;
  fill(150);
  let tower = towers[n];
  for (let i = 0; i < tower.length; i++) {
    let diskWidth = tower[i] * 15;
    fill(255, 0, 0);
    rect(x - diskWidth / 2, windowHeight/2 + numDisks * 20 - i * 20, diskWidth, 15);
  }
}

function moveDisk(from, to) {
  let disk = towers[from].pop();
  towers[to].push(disk);
}

function solveHanoi(n, from, aux, to) {
  if (n > 0) {
    solveHanoi(n - 1, from, to, aux);
    moves.push({from: from, to: to});
    solveHanoi(n - 1, aux, from, to);
  }
}