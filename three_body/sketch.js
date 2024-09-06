let bodies = [];
let G = 0.8; // Gravitational constant

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create three bodies with random positions, velocities, and colors
  bodies.push(new Body(width / 2, height / 2, 20, color(255, 0, 0), createVector(random(-2, 2), random(-2, 2))));
  bodies.push(new Body(width / 2 + 150, height / 2, 20, color(0, 0, 255), createVector(random(-2, 2), random(-2, 2))));
  bodies.push(new Body(width / 2 - 150, height / 2, 20, color(255, 255, 0), createVector(random(-2, 2), random(-2, 2))));
}

function draw() {
  background(0);
  
  // Update and display each body
  for (let body of bodies) {
    body.update(bodies);
    body.display();
  }
}

class Body {
  constructor(x, y, mass, col, vel) {
    this.pos = createVector(x, y);
    this.vel = vel;
    this.mass = mass;
    this.col = col;
    this.history = []; // Array to store the previous positions
  }

  update(bodies) {
    for (let other of bodies) {
      if (other !== this) {
        let force = p5.Vector.sub(other.pos, this.pos);
        let distanceSq = constrain(force.magSq(), 25, 500); // Avoid extreme distances
        let strength = (G * this.mass * other.mass) / distanceSq;
        force.setMag(strength);
        this.vel.add(force.mult(1 / this.mass));
      }
    }
    this.pos.add(this.vel);
    
    // Store the current position in history
    this.history.push(this.pos.copy());
    // Limit the history length to avoid excessive memory usage
    if (this.history.length > 500) {
      this.history.shift();
    }
  }

  display() {
    fill(this.col);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.mass * 2);
    
    // Draw the tail
    stroke(this.col);
    strokeWeight(4);
    for (let i = 0; i < this.history.length - 1; i++) {
      line(this.history[i].x, this.history[i].y, this.history[i + 1].x, this.history[i + 1].y);
    }
  }
}