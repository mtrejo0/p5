const NEON_COLORS = [
  '#ff00ff', '#00ffff', '#ff0066', '#66ff00',
  '#ff3300', '#00ff99', '#ff9900', '#9900ff',
  '#00ccff', '#ff0099', '#33ff00', '#ffff00',
];
const DOT_SIZE = 6;
const SPEED = 0.015;
const NUM_STARS = 20;

let stars = [];
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < NUM_STARS; i++) {
    let n = floor(random(5, 9));
    let k = n === 8 ? 3 : 2;
    stars.push({
      n: n,
      k: k,
      radius: random(40, 120),
      x: random(150, width - 150),
      y: random(150, height - 150),
      vx: random(-10, 10) || 6,
      vy: random(-10, 10) || 6,
      col: random(NEON_COLORS),
    });
  }
}

function draw() {
  background(10);
  t += SPEED;

  for (let s of stars) {
    s.x += s.vx;
    s.y += s.vy;

    if (s.x - s.radius < 0 || s.x + s.radius > width) s.vx *= -1;
    if (s.y - s.radius < 0 || s.y + s.radius > height) s.vy *= -1;

    s.x = constrain(s.x, s.radius, width - s.radius);
    s.y = constrain(s.y, s.radius, height - s.radius);

    drawStar(s);
  }
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  let ti = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  return { x: x1 + ti * (x2 - x1), y: y1 + ti * (y2 - y1) };
}

function drawStar(s) {
  let outerVerts = [];
  for (let i = 0; i < s.n; i++) {
    let angle = -HALF_PI + (TWO_PI / s.n) * i;
    outerVerts.push({ x: s.x + cos(angle) * s.radius, y: s.y + sin(angle) * s.radius });
  }

  let outline = [];
  for (let i = 0; i < s.n; i++) {
    outline.push(outerVerts[i]);

    let a = outerVerts[i];
    let b = outerVerts[(i + s.k) % s.n];
    let c = outerVerts[((i + 1) - s.k + s.n) % s.n];
    let d = outerVerts[(i + 1) % s.n];
    let inner = lineIntersect(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
    outline.push(inner);
  }

  let totalPoints = outline.length;
  let numDots = s.n * 2;

  noStroke();
  fill(s.col);

  for (let i = 0; i < numDots; i++) {
    let pos = (i / numDots * totalPoints + t * totalPoints) % totalPoints;
    let seg = floor(pos);
    let frac = pos - seg;

    let from = outline[seg];
    let to = outline[(seg + 1) % totalPoints];

    let px = lerp(from.x, to.x, frac);
    let py = lerp(from.y, to.y, frac);

    circle(px, py, DOT_SIZE);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
