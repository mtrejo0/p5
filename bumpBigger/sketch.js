let ball = {
  x: 100,
  y: 100,
  diameter: 20,
  xSpeed: Math.random() * 5 + 10,
  ySpeed: Math.random() * 5 + 10,
  color: Math.random() * 255
};

let collided = false
let lastCollided = 0 

let t = 0

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
}

function draw() {
  background(0, 30);
  drawBall();
  moveBall();
  checkCollision();
  t += 1
}

function drawBall() {
  fill(ball.color, 255, 255);
  ellipse(ball.x, ball.y, ball.diameter, ball.diameter);
}

function moveBall() {
  ball.x += ball.xSpeed;
  ball.y += ball.ySpeed;
}

function checkCollision() {

  if (ball.x > width - ball.diameter / 2 || ball.x < ball.diameter / 2) {
    ball.x = ball.x + (ball.xSpeed > 0 ? -1 : 1) * ball.diameter / 10
    ball.xSpeed *= -1;
    collided = true;
    lastCollided = t
  }
  if (ball.y > height - ball.diameter / 2 || ball.y < ball.diameter / 2) {
    ball.y = ball.y + (ball.ySpeed > 0 ? -1 : 1) * ball.diameter / 10
    ball.ySpeed *= -1;
    collided = true;
    lastCollided = t
  }

  if (collided && t - lastCollided > 1) {
    console.log("grow", t, collided)
    ball.diameter *= 1.1; // Increase size by 10% only once per frame
    lastCollided = t
    collided = false
    ball.color = Math.random()* 255
  }
}
