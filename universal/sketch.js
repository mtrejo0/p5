let stars = []
let img;
let eyesEmoji;

function preload() {
  img = loadImage('nature.jpeg'); // Replace with the path to your image
  eyesEmoji = loadImage('eye.png'); // Load eyes emoji
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // generate stars
  for (let i = 0; i < 300; i++) {
    stars.push({x: Math.random() * windowWidth, y: Math.random() * windowHeight, r: Math.random() * 5})
  }
}

function drawSpace() {
  fill(255)
  background(0)
  stars.forEach(star => {
    ellipse(star.x, star.y, star.r)
  });
}

function draw() {
  // Draw the image as the background
  background(img);

  // drawSpace();

  // Draw a triangle based on the mouse position
  let centerX = windowWidth / 2;
  let centerY = windowHeight / 2;
  let angle = atan2(mouseY - centerY, mouseX - centerX);
  let adjacentX = centerX + cos(angle - PI / 9) * 2* windowHeight; // Extend the triangle from center
  let adjacentY = centerY + sin(angle - PI / 9) * 2*windowHeight;
  let adjacentX2 = centerX + cos(angle + PI / 9) * 2*windowHeight; // Extend the triangle from center
  let adjacentY2 = centerY + sin(angle + PI / 9) * 2*windowHeight;

  // Create a mask to cover the rest of the screen minus the triangle
  let mask = createGraphics(windowWidth, windowHeight);
  mask.background(0);
  stars.forEach(star => {
    mask.ellipse(star.x, star.y, star.r);
  });
  mask.erase();
  mask.triangle(centerX, centerY, adjacentX, adjacentY, adjacentX2, adjacentY2);
  
  mask.noErase();
  image(mask, 0, 0);

  // Draw a smaller eyes emoji opposite of the mask radially
  let oppositeAngle = angle + PI;
  let emojiX = centerX + cos(oppositeAngle) * 50;
  let emojiY = centerY + sin(oppositeAngle) * 50;
  let scale = 0.1; // Scaling factor for the emoji size
  image(eyesEmoji, emojiX - (eyesEmoji.width * scale) / 2, emojiY - (eyesEmoji.height * scale) / 2, eyesEmoji.width * scale, eyesEmoji.height * scale);

  // triangle(centerX, centerY, adjacentX, adjacentY, adjacentX2, adjacentY2)
}