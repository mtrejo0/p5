let pendulums = [];
const numPendulums = 20;
const baseLength = 500; // Base length of the first pendulum
const lengthMultiplier = 0.9; // Length multiplier for the subsequent pendulums

function setup() {
  createCanvas(windowWidth, windowHeight);

  const startX = width / 2;
  const startY = height / 2;

  let length = baseLength;
  for (let i = 0; i < numPendulums; i++) {
    const angle = PI / 4; // Starting angle at 90 degrees
    const x = startX;
    const y = 100; // Stack the pendulums on top of each other
    pendulums.push(new Pendulum(x, y, length, angle));

    length *= lengthMultiplier; // Calculate length based on the multiplier
  }
}

function draw() {
  background(0);

  for (let i = 0; i < pendulums.length; i++) {
    const hue = map(i, 0, pendulums.length - 1, 0, 360); // Rainbow colors
    pendulums[i].display(hue);
    pendulums[i].update();
  }
}

class Pendulum {
  constructor(x, y, length, angle) {
    this.origin = createVector(x, y);
    this.position = createVector();
    this.angle = angle;
    this.length = length;
    this.gravity = 0.5;
    this.velocity = 0;
    this.damping = 1;
  }

  update() {
    const angularAcceleration =
      (-this.gravity / this.length) * sin(this.angle);
    this.velocity += angularAcceleration;
    this.velocity *= this.damping;
    this.angle += this.velocity;

    const x = this.origin.x + this.length * sin(this.angle);
    const y = this.origin.y + this.length * cos(this.angle);
    this.position.set(x, y);
  }

  display(hue) {
    colorMode(HSB);
    stroke(hue, 100, 100);
    fill(hue, 100, 100);
    line(this.origin.x, this.origin.y, this.position.x, this.position.y);
    ellipse(this.position.x, this.position.y, 20, 20);
    colorMode(RGB);
  }
}
