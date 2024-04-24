// Firework particles array
let fireworks = [];
// Sliders for user input
let frequencySlider, sizeSlider, colorSlider, colorSlider2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  
  // Create sliders
  frequencySlider = createSlider(1, 10, 5);
  frequencySlider.position(10, 10);
  sizeSlider = createSlider(5, 50, 20);
  sizeSlider.position(10, 40);
  colorSlider = createSlider(0, 360, 180);
  colorSlider.position(10, 70);
  colorSlider2 = createSlider(0, 360, 360);
  colorSlider2.position(10, 100);
  
  stroke(255);
  strokeWeight(4);
  background(0);
}

function draw() {
  colorMode(RGB);
  background(0, 0, 0, 25); // Faded background for trail effect
  
  // Launch new fireworks randomly based on frequency slider
  if (random(1) < 0.02 * frequencySlider.value()) {
    fireworks.push(new Firework(random(width), height, sizeSlider.value(), random(colorSlider.value(), colorSlider2.value())));
  }
  
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

// Firework class
class Firework {
  constructor(x, y, size, hue) {
    this.x = x;
    this.y = y;
    this.lifespan = 255;
    this.firework = new Particle(this.x, this.y, size, hue, 1, 10);
    this.exploded = false;
    this.particles = [];
  }

  update() {
    if (!this.exploded) {
      this.firework.update();
      this.lifespan -= 4;
      
      if (this.firework.vel.y >= 0 || this.lifespan < 0) {
        this.exploded = true;
        this.explode();
      }
    } else {
      for (let particle of this.particles) {
        particle.update();
      }
      this.particles = this.particles.filter(p => !p.done());
    }
  }

  explode() {
    for (let i = 0; i < 100; i++) {
      let p = new Particle(this.firework.pos.x, this.firework.pos.y, this.firework.size, this.firework.hue);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    } else {
      for (let particle of this.particles) {
        particle.show();
      }
    }
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }
}

// Particle class
class Particle {
  constructor(x, y, size, hue) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(5) - 5/2, -10 - random(10/2))
    this.acc = createVector(0, .2);
    this.lifespan = 1000;
    this.size = size;
    this.hue = hue;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 4;
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB);
    noStroke();
    fill(this.hue, 255, 255, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}
