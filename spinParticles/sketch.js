let t = 0; // time variable
let redColor;
let greenColor;
let blueColor;
let sizeSlider;
function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  redColor = createSlider(0, 255, 255);
  redColor.position(50,25);
  greenColor = createSlider(0, 255, 30);
  greenColor.position(50,50);
  blueColor = createSlider(0, 255, 203);
  blueColor.position(50,75);

  sizeSlider = createSlider(1, 30, 20);
  sizeSlider.position(50,125);
}

function draw() {
  background(10, 10); // translucent background (creates trails)



  fill(redColor.value(),greenColor.value(),blueColor.value());
  // make a x and y grid of ellipses
  for (let x = 0; x <= width; x = x + 30) {
    for (let y = 0; y <= height; y = y + 30) {
      // starting point of each circle depends on mouse position
      const xAngle = map(mouseX, 0, width, -4 * PI, 4 * PI, true);
      const yAngle = map(mouseY, 0, height, -4 * PI, 4 * PI, true);
      // and also varies based on the particle's location
      const angle = xAngle * (x / width) + yAngle * (y / height);

      // each particle moves in a circle
      const myX = x + 20 * cos(2 * PI * t + angle);
      const myY = y + 20 * sin(2 * PI * t + angle);

      ellipse(myX, myY, sizeSlider.value()); // draw particle
    }
  }

  t = t + 0.01; // update time
  fill("white")
  text("Red",10,30)
  text("Blue",10,80)
  text("Green",10,55)
  text("Size",10,130)
}
