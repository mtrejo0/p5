let entities = [];
const ENTITY_SIZE = 35;
const NUM_EACH = 20;
const TYPES = ['rock', 'paper', 'scissors'];
const EMOJIS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
};
const COLORS = {
  rock: [150, 150, 150],
  paper: [100, 150, 255],
  scissors: [255, 100, 100]
};

let history = [];
const SIDEBAR_WIDTH = 150;
const MAIN_WIDTH = 800;
const MAIN_HEIGHT = 800;
const GRAPH_HEIGHT = 200;

class Entity {
  constructor(x, y, type) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-2, 2), random(-2, 2));
    this.type = type;
    this.size = ENTITY_SIZE;
  }

  update() {
    this.pos.add(this.vel);
    
    // Bounce off walls (only within main simulation area)
    if (this.pos.x - this.size/2 < 0 || this.pos.x + this.size/2 > width) {
      this.vel.x *= -1;
      this.pos.x = constrain(this.pos.x, this.size/2, width - this.size/2);
    }
    if (this.pos.y - this.size/2 < 0 || this.pos.y + this.size/2 > MAIN_HEIGHT) {
      this.vel.y *= -1;
      this.pos.y = constrain(this.pos.y, this.size/2, MAIN_HEIGHT - this.size/2);
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    textAlign(CENTER, CENTER);
    textSize(this.size);
    text(EMOJIS[this.type], 0, 0);
    pop();
  }

  checkCollision(other) {
    let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
    return d < this.size;
  }

  bounce(other) {
    // Simple elastic collision
    let tempVel = this.vel.copy();
    let angle = atan2(other.pos.y - this.pos.y, other.pos.x - this.pos.x);
    
    // Move them apart so they don't stick
    let overlap = this.size - dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
    if (overlap > 0) {
      this.pos.x -= cos(angle) * overlap / 2;
      this.pos.y -= sin(angle) * overlap / 2;
      other.pos.x += cos(angle) * overlap / 2;
      other.pos.y += sin(angle) * overlap / 2;
    }
    
    // Exchange velocities for simplicity
    this.vel = other.vel.copy();
    other.vel = tempVel;
  }

  convertOther(other) {
    if (this.type === other.type) return false;
    
    // Rock beats scissors
    if (this.type === 'rock' && other.type === 'scissors') {
      other.type = 'rock';
      return true;
    }
    // Paper beats rock
    if (this.type === 'paper' && other.type === 'rock') {
      other.type = 'paper';
      return true;
    }
    // Scissors beats paper
    if (this.type === 'scissors' && other.type === 'paper') {
      other.type = 'scissors';
      return true;
    }
    
    return false;
  }
}

function setup() {
  createCanvas(800, MAIN_HEIGHT + GRAPH_HEIGHT);
  
  // Create entities in a grid pattern to avoid overlap
  let gridSize = ceil(sqrt(NUM_EACH * 3));
  let spacing = MAIN_HEIGHT / (gridSize + 1);
  
  let positions = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      positions.push({
        x: (i + 1) * spacing,
        y: (j + 1) * spacing
      });
    }
  }
  
  // Shuffle positions
  shuffle(positions, true);
  
  // Create 20 of each type
  let index = 0;
  for (let type of TYPES) {
    for (let i = 0; i < NUM_EACH; i++) {
      let pos = positions[index++];
      entities.push(new Entity(pos.x, pos.y, type));
    }
  }
}

function draw() {
  background(30, 30, 40);
  
  // Update and display all entities
  for (let entity of entities) {
    entity.update();
    entity.display();
  }
  
  // Check collisions
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      if (entities[i].checkCollision(entities[j])) {
        entities[i].bounce(entities[j]);
        
        // Apply rock-paper-scissors rules
        entities[i].convertOther(entities[j]);
        entities[j].convertOther(entities[i]);
      }
    }
  }
  
  // Record history every 5 frames
  if (frameCount % 5 === 0) {
    let counts = getCounts();
    let total = entities.length;
    history.push({
      rock: counts.rock / total,
      paper: counts.paper / total,
      scissors: counts.scissors / total
    });
    
    // Keep only last 160 data points (fits graph width)
    if (history.length > 160) {
      history.shift();
    }
  }
  
  // Display counts and graph
  displayCounts();
  displayGraph();
}

function getCounts() {
  let counts = {
    rock: 0,
    paper: 0,
    scissors: 0
  };
  
  for (let entity of entities) {
    counts[entity.type]++;
  }
  
  return counts;
}

function displayCounts() {
  let counts = getCounts();
  
  push();
  textAlign(LEFT, TOP);
  textSize(20);
  fill(255);
  noStroke();
  
  let y = 50;
  text(`🪨 Rock: ${counts.rock}`, 20, y);
  y += 30;
  text(`📄 Paper: ${counts.paper}`, 20, y);
  y += 30;
  text(`✂️ Scissors: ${counts.scissors}`, 20, y);
  pop();
}

function displayGraph() {
  if (history.length < 2) return;
  
  push();
  let graphY = MAIN_HEIGHT;
  let graphW = width;
  let graphH = GRAPH_HEIGHT;
  
  // Draw graph background
  fill(20, 20, 30);
  noStroke();
  rect(0, graphY, graphW, graphH);
  
  // Draw grid lines
  stroke(50, 50, 60);
  strokeWeight(1);
  for (let i = 0; i <= 4; i++) {
    let y = graphY + (i * graphH / 4);
    line(0, y, graphW, y);
  }
  
  // Draw percentage lines for each type
  noFill();
  strokeWeight(2);
  
  for (let type of TYPES) {
    stroke(COLORS[type][0], COLORS[type][1], COLORS[type][2]);
    beginShape();
    for (let i = 0; i < history.length; i++) {
      let x = map(i, 0, 159, 0, graphW);
      let y = graphY + graphH - (history[i][type] * graphH);
      vertex(x, y);
    }
    endShape();
  }
  
  // Draw percentage labels
  fill(255);
  noStroke();
  textSize(12);
  textAlign(RIGHT, CENTER);
  for (let i = 0; i <= 4; i++) {
    let percent = (1 - i / 4) * 100;
    let y = graphY + (i * graphH / 4);
    text(percent.toFixed(0) + '%', graphW - 5, y);
  }
  
  pop();
}

