let t = 0; // time variable
let redColor;
let greenColor;
let blueColor;
let sizeSlider;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  redColor = createSlider(0, 255, 255);
  redColor.position(50,25);
  greenColor = createSlider(0, 255, 0);
  greenColor.position(50,50);
  blueColor = createSlider(0, 255, 0);
  blueColor.position(50,75);

  sizeSlider = createSlider(1, 50, 30);
  sizeSlider.position(50,125);
}


let x = 50

let y = 50

function draw() {
  background(0);

  noStroke();
  fill(redColor.value(),greenColor.value(),blueColor.value());

  stroke(255);

  for (let i = 1; i < windowWidth/ x; i++) {
    for (let j = 1; j < windowHeight/ y; j++) {

      const xAngle = map(mouseX, 0, width, -4 * PI, 4 * PI, true);
      const yAngle = map(mouseY, 0, height, -4 * PI, 4 * PI, true);
      // and also varies based on the particle's location
      const angle = xAngle * (i / width) + yAngle * (j / height);

      // each particle moves in a circle
      const myX = x + 20 * cos(2 * PI * t + angle);
      const myY = y + 20 * sin(2 * PI * t + angle);

      push();
      translate(i * x - windowWidth/2, j*x - windowHeight/2);
      rotateZ(1.25 + t/10);
      rotateY(myY);
      rotateX(myX);
      box(sizeSlider.value());
      pop();

    }
  }

  t += 1
}
