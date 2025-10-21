let cols = 20;
let rows = 20;
let grid = [];
let cellSize;

let LEFT = 0;
let RIGHT = 1;

let leftColor;
let rightColor;
let leftBallColor;
let rightBallColor;

let balls = [];

function setup() {
  createCanvas(500, 500);
  cellSize = width / cols;
  leftColor = color(220); // light grey
  rightColor = color(0);  // black
  leftBallColor = color(0); 
  rightBallColor = color(255); 

  // init grid: left half is LEFT, right half is RIGHT
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      if (i < cols / 2) {
        grid[i][j] = LEFT;
      } else {
        grid[i][j] = RIGHT;
      }
    }
  }

  // two balls: one LEFT color, one RIGHT color
  balls.push(new Ball(cellSize * 1.5, cellSize * (rows/2), LEFT));
  balls.push(new Ball(cellSize * (cols - 1.5), cellSize * (rows/2), RIGHT));
}

function draw() {
  background(255);

  // draw grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === LEFT) {
        fill(leftColor);
      } else {
        fill(rightColor);
      }
      stroke(180);
      rect(i * cellSize, j * cellSize, cellSize, cellSize);
    }
  }

  // balls move and interact
  for (let ball of balls) {
    ball.move();
    ball.show();
    ball.convertBlock();
  }

  // display counts
  let leftCount = 0;
  let rightCount = 0;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === LEFT) leftCount++;
      else rightCount++;
    }
  }
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text("Left: " + leftCount, 10, 10);
  fill(255);
  textAlign(RIGHT, TOP);
  text("Right: " + rightCount, width - 100, 10);
}

class Ball {
  constructor(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.vel = p5.Vector.random2D();
    this.vel.setMag(10); // speed of the ball
    this.radius = cellSize * 0.5;
  }

  move() {
    // Check next position
    let nextX = this.x + this.vel.x;
    let nextY = this.y + this.vel.y;

    // Check collision with opposite colored cells
    // Check the cells that the ball's circle would touch
    let minI = floor((nextX - this.radius) / cellSize);
    let maxI = floor((nextX + this.radius) / cellSize);
    let minJ = floor((nextY - this.radius) / cellSize);
    let maxJ = floor((nextY + this.radius) / cellSize);

    let bounceX = false;
    let bounceY = false;

    for (let i = minI; i <= maxI; i++) {
      for (let j = minJ; j <= maxJ; j++) {
        if (i >= 0 && i < cols && j >= 0 && j < rows) {
          if (grid[i][j] !== this.side) {
            // Check if ball actually intersects this cell
            let cellLeft = i * cellSize;
            let cellRight = (i + 1) * cellSize;
            let cellTop = j * cellSize;
            let cellBottom = (j + 1) * cellSize;

            if (nextX + this.radius > cellLeft && nextX - this.radius < cellRight &&
                nextY + this.radius > cellTop && nextY - this.radius < cellBottom) {

              // Convert the block if it is opposite and collision occurs
              grid[i][j] = this.side;
              console.log('change')

              // Determine if collision is more horizontal or vertical
              let currentI = floor(this.x / cellSize);
              let currentJ = floor(this.y / cellSize);

              if (i !== currentI) bounceX = true;
              if (j !== currentJ) bounceY = true;
            }
          }
        }
      }
    }

    if (bounceX || bounceY) {
      if (bounceX) {
        this.vel.x *= -1;
        nextX = this.x + this.vel.x;
      }
      if (bounceY) {
        this.vel.y *= -1;
        nextY = this.y + this.vel.y;
      }
      
      // Add randomness to the reaction vector for fun side effects
      let randomAngle = random(-PI/6, PI/6); // Random angle between -30 and 30 degrees
      this.vel.rotate(randomAngle);
      
    }

    // Move continuously
    this.x = nextX;
    this.y = nextY;

    // Bounce off canvas edges
    if (this.x - this.radius < 0 || this.x + this.radius > width) {
      this.vel.x *= -1;
      this.x = constrain(this.x, this.radius, width - this.radius);
    }
    if (this.y - this.radius < 0 || this.y + this.radius > height) {
      this.vel.y *= -1;
      this.y = constrain(this.y, this.radius, height - this.radius);
    }
  }

  show() {
    push();
    if (this.side === LEFT) {
      fill(leftBallColor);
    } else {
      fill(rightBallColor);
    }
    strokeWeight(2);
    ellipse(this.x, this.y, this.radius * 2);
    pop();
  }

  convertBlock() {
    // Convert the grid cell this ball is currently over
    let i = floor(this.x / cellSize);
    let j = floor(this.y / cellSize);
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      if (grid[i][j] !== this.side) {
        grid[i][j] = this.side;
      }
    }
  }
}
