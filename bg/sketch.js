let lines = [];
let spacing = 30; // Spacing between lines
let angle = -45; // Rotation angle in degrees
let zigzagAmplitude = 20; // Amplitude of the zigzag
let zigzagFrequency = .01; // Frequency of the zigzag

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  
  // Create rotated lines to cover the whole screen
  let diagonal = sqrt(width * width + height * height);
  for (let d = -diagonal; d < diagonal; d += spacing) {
    lines.push(d);
  }

  // Create save button
  let saveButton = createButton('Save Canvas');
  saveButton.position(10, 10);
  saveButton.mousePressed(saveCanvas);
}

function draw() {
  background(255);
  
  // Draw rotated smooth wavy lines
  stroke(200);
  strokeWeight(.5);
  
  push();
  translate(width / 2, height / 2);
  rotate(radians(angle));
  for (let d of lines) {
    beginShape();
    noFill();
    for (let x = -width; x <= width; x += 5) {
      let y = d + sin(x * zigzagFrequency) * zigzagAmplitude;
      curveVertex(x, y);
    }
    endShape();
  }
  pop();
}

function saveCanvas() {
  save('smoothWavyLinesCanvas.jpg');
}