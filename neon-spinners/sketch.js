const TOTAL_LINES = 30;
const TRAIL_LENGTH = 10;
const NEON_COLORS = [
  '#ff00ff', '#00ffff', '#ff0066', '#66ff00',
  '#ff3300', '#00ff99', '#ff9900', '#9900ff',
  '#00ccff', '#ff0099', '#33ff00', '#ffff00',
];

let lines = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < TOTAL_LINES; i++) {
    lines.push(makeLine());
  }
}

function makeLine() {
  return {
    x: random(width),
    y: random(height),
    angle: random(TWO_PI),
    speed: random(-0.03, 0.03) || 0.01,
    col: random(NEON_COLORS),
    len: width * 2,
    trail: [],
  };
}

function draw() {
  background(0);

  for (let l of lines) {
    l.trail.push({ x: l.x, y: l.y, angle: l.angle });
    if (l.trail.length > TRAIL_LENGTH) {
      l.trail.shift();
    }

    for (let t = 0; t < l.trail.length; t++) {
      let alpha = map(t, 0, l.trail.length - 1, 30, 255);
      let c = color(l.col);
      c.setAlpha(alpha);

      push();
      translate(l.trail[t].x, l.trail[t].y);
      rotate(l.trail[t].angle);
      stroke(c);
      strokeWeight(2);
      line(-l.len / 2, 0, l.len / 2, 0);
      pop();
    }

    l.angle += l.speed;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let l of lines) {
    l.len = width * 2;
  }
}
