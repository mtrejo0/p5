// Rocket Evolution - genetic algorithm to reach the finish platform
const GRAVITY = 0.22;
const THRUST_POWER = 0.45;
const THRUST_HORIZONTAL = 0.28;
const GROUND_Y_OFFSET = 60;
const START_X_MIN = 50;
const START_X_MAX = 180;
const PLATFORM_WIDTH = 90;
const PLATFORM_HEIGHT = 55;
const GENOME_LENGTH = 350;
const POPULATION_SIZE = 42;
const MAX_FRAMES = 400;
const MUTATION_RATE = 0.08;
const ELITE_COUNT = 4;
const ROCKET_RADIUS = 8;

let population = [];
let generation = 1;
let topScoreEver = 0;
let currentRoundBest = 0;
let frameInRound = 0;
let roundDone = false;
let canvasWidth, canvasHeight;
let platformRect;
let obstacles;

function getPlatformRect() {
  const y = canvasHeight * 0.22;
  return {
    x: canvasWidth - PLATFORM_WIDTH,
    y: y,
    w: PLATFORM_WIDTH,
    h: PLATFORM_HEIGHT
  };
}

function getObstacles() {
  return [
    { x: canvasWidth * 0.30, y: canvasHeight * 0.42, w: 75, h: 140 },
    { x: canvasWidth * 0.55, y: canvasHeight * 0.32, w: 85, h: 120 }
  ];
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function pointHitsObstacle(px, py) {
  for (let ob of obstacles) {
    if (pointInRect(px, py, ob)) return true;
  }
  return false;
}

class Rocket {
  constructor(genome = null) {
    this.reset();
    if (genome) {
      this.genome = genome.map(g => g + (random() - 0.5) * 0.1);
      this.genome = this.genome.map(g => constrain(g, 0, 1));
    } else {
      this.genome = Array.from({ length: GENOME_LENGTH }, () => random());
    }
    this.sensitivity = 0.5 + random() * 0.5; // 0.5 to 1.0 thrust multiplier
  }

  reset() {
    this.x = START_X_MIN + random() * (START_X_MAX - START_X_MIN);
    this.y = canvasHeight - GROUND_Y_OFFSET;
    this.vx = 0;
    this.vy = 0;
    this.fitness = 0;
    this.finished = false;
    this.crashed = false;
    this.finishFrame = -1;
    this.bestX = this.x;
    this.bestY = this.y;
  }

  getThrust(frameIndex) {
    const i = frameIndex % this.genome.length;
    return this.genome[i] > 0.5;
  }

  update(frameIndex) {
    if (this.finished) return;
    this.vy += GRAVITY;
    if (this.getThrust(frameIndex)) {
      this.vy -= THRUST_POWER * this.sensitivity;
      this.vx += THRUST_HORIZONTAL * this.sensitivity;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.bestX = max(this.bestX, this.x);
    this.bestY = min(this.bestY, this.y);

    if (platformRect && this.x >= platformRect.x && this.y >= platformRect.y && this.y <= platformRect.y + platformRect.h) {
      this.finished = true;
      this.finishFrame = frameIndex;
    }
    if (obstacles && pointHitsObstacle(this.x, this.y)) {
      this.finished = true;
      this.crashed = true;
    }
    if (this.y >= canvasHeight - 10 || this.x >= canvasWidth + 20) {
      this.finished = true;
    }
  }

  computeFitness() {
    if (this.crashed) {
      this.fitness = -100;
      return this.fitness;
    }
    if (this.finishFrame >= 0) {
      const speedBonus = 1 + (MAX_FRAMES - this.finishFrame) / MAX_FRAMES;
      this.fitness = 1000 * speedBonus;
    } else {
      const startX = (START_X_MIN + START_X_MAX) / 2;
      const targetX = platformRect ? platformRect.x : canvasWidth - PLATFORM_WIDTH;
      const progress = (this.bestX - startX) / max(1, targetX - startX);
      this.fitness = progress * 500;
    }
    return this.fitness;
  }

  display(alpha = 255) {
    push();
    translate(this.x, this.y);
    const angle = atan2(this.vx, -this.vy);
    rotate(angle);
    fill(255, 180, 80, alpha);
    stroke(255, 220, 150, alpha);
    strokeWeight(2);
    if (this.getThrust(frameInRound)) {
      fill(255, 120, 40, alpha);
      triangle(-6, 12, 0, 22, 6, 12);
    }
    ellipse(0, 0, 14, 24);
    pop();
  }
}

function createInitialPopulation() {
  population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(new Rocket());
  }
}

function crossover(a, b) {
  if (!a || !b || !Array.isArray(a) || !Array.isArray(b)) {
    return Array.from({ length: GENOME_LENGTH }, () => random());
  }
  const child = [];
  for (let i = 0; i < GENOME_LENGTH; i++) {
    child.push(random() < 0.5 ? a[i] : b[i]);
  }
  return child;
}

function mutate(genome) {
  return genome.map(g =>
    random() < MUTATION_RATE ? random() : g
  );
}

function nextGeneration() {
  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const best = sorted[0];
  if (best.fitness > topScoreEver) topScoreEver = best.fitness;
  currentRoundBest = best.fitness;

  const newPop = [];
  for (let i = 0; i < ELITE_COUNT; i++) {
    const r = new Rocket(sorted[i].genome);
    r.reset();
    newPop.push(r);
  }
  while (newPop.length < POPULATION_SIZE) {
    const i = floor(random() * (POPULATION_SIZE / 2));
    const j = floor(random() * (POPULATION_SIZE / 2));
    if (i === j) continue;
    const childGenome = mutate(crossover(sorted[i].genome, sorted[j].genome));
    const r = new Rocket(childGenome);
    r.reset();
    newPop.push(r);
  }
  population = newPop;
  generation++;
  frameInRound = 0;
  roundDone = false;
}

function setup() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  createCanvas(canvasWidth, canvasHeight);
  createInitialPopulation();
}

function windowResized() {
  canvasWidth = windowWidth;
  canvasHeight = windowHeight;
  resizeCanvas(canvasWidth, canvasHeight);
  for (let r of population) r.reset();
}

function draw() {
  background(18, 18, 28);
  platformRect = getPlatformRect();
  obstacles = getObstacles();

  if (roundDone) {
    nextGeneration();
    return;
  }

  frameInRound++;
  let allDone = true;

  for (let r of population) {
    r.update(frameInRound);
    if (!r.finished) allDone = false;
  }

  const startX = (START_X_MIN + START_X_MAX) / 2;
  const targetX = platformRect.x;

  if (allDone || frameInRound >= MAX_FRAMES) {
    for (let r of population) r.computeFitness();
    const bestThisRound = max(...population.map(r => r.fitness));
    currentRoundBest = bestThisRound;
    if (bestThisRound > topScoreEver) topScoreEver = bestThisRound;
    roundDone = true;
  } else {
    let liveBest = 0;
    for (let r of population) {
      if (r.finishFrame >= 0) liveBest = max(liveBest, 1000 * (1 + (MAX_FRAMES - r.finishFrame) / MAX_FRAMES));
      else if (!r.crashed) {
        const progress = (r.bestX - startX) / max(1, targetX - startX);
        liveBest = max(liveBest, progress * 500);
      }
    }
    currentRoundBest = liveBest;
  }

  // Obstacles
  fill(120, 80, 100);
  stroke(160, 100, 130);
  strokeWeight(2);
  for (let ob of obstacles) {
    rect(ob.x, ob.y, ob.w, ob.h);
  }
  noStroke();

  // Finish platform (right)
  fill(80, 200, 120);
  stroke(100, 255, 140);
  strokeWeight(2);
  rect(platformRect.x, platformRect.y, platformRect.w, platformRect.h);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);
  text("FINISH", platformRect.x + platformRect.w / 2, platformRect.y + platformRect.h / 2);

  // Ground
  fill(60, 55, 70);
  rect(0, canvasHeight - GROUND_Y_OFFSET, canvasWidth, GROUND_Y_OFFSET);
  stroke(80, 75, 90);
  strokeWeight(1);
  line(0, canvasHeight - GROUND_Y_OFFSET, canvasWidth, canvasHeight - GROUND_Y_OFFSET);

  // Rockets
  const sortedByY = [...population].sort((a, b) => a.y - b.y);
  for (let i = 0; i < sortedByY.length; i++) {
    const alpha = 255 - (i * 200) / population.length;
    sortedByY[i].display(alpha);
  }

  // UI - top right
  const uiX = canvasWidth - 20;
  push();
  textAlign(RIGHT, TOP);
  textSize(16);
  fill(255);
  noStroke();
  text("Generation: " + generation, uiX, 18);
  text("Best (all time): " + nf(topScoreEver, 0, 1), uiX, 42);
  text("Best (this round): " + nf(currentRoundBest, 0, 1), uiX, 66);
  pop();
}
