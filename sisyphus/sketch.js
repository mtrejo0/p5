// Physics and game variables
let player;
let boulder;
let slope;
let gravity = 0.5;
let pushing = false;
let gameState = 'pushing'; // 'pushing' or 'rolling'

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize game objects
  slope = {
    angle: PI/6, // 30 degree slope
    base: createVector(0, height), // Changed to start from bottom-left
    length: 1* width // Changed to full width
  };
  
  // Calculate slope end point
  let rise = slope.length * sin(slope.angle);
  let run = slope.length * cos(slope.angle);
  slope.top = createVector(slope.base.x + run, slope.base.y - rise);
  
  // Adjust initial positions for player and boulder
  player = {
    pos: createVector(50, height - 40),
    size: 30,
    speed: 3
  };
  
  boulder = {
    pos: createVector(90, height - 50),
    size: 40,
    vel: createVector(0, 0)
  };
}

function draw() {
  // Sky
  background(135, 206, 235); // Baby blue
  
  // Sun
  fill(255, 255, 0);
  noStroke();
  circle(100, 100, 80);
  
  // Clouds
  drawCloud(200, 150);
  drawCloud(500, 100);
  drawCloud(800, 180);
  
  // Mountain/Ground
  fill(139, 69, 19); // Brown

  stroke(0);
  strokeWeight(4);
  beginShape();
  vertex(0, height);
  vertex(slope.base.x, slope.base.y);
  vertex(slope.top.x, slope.top.y);
  vertex(width, height/2);
  vertex(width, height);
  endShape(CLOSE);
  
  
  if (keyIsDown(RIGHT_ARROW)) {
    let moveAngle = slope.angle;
    let newX = player.pos.x + cos(moveAngle) * player.speed;
    let newY = player.pos.y - sin(moveAngle) * player.speed;
    
    // Check if new position would be beyond the slope top
    if (newX <= slope.top.x) {
      player.pos.x = newX;
      player.pos.y = newY;
    }
  }
  
  if (keyIsDown(LEFT_ARROW)) {
    let moveAngle = slope.angle;
    let newX = player.pos.x - cos(moveAngle) * player.speed;
    let newY = player.pos.y + sin(moveAngle) * player.speed;
    
    // Check if new position would be beyond the slope base
    if (newX >= slope.base.x + 50) {  // Added offset to prevent going too far left
      player.pos.x = newX;
      player.pos.y = newY;
    }
  }

  // Handle game states
  if (gameState === 'pushing') {
    handlePushing();
  } else {
    handleRolling();
  }

  if (isPlayerNearBoulder() && gameState !== 'rolling') {
    gameState = 'pushing'
  }
  
  // Draw player (Sisyphus) - replace the circle with stick figure
  stroke(0);
  strokeWeight(2);
  fill('white')
  
  // Head
  circle(player.pos.x, player.pos.y - 15, 15);
  
  // Body
  line(player.pos.x, player.pos.y - 7, player.pos.x, player.pos.y + 10);
  
  // Arms
  line(player.pos.x - 10, player.pos.y, player.pos.x + 10, player.pos.y);
  
  // Legs
  line(player.pos.x, player.pos.y + 10, player.pos.x - 8, player.pos.y + 20);
  line(player.pos.x, player.pos.y + 10, player.pos.x + 8, player.pos.y + 20);

  // Draw boulder
  fill(100);
  circle(boulder.pos.x, boulder.pos.y, boulder.size);
}

function isPlayerNearBoulder() {
  let distance = dist(player.pos.x, player.pos.y, boulder.pos.x, boulder.pos.y);
  return distance < player.size + boulder.size;
}

function handlePushing() {
  // Only allow pushing if player is near boulder
  if (!isPlayerNearBoulder()) {
    return;
  }

  if (keyIsDown(RIGHT_ARROW)) {
    // Move boulder with player
    boulder.pos.x = player.pos.x + 30;
    boulder.pos.y = player.pos.y - 10;
    
    // Check if reached top
    if (boulder.pos.x >= slope.top.x - 50) {
      gameState = 'rolling';
      boulder.vel = createVector(0, 0);
    }
  }
  
  if (keyIsDown(LEFT_ARROW)) {
    // Keep boulder with player
    boulder.pos.x = player.pos.x + 30;
    boulder.pos.y = player.pos.y - 10;
  }
}
function handleRolling() {
  // Apply gravity along slope
  let gravityForce = gravity * sin(slope.angle);
  boulder.vel.x -= cos(slope.angle) * gravityForce;
  boulder.vel.y += sin(slope.angle) * gravityForce;
  
  // Update boulder position
  boulder.pos.x += boulder.vel.x;
  boulder.pos.y += boulder.vel.y;
  
  // Check if boulder reached bottom
  if (boulder.pos.x <= slope.base.x + 60) {
    boulder.pos.x = slope.base.x + 60;
    boulder.pos.y = slope.base.y - 40; // Adjust y position to match initial setup
    boulder.vel = createVector(0, 0);
    gameState = ''
  }
}

// Add this new function for drawing clouds
function drawCloud(x, y) {
  fill(255);
  noStroke();
  ellipse(x, y, 70, 50);
  ellipse(x + 30, y, 60, 40);
  ellipse(x - 30, y, 60, 40);
}