let grid;
let resolution;
let cols;
let rows;
let isPlaying = true; // Variable to control game pause/play

let reverse = false;
let stateChanges = [];

let frameRateSlider; // Slider for frame rate

function createGrid(cols, rows) {
  const grid = new Array(cols);
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j] = Math.random() < 0.5 ? true : false; // Initialize with random values
    }
  }
  return grid;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  resolution = 10;
  cols = Math.floor(width / resolution);
  rows = Math.floor(height / resolution);
  grid = createGrid(cols, rows);

  // Create frame rate slider
  frameRateSlider = createSlider(1, 60, 30, 1);
  frameRateSlider.position(10, 40);

  // Create pause/play button
  const playButton = createButton("Pause");
  playButton.position(10, 10);
  playButton.mousePressed(() => {
    isPlaying = !isPlaying; // Toggle pause/play
    playButton.html(isPlaying ? "Pause" : "Play");
  });

  // Create reverse button
  const reverseButton = createButton("Reverse");
  reverseButton.position(70, 10);
  reverseButton.mousePressed(() => {
    reverse = !reverse;
    if (reverse) {
      isPlaying = true;
      playButton.html(isPlaying ? "Pause" : "Play");
    }
    reverseButton.html(reverse ? "Forward" : "Reverse");
  });
}

function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const col = (x + i + cols) % cols;
      const row = (y + j + rows) % rows;
      sum += grid[col][row] ? 1 : 0;
    }
  }
  sum -= grid[x][y] ? 1 : 0;
  return sum;
}

function updateGrid() {
  const changes = [];

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const state = grid[i][j];
      const neighbors = countNeighbors(grid, i, j);
      let nextState;

      if (state && (neighbors < 2 || neighbors > 3)) {
        nextState = false; // Cell dies
      } else if (!state && neighbors === 3) {
        nextState = true; // Cell is born
      } else {
        nextState = state; // Cell remains the same
      }

      if (nextState !== state) {
        changes.push({ x: i, y: j, state: nextState });
      }
    }
  }

  for (const { x, y, state } of changes) {
    grid[x][y] = state;
  }

  stateChanges.push(changes);
}

function reverseGrid() {
  if (stateChanges.length === 0) return;

  const changes = stateChanges.pop();

  for (const { x, y, state } of changes) {
    grid[x][y] = !state;
  }
}

function mouseClicked() {
  const x = Math.floor(mouseX / resolution);
  const y = Math.floor(mouseY / resolution);
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    grid[x][y] = !grid[x][y];
    stateChanges.push([{ x, y, state: grid[x][y] }]);
  }
}

function draw() {
  frameRate(frameRateSlider.value());
  background(255);

  if (isPlaying) {
    if (!reverse) {
      updateGrid();
    } else {
      reverseGrid();
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * resolution;
      const y = j * resolution;

      if (grid[i][j]) {
        fill(0);
        rect(x, y, resolution, resolution);
      }

      noFill();
      stroke(200);
      rect(x, y, resolution, resolution);
    }
  }
}
