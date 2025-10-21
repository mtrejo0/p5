// Arrow Grid pointing to mouse, colored by distance

let gridSpacing = 48;
let cols, rows;
let spacingSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 1);
  noCursor();
  
  // Create slider for grid spacing
  spacingSlider = createSlider(20, 100, 48, 1);
  spacingSlider.position(20, 20);
  spacingSlider.style('width', '200px');
  
  updateGrid();
}

function updateGrid() {
  gridSpacing = spacingSlider.value();
  cols = floor(width / gridSpacing);
  rows = floor(height / gridSpacing);
}

function draw() {
  background(0);
  
  // Update grid if slider changed
  updateGrid();

  // Mouse position (clamp to canvas)
  let mx = constrain(mouseX, 0, width);
  let my = constrain(mouseY, 0, height);

  // Precompute maximum distance for color mapping
  let maxDist = dist(0, 0, width, height);

  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      let x = i * gridSpacing + gridSpacing/2;
      let y = j * gridSpacing + gridSpacing/2;

      // Direction from grid cell to mouse
      let angle = atan2(my - y, mx - x);

      // Distance for color interpolation (red = near, blue = far)
      let d = dist(mx, my, x, y);
      let t = constrain(1 - d / (0.65*maxDist), 0, 1);

      // Map t from red to blue: 0 = blue, 1 = red in HSB
      // Red = 0, Blue = roughly 2/3
      let hue = lerp(2/3, 0, t);

      // Draw arrow
      push();
      translate(x, y);
      rotate(angle);
      stroke(hue, 1, 1);
      fill(hue, 1, 1);
      drawArrow(0, 0, gridSpacing*0.65, 8);
      pop();
    }
  }
  
  // Display slider label
  fill(1, 0, 1);
  noStroke();
  textSize(14);
  text(`Grid Spacing: ${gridSpacing}`, 20, 55);
}

function drawArrow(x, y, len, w) {
  // Shaft
  strokeWeight(2.2);
  line(x, y, x+len-w, y);

  // Arrow head
  push();
  translate(x+len-w, y);
  beginShape();
  vertex(0, 0);
  vertex(-w, w*0.75);
  vertex(w*0.23, 0);
  vertex(-w, -w*0.75);
  vertex(0, 0);
  endShape(CLOSE);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateGrid();
}
