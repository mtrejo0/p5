const PARTICLE_COUNT = 15000;
const FRICTION = 0.96;
const PULSE_FORCE = 8;
const PULSE_RADIUS = 200;
const DRAG_FORCE = 2;
const DRAG_RADIUS = 80;
const REPEL_RADIUS = 20;
const REPEL_FORCE = 1.5;
const CELL_SIZE = REPEL_RADIUS;

let particles = [];
let grid = {};
let cols, rows;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  let spacing = sqrt((width * height) / PARTICLE_COUNT);
  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      particles.push({
        x: x + random(-spacing * 0.3, spacing * 0.3),
        y: y + random(-spacing * 0.3, spacing * 0.3),
        vx: 0,
        vy: 0,
      });
    }
  }
}

function buildGrid() {
  grid = {};
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let cx = Math.floor(p.x / CELL_SIZE);
    let cy = Math.floor(p.y / CELL_SIZE);
    let key = cx + ',' + cy;
    if (!grid[key]) grid[key] = [];
    grid[key].push(i);
  }
}

function getNeighbors(p) {
  let cx = Math.floor(p.x / CELL_SIZE);
  let cy = Math.floor(p.y / CELL_SIZE);
  let result = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      let key = (cx + dx) + ',' + (cy + dy);
      if (grid[key]) {
        for (let idx of grid[key]) result.push(idx);
      }
    }
  }
  return result;
}

function draw() {
  background(0);

  buildGrid();

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let neighbors = getNeighbors(p);
    for (let j of neighbors) {
      if (j <= i) continue;
      let q = particles[j];
      let dx = p.x - q.x;
      let dy = p.y - q.y;
      let distSq = dx * dx + dy * dy;
      if (distSq < REPEL_RADIUS * REPEL_RADIUS && distSq > 0.01) {
        let dist = Math.sqrt(distSq);
        let force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
        let nx = dx / dist;
        let ny = dy / dist;
        p.vx += nx * force;
        p.vy += ny * force;
        q.vx -= nx * force;
        q.vy -= ny * force;
      }
    }
  }

  if (mouseIsPressed) {
    let dx = mouseX - pmouseX;
    let dy = mouseY - pmouseY;
    let mouseSpeed = sqrt(dx * dx + dy * dy);

    for (let p of particles) {
      let distX = p.x - mouseX;
      let distY = p.y - mouseY;
      let dist = sqrt(distX * distX + distY * distY);

      if (dist < DRAG_RADIUS && dist > 0) {
        let strength = (1 - dist / DRAG_RADIUS) * DRAG_FORCE;
        let pushX = distX / dist;
        let pushY = distY / dist;

        p.vx += pushX * strength * (1 + mouseSpeed * 0.1);
        p.vy += pushY * strength * (1 + mouseSpeed * 0.1);

        p.vx += dx * strength * 0.3;
        p.vy += dy * strength * 0.3;
      }
    }
  }

  for (let p of particles) {
    p.vx *= FRICTION;
    p.vy *= FRICTION;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) { p.x = 0; p.vx *= -1; }
    if (p.x > width) { p.x = width; p.vx *= -1; }
    if (p.y < 0) { p.y = 0; p.vy *= -1; }
    if (p.y > height) { p.y = height; p.vy *= -1; }

    let alpha = map(abs(p.vx) + abs(p.vy), 0, 5, 180, 255, true);
    fill(60, 140, 255, alpha);
    circle(p.x, p.y, 3.5);
  }
}

function mousePressed() {
  for (let p of particles) {
    let dx = p.x - mouseX;
    let dy = p.y - mouseY;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist < PULSE_RADIUS && dist > 0) {
      let strength = (1 - dist / PULSE_RADIUS) * PULSE_FORCE;
      p.vx += (dx / dist) * strength;
      p.vy += (dy / dist) * strength;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
