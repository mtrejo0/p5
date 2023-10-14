// Global variables
let snake;
let food;
let gridSize = 20;

// Setup function
function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 255); // Switch to HSV color mode
  snake = new Snake();
  food = createFood();
  frameRate(10);
}

// Draw function
function draw() {
  background(0);
  snake.update();
  snake.checkCollision();
  snake.render();

  if (snake.eat(food)) {
    food = createFood();
  }

  snake.setIdealDirection();


  renderFood();
}

// Snake class
class Snake {
  constructor() {
    this.body = [createVector(0, 0)];
    
    this.xSpeed = 1;
    this.ySpeed = 0;
    this.hue = 0;
  }

  update() {
    const head = this.body[this.body.length - 1].copy();
    this.body.shift();

    head.x += this.xSpeed * gridSize;
    head.y += this.ySpeed * gridSize;

    this.body.push(head);
  }

  checkCollision() {
    const head = this.body[this.body.length - 1];

    // Check for collision with walls
    if (head.x < 0 || head.y < 0 || head.x >= width || head.y >= height) {
      gameOver();
    }

    // Check for collision with self
    for (let i = 0; i < this.body.length - 1; i++) {
      if (head.x === this.body[i].x && head.y === this.body[i].y) {
        gameOver();
      }
    }
  }

  render() {
    for (let i = 0; i < this.body.length; i++) {
      const hueValue = (this.hue + i * 10) % 255;
      fill(hueValue, 255, 255);
      noStroke();
      rect(this.body[i].x, this.body[i].y, gridSize, gridSize);
    }
    this.hue = (this.hue + 5) % 255; // Increment the hue value
  }

  eat(food) {
    const head = this.body[this.body.length - 1];

    if (head.x === food.x && head.y === food.y) {
      this.body.unshift(food.copy());
      return true;
    }

    return false;
  }

  setDirection(x, y) {
    this.xSpeed = x;
    this.ySpeed = y;
  }

  setIdealDirection() {
    const head = this.body[this.body.length - 1];

    const x = floor(head.x / gridSize) - 1;
    const y = floor(head.y / gridSize) - 1;
    const lastRow = floor(height / gridSize) - 1;
    const lastCol = floor(width / gridSize) - 1;


    if (x === lastRow-1 && y !== lastCol-1) {
      this.xSpeed = 0;
      this.ySpeed = 1;
    } 
    else if (x === lastRow-1 && y === lastCol-1) {
      this.xSpeed = -1;
      this.ySpeed = 0;
    }
    else if (x === -1 && y === -1) {
      this.xSpeed = 1;
      this.ySpeed = 0;
    }
    else if (x === -1) {
      this.xSpeed = 0;
      this.ySpeed = -1;
    }

    else if (x % 2 == 0 && y === lastCol-1) {
      this.xSpeed = -1;
      this.ySpeed = 0;
    }
    else if (x % 2 == 1 && y === lastCol-1) {
      this.xSpeed = 0;
      this.ySpeed = -1;
    }
    else if (x % 2 == 1 && y === 0) {
      this.xSpeed = -1;
      this.ySpeed = 0;
    }
    else if (x % 2 == 0 && y === 0) {
      this.xSpeed = 0;
      this.ySpeed = 1;
    }
  }
}

// Create food at random position
function createFood() {
  let foodPosition;
  let isFoodOnSnake = true;

  while (isFoodOnSnake) {
    const cols = floor(width / gridSize);
    const rows = floor(height / gridSize);
    foodPosition = createVector(floor(random(cols)), floor(random(rows)));
    foodPosition.mult(gridSize);

    isFoodOnSnake = false;
    for (let i = 0; i < snake.body.length; i++) {
      if (foodPosition.equals(snake.body[i])) {
        isFoodOnSnake = true;
        break;
      }
    }
  }

  return foodPosition;
}

// Render food
function renderFood() {
  fill(0, 0, 255);
  noStroke();
  rect(food.x, food.y, gridSize, gridSize);
}

// Handle keyboard input
function keyPressed() {
  if (keyCode === UP_ARROW && snake.ySpeed !== 1) {
    snake.setDirection(0, -1);
  } else if (keyCode === DOWN_ARROW && snake.ySpeed !== -1) {
    snake.setDirection(0, 1);
  } else if (keyCode === LEFT_ARROW && snake.xSpeed !== 1) {
    snake.setDirection(-1, 0);
  } else if (keyCode === RIGHT_ARROW && snake.xSpeed !== -1) {
    snake.setDirection(1, 0);
  }
}

// Game over
function gameOver() {
  background(0);
  textSize(32);
  fill(255);
  textAlign(CENTER, CENTER);
  text('Game Over!', width / 2, height / 2);
  noLoop();
}

// Start the game
setup();
