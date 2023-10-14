let numSidesSlider;
let radiusSlider;
let offsetSlider;
let colorSlider;
let backgroundSlider;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  
  numSidesSlider = createSlider(3, 12, 5, 1);
  numSidesSlider.position(20, 20);
  numSidesSlider.input(update);

  radiusSlider = createSlider(3, 30, 5, 1);
  radiusSlider.position(20, 50);
  radiusSlider.input(update);

  offsetSlider = createSlider(10, 100, 50, 1);
  offsetSlider.position(20, 80);
  offsetSlider.input(update);
  
  colorSlider = createSlider(0, 100, 0, 1); // 0 corresponds to white
  colorSlider.position(20, 110);
  colorSlider.input(update);

  backgroundSlider = createSlider(0, 100, 0, 1); // 0 corresponds to white
  backgroundSlider.position(20, 140);
  backgroundSlider.input(update);

  colorMode(HSB, 100); // Set the color mode to HSV

  
}

function update() {
  redraw();
}

function draw() {
  background(255);

  let backgroundColor = backgroundSlider.value()
  let backgroundHue = map(backgroundColor, 0, 100, 0, 100);

  if (backgroundColor == 0) {background(255)}
  else if (backgroundColor == 100) {background(0)}
  else background(backgroundHue, 100, 100);

  

  let radiusScale = radiusSlider.value();
  let numSides = numSidesSlider.value();
  let offset = offsetSlider.value();
  let colorValue = colorSlider.value();
  let centerX = windowWidth / 2;
  let centerY = windowHeight / 2;

  // Calculate the angle between each vertex
  let angle = TWO_PI / numSides;
  let startAngle = -PI / 2; // 90 degrees

  for (let j = radiusScale; j > 0; j--) {
    let radius = offset * j;
    
    // Map the color slider value to an HSB color
    let hue = map(colorValue, 0, 100, 0, 100);

    if (colorValue == 0) fill(255);
    else if (colorValue == 100) {fill(hue, Math.random() * 20, Math.random() * 20)}
    else fill(hue, 100 - Math.random() * 10, 100- Math.random() * 10);
    
    beginShape();
    for (let i = 0; i < numSides; i++) {
      let x = centerX + radius * cos(i * angle + startAngle);
      let y = centerY + radius * sin(i * angle + startAngle);
      vertex(x, y);
    }
    endShape(CLOSE);
  }
}
