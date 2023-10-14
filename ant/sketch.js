let grid = [];
let resolution;
let ant;
let loop = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  resolution = 10;
  const rows = height / resolution;
  const cols = width / resolution;

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(0);
    }
    grid.push(row);
  }

  ant = {
    x: floor(cols / 2),
    y: floor(rows / 2),
    dir: createVector(0, -1),
  };
}

function updateAnt() {
  const { x, y, dir } = ant;

  if (grid[y][x] === 0) {
    grid[y][x] = 1;
    ant.dir.rotate(-HALF_PI);
  } else {
    grid[y][x] = 0;
    ant.dir.rotate(HALF_PI);
  }

  ant.x += ant.dir.x;
  ant.y += ant.dir.y;

  if (ant.x < 0) ant.x = grid[0].length - 1;
  if (ant.x >= grid[0].length) ant.x = 0;
  if (ant.y < 0) ant.y = grid.length - 1;
  if (ant.y >= grid.length) ant.y = 0;
}

function mouseClicked() {
  const x = floor(mouseX / resolution);
  const y = floor(mouseY / resolution);

  if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
    grid[y][x] = grid[y][x] === 0 ? 1 : 0;
  }
}


function keyPressed() {
  if (key === " ") {
    loop = !loop;
  }
}

function draw() {
  if (!loop) return;

  background(255);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const x = j * resolution;
      const y = i * resolution;

      if (grid[i][j] === 1) {
        fill(0);
        rect(x, y, resolution, resolution);
      }

      noFill();
      stroke(200);
      rect(x, y, resolution, resolution);
    }
  }

  const antX = ant.x * resolution;
  const antY = ant.y * resolution;
  fill("green");
  rect(antX, antY, resolution, resolution);

  updateAnt();
}
