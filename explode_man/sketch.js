let man;
let room;
let explosions = [];
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let dragHistory = [];
let maxDragHistory = 5;

class Man {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = 40;
    this.mass = 1;
    this.friction = 0.98;
    this.gravity = 0.3;
    
    // Angular properties
    this.angle = 0;
    this.angularVelocity = 0;
    this.angularFriction = 0.95;
    
    // Limb properties - each limb has its own angle and angular velocity
    this.limbs = {
      leftArm: { angle: 0, angularVel: 0, targetAngle: 0 },
      rightArm: { angle: 0, angularVel: 0, targetAngle: 0 },
      leftLeg: { angle: 0, angularVel: 0, targetAngle: 0 },
      rightLeg: { angle: 0, angularVel: 0, targetAngle: 0 }
    };
    this.limbSpring = 0.1; // How quickly limbs return to target position
    this.limbDamping = 0.8; // Limb movement damping
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Body
    fill(60, 60, 60);
    ellipse(0, 0, this.size, this.size * 1.5);
    
    // Head
    fill(80, 80, 80);
    ellipse(0, -this.size * 0.8, this.size * 0.6, this.size * 0.6);
    
    // Arms with physics
    stroke(80, 80, 80);
    strokeWeight(8);
    
    // Left arm
    push();
    translate(-this.size * 0.3, -this.size * 0.2);
    rotate(this.limbs.leftArm.angle);
    line(0, 0, -this.size * 0.3, this.size * 0.4);
    pop();
    
    // Right arm
    push();
    translate(this.size * 0.3, -this.size * 0.2);
    rotate(this.limbs.rightArm.angle);
    line(0, 0, this.size * 0.3, this.size * 0.4);
    pop();
    
    // Legs with physics
    // Left leg
    push();
    translate(-this.size * 0.2, this.size * 0.5);
    rotate(this.limbs.leftLeg.angle);
    line(0, 0, -this.size * 0.1, this.size * 0.7);
    pop();
    
    // Right leg
    push();
    translate(this.size * 0.2, this.size * 0.5);
    rotate(this.limbs.rightLeg.angle);
    line(0, 0, this.size * 0.1, this.size * 0.7);
    pop();
    
    noStroke();
    pop();
  }

  update() {
    // Apply gravity
    if (!isDragging) {
      this.vy += this.gravity;
    }
    
    this.x += this.vx;
    this.y += this.vy;
    
    // Update rotation
    this.angle += this.angularVelocity;
    this.angularVelocity *= this.angularFriction;
    
    this.vx *= this.friction;
    this.vy *= this.friction;
    
    // Update limb physics
    this.updateLimbs();
    
    // Improved collision detection with impact thresholds
    let impactThreshold = 2; // Minimum velocity for impact reactions
    
    // Left wall collision
    if (this.x - this.size/2 < room.left) {
      this.x = room.left + this.size/2;
      if (abs(this.vx) > impactThreshold) {
        this.angularVelocity += random(-0.2, 0.2);
        this.disturbLimbs(0.3);
      }
      this.vx *= -0.7;
    }
    
    // Right wall collision
    if (this.x + this.size/2 > room.right) {
      this.x = room.right - this.size/2;
      if (abs(this.vx) > impactThreshold) {
        this.angularVelocity += random(-0.2, 0.2);
        this.disturbLimbs(0.3);
      }
      this.vx *= -0.7;
    }
    
    // Top wall collision
    if (this.y - this.size < room.top) {
      this.y = room.top + this.size;
      if (abs(this.vy) > impactThreshold) {
        this.angularVelocity += random(-0.2, 0.2);
        this.disturbLimbs(0.3);
      }
      this.vy *= -0.7;
    }
    
    // Bottom wall collision (ground) - more sophisticated
    if (this.y + this.size > room.bottom) {
      this.y = room.bottom - this.size;
      
      // Only react if there's significant downward velocity (actual impact)
      if (this.vy > impactThreshold) {
        this.angularVelocity += random(-0.15, 0.15);
        this.disturbLimbs(0.2);
      }
      
      // Stronger damping when on ground to simulate friction
      if (abs(this.vy) < 1) {
        this.vx *= 0.9; // Extra ground friction
        this.angularVelocity *= 0.9; // Reduce spinning on ground
      }
      
      this.vy *= -0.7;
    }
  }
  
  updateLimbs() {
    // Calculate target angles based on movement
    let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
    let movementAngle = atan2(this.vy, this.vx);
    
    // Set target angles for natural movement
    this.limbs.leftArm.targetAngle = sin(millis() * 0.01 + speed * 0.1) * 0.3;
    this.limbs.rightArm.targetAngle = -sin(millis() * 0.01 + speed * 0.1) * 0.3;
    this.limbs.leftLeg.targetAngle = sin(millis() * 0.015 + speed * 0.1) * 0.2;
    this.limbs.rightLeg.targetAngle = -sin(millis() * 0.015 + speed * 0.1) * 0.2;
    
    // Update each limb with spring physics
    for (let limbName in this.limbs) {
      let limb = this.limbs[limbName];
      let angleDiff = limb.targetAngle - limb.angle;
      limb.angularVel += angleDiff * this.limbSpring;
      limb.angularVel *= this.limbDamping;
      limb.angle += limb.angularVel;
    }
  }
  
  disturbLimbs(force) {
    // Add random disturbance to limbs
    for (let limbName in this.limbs) {
      this.limbs[limbName].angularVel += random(-force, force);
    }
  }

  applyForce(fx, fy) {
    this.vx += fx / this.mass;
    this.vy += fy / this.mass;
    
    // Add angular momentum based on force direction and position
    let torque = (fx * 0.1 + fy * 0.1) * 0.01;
    this.angularVelocity += torque;
    
    // Disturb limbs when force is applied
    this.disturbLimbs(abs(fx + fy) * 0.01);
  }

  isMouseOver() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.size;
  }
}

class Room {
  constructor() {
    this.left = 50;
    this.right = width - 50;
    this.top = 50;
    this.bottom = height - 50;
  }

  draw() {
    stroke(255);
    strokeWeight(4);
    noFill();
    rect(this.left, this.top, this.right - this.left, this.bottom - this.top);
  }

  update() {
    this.right = width - 50;
    this.bottom = height - 50;
  }
}

class Explosion {
  constructor(x, y, force = 1) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.force = force;
    this.maxRadius = 150 * force;
    this.currentRadius = 0;
    this.expanding = true;
    this.life = 60;
    
    // Create particles
    for (let i = 0; i < 20 * force; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: random(-10, 10) * force,
        vy: random(-10, 10) * force,
        size: random(3, 8),
        life: random(30, 60),
        maxLife: random(30, 60)
      });
    }
    
    this.applyForceToMan();
  }

  applyForceToMan() {
    let dx = man.x - this.x;
    let dy = man.y - this.y;
    let distance = sqrt(dx * dx + dy * dy);
    
    if (distance < this.maxRadius && distance > 0) {
      let forceStrength = (this.maxRadius - distance) / this.maxRadius * this.force * 20;
      let fx = (dx / distance) * forceStrength;
      let fy = (dy / distance) * forceStrength;
      man.applyForce(fx, fy);
    }
  }

  draw() {
    // Draw explosion wave
    if (this.expanding) {
      stroke(255, 100, 0, 150);
      strokeWeight(3);
      noFill();
      ellipse(this.x, this.y, this.currentRadius * 2);
      
      this.currentRadius += 8;
      if (this.currentRadius >= this.maxRadius) {
        this.expanding = false;
      }
    }
    
    // Draw particles
    noStroke();
    for (let p of this.particles) {
      let alpha = map(p.life, 0, p.maxLife, 0, 255);
      fill(255, random(100, 200), 0, alpha);
      ellipse(p.x, p.y, p.size);
    }
  }

  update() {
    this.life--;
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life--;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  isDead() {
    return this.life <= 0 && this.particles.length === 0;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  man = new Man(width/2, height/2);
  room = new Room();
}

function draw() {
  background(50, 50, 50);
  
  room.update();
  room.draw();
  
  man.update();
  man.draw();
  
  // Update and draw explosions
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].draw();
    
    if (explosions[i].isDead()) {
      explosions.splice(i, 1);
    }
  }
  
  // Draw instructions with background to prevent flickering
  push();
  fill(0, 0, 0, 150); // Semi-transparent black background
  noStroke();
  rect(5, 5, 400, 70);
  
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Drag and throw the man around the room", 10, 25);
  text("Click anywhere to create explosions", 10, 45);
  
  // Bottom text with background
  fill(0, 0, 0, 150);
  rect(5, height - 35, 200, 25);
  fill(255);
  text("Explosions: " + explosions.length, 10, height - 20);
  pop();
}

function mousePressed() {
  if (man.isMouseOver()) {
    isDragging = true;
    dragOffset.x = mouseX - man.x;
    dragOffset.y = mouseY - man.y;
    dragHistory = [];
  } else {
    // Create explosion at mouse position
    explosions.push(new Explosion(mouseX, mouseY, random(0.5, 2)));
  }
}

function mouseDragged() {
  if (isDragging) {
    // Store drag history for momentum calculation
    dragHistory.push({
      x: mouseX,
      y: mouseY,
      time: millis()
    });
    
    // Keep only recent history
    if (dragHistory.length > maxDragHistory) {
      dragHistory.shift();
    }
    
    man.x = mouseX - dragOffset.x;
    man.y = mouseY - dragOffset.y;
    
    // Keep man in bounds while dragging
    man.x = constrain(man.x, room.left + man.size/2, room.right - man.size/2);
    man.y = constrain(man.y, room.top + man.size, room.bottom - man.size);
  }
}

function mouseReleased() {
  if (isDragging) {
    // Calculate throwing force based on drag history
    if (dragHistory.length >= 2) {
      let recent = dragHistory[dragHistory.length - 1];
      let older = dragHistory[0];
      let timeDiff = recent.time - older.time;
      
      if (timeDiff > 0) {
        let throwForce = 10;
        man.vx = ((recent.x - older.x) / timeDiff) * throwForce;
        man.vy = ((recent.y - older.y) / timeDiff) * throwForce;
      }
    }
    
    isDragging = false;
    dragHistory = [];
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  room = new Room();
}

function keyPressed() {
  if (key === ' ') {
    // Create random explosion
    explosions.push(new Explosion(random(room.left, room.right), random(room.top, room.bottom), random(1, 3)));
  }
  if (key === 'c' || key === 'C') {
    // Clear all explosions
    explosions = [];
  }
}
