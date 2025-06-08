let circles = [];
let colorIndex = 0;
const rainbowColors = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3'  // Violet
];

let frequencySlider;
let growthSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  
  // Create sliders
  frequencySlider = createSlider(1, 120, 30);
  frequencySlider.position(20, 20);
  frequencySlider.style('width', '200px');
  
  growthSlider = createSlider(1.001, 1.1, 1.05, 0.001);
  growthSlider.position(20, 60);
  growthSlider.style('width', '200px');
}

function draw() {
  background(0);
  
  // Add new circle based on slider frequency
  if (frameCount % frequencySlider.value() === 0) {
    circles.push(new Circle());
  }
  
  // Sort circles by radius (biggest first)
  circles.sort((a, b) => b.radius - a.radius);
  
  // Update and draw all circles
  for (let i = 0; i < circles.length; i++) {
    circles[i].update();
    circles[i].display();
    
    // Remove circles that are too big
    if (circles[i].radius > max(windowWidth, windowHeight) * 2) {
      circles.splice(i, 1);
      i--; // Adjust index after removal
    }
  }
  
  // Display slider labels
  fill(255);
  textSize(14);
  text(`Frequency: ${frequencySlider.value()} frames`, 20, 15);
  text(`Growth Speed: ${growthSlider.value().toFixed(3)}`, 20, 55);
}

class Circle {
  constructor() {
    this.x = windowWidth / 2;
    this.y = windowHeight / 2;
    this.radius = 1;
    this.color = rainbowColors[colorIndex % rainbowColors.length];
    colorIndex++;
  }
  
  update() {
    // Growth speed controlled by slider
    this.radius *= growthSlider.value();
  }
  
  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
