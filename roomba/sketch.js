let x, y; // Position variables
let angle; // Angle of motion
let stepSize; // Distance to move in each step
let path; // Array to store the path
let buffer = 50;
let color = 0

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);

  x = windowWidth / 2;
  y = windowHeight / 2;
  angle = random(TWO_PI); // Random initial direction
  stepSize = 20;
  path = [];
  colorMode(HSB, 255); // Switch to HSV color mode
}

function draw() {
  background(0)

  push()
  fill(255)
  strokeWeight(0)
  rect(0,0,buffer, windowHeight)
  rect(0,0,windowWidth, buffer)
  rect(0,windowHeight-buffer,windowWidth, windowHeight)
  rect(windowWidth-buffer,0,windowWidth, windowHeight)

  pop()

  color = (color+1)%255

  stroke(color,255, 255)


  // Move in the current direction
  let dx = cos(angle) * stepSize;
  let dy = sin(angle) * stepSize;
  x += dx;
  y += dy;

  // Store the current position in the path array
  path.push(createVector(x, y));

  // Display the path
  noFill();
  strokeWeight(10)
  // stroke(0);
  beginShape();
  for (let i = 0; i < path.length; i++) {
    vertex(path[i].x, path[i].y);
  }
  endShape();

  stroke(255)
  ellipse(x,y,10)

  // Check if Roomba reaches the canvas boundaries
  if (x < buffer || x > windowWidth - buffer|| y < buffer || y > windowHeight-buffer) {

    x -= 2*dx;
    y -= 2*dy;
    // Change direction randomly
    angle = - angle - PI + random(PI);
  }
}

