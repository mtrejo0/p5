let rotX = 0;
let rotY = 0;

const CYL_RADIUS = 86;
const CYL_HEIGHT = 2400;
const NUM_SPIRALS = 8;
const SPIRAL_TWISTS = 1.5;
const SPIRAL_STEPS = 80;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(0);

  rotateX(rotX);
  rotateY(rotY);

  let hexRadius = 182;

  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i - HALF_PI;
    let x = cos(angle) * hexRadius;
    let y = sin(angle) * hexRadius;

    push();
    translate(x, y, 0);
    rotateX(HALF_PI);

    fill(0);
    noStroke();
    cylinder(85, CYL_HEIGHT);

    let spin = frameCount * 0.005 + i * TWO_PI / 6;

    stroke(120, 0, 0);
    strokeWeight(13.5);
    noFill();

    for (let s = 0; s < NUM_SPIRALS; s++) {
      let offset = (s / NUM_SPIRALS) * TWO_PI;
      beginShape();
      for (let j = 0; j <= SPIRAL_STEPS; j++) {
        let t = j / SPIRAL_STEPS;
        let h = -CYL_HEIGHT / 2 + t * CYL_HEIGHT;
        let a = offset + t * TWO_PI * SPIRAL_TWISTS + spin;
        let sx = cos(a) * CYL_RADIUS;
        let sz = sin(a) * CYL_RADIUS;
        vertex(sx, h, sz);
      }
      endShape();
    }

    for (let s = 0; s < NUM_SPIRALS; s++) {
      let offset = (s / NUM_SPIRALS) * TWO_PI;
      beginShape();
      for (let j = 0; j <= SPIRAL_STEPS; j++) {
        let t = j / SPIRAL_STEPS;
        let h = -CYL_HEIGHT / 2 + t * CYL_HEIGHT;
        let a = offset - t * TWO_PI * SPIRAL_TWISTS + spin;
        let sx = cos(a) * CYL_RADIUS;
        let sz = sin(a) * CYL_RADIUS;
        vertex(sx, h, sz);
      }
      endShape();
    }

    pop();
  }
}

function mouseDragged() {
  rotY += (mouseX - pmouseX) * 0.005;
  rotX += (mouseY - pmouseY) * 0.005;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
