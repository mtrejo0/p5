// NEAT Racing Game
// Cars evolve using neural networks to navigate a race track

let track;
let cars = [];
let generation = 1;
let populationSize = 10;
let maxTime = 2000; // frames per generation
let currentTime = 0;
let bestDistance = 0;
let allTimeBest = 0;

// Track parameters
let trackPoints = [];
let trackWidth = 60;
let checkpoints = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create circular track with curves
  createTrack();
  
  // Initialize first generation
  initializePopulation();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recreate track for new canvas size
  createTrack();
}

function draw() {
  background(50, 150, 50); // Green background
  
  // Draw track
  drawTrack();
  
  // Update and draw cars
  updateCars();
  
  // Draw UI
  drawUI();
  
  currentTime++;
  
  // Check if generation is complete
  if (currentTime >= maxTime || allCarsDead()) {
    nextGeneration();
  }
}

function createTrack() {
  trackPoints = [];
  checkpoints = [];
  
  let centerX = windowWidth / 2;
  let centerY = windowHeight / 2;
  
  // Scale track size based on screen size
  let radiusX = min(windowWidth, windowHeight) * 0.25;
  let radiusY = min(windowWidth, windowHeight) * 0.15;
  
  // Create oval track with some curves
  for (let i = 0; i < 100; i++) {
    let angle = (i / 100) * TWO_PI;
    
    // Add some variation to make it more interesting
    let variation = sin(angle * 3) * 30 + cos(angle * 5) * 20;
    let currentRadiusX = radiusX + variation;
    let currentRadiusY = radiusY + variation * 0.5;
    
    let x = centerX + cos(angle) * currentRadiusX;
    let y = centerY + sin(angle) * currentRadiusY;
    
    trackPoints.push(createVector(x, y));
    
    // Create checkpoints every 10 points
    if (i % 10 === 0) {
      checkpoints.push({
        pos: createVector(x, y),
        index: checkpoints.length
      });
    }
  }
}

function drawTrack() {
  // Draw track outline
  stroke(100);
  strokeWeight(trackWidth);
  noFill();
  
  beginShape();
  for (let point of trackPoints) {
    vertex(point.x, point.y);
  }
  endShape(CLOSE);
  
  // Draw track surface
  stroke(150);
  strokeWeight(trackWidth - 10);
  
  beginShape();
  for (let point of trackPoints) {
    vertex(point.x, point.y);
  }
  endShape(CLOSE);
  
  // Draw checkpoints
  for (let checkpoint of checkpoints) {
    fill(255, 255, 0, 100);
    noStroke();
    circle(checkpoint.pos.x, checkpoint.pos.y, 20);
  }
  
  // Draw start/finish line
  stroke(255, 0, 0);
  strokeWeight(5);
  let start = trackPoints[0];
  let startNormal = getNormalAtPoint(0);
  line(
    start.x - startNormal.x * trackWidth/2,
    start.y - startNormal.y * trackWidth/2,
    start.x + startNormal.x * trackWidth/2,
    start.y + startNormal.y * trackWidth/2
  );
}

function getNormalAtPoint(index) {
  let current = trackPoints[index];
  let next = trackPoints[(index + 1) % trackPoints.length];
  let direction = p5.Vector.sub(next, current);
  direction.normalize();
  return createVector(-direction.y, direction.x);
}

function isOnTrack(pos) {
  let minDist = Infinity;
  let closestIndex = 0;
  
  // Find closest point on track
  for (let i = 0; i < trackPoints.length; i++) {
    let dist = p5.Vector.dist(pos, trackPoints[i]);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }
  
  return minDist <= trackWidth / 2;
}

function getDistanceAlongTrack(pos) {
  let minDist = Infinity;
  let closestIndex = 0;
  
  for (let i = 0; i < trackPoints.length; i++) {
    let dist = p5.Vector.dist(pos, trackPoints[i]);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }
  
  return closestIndex;
}

function getProgressiveDistance(car, newIndex) {
  // Calculate distance traveled in the correct direction
  let progress = 0;
  
  if (car.lastTrackIndex !== undefined) {
    let diff = newIndex - car.lastTrackIndex;
    
    // Handle wrapping around the track
    if (diff > trackPoints.length / 2) {
      diff -= trackPoints.length;
    } else if (diff < -trackPoints.length / 2) {
      diff += trackPoints.length;
    }
    
    // Only add positive progress (forward movement)
    if (diff > 0) {
      car.totalDistance += diff;
    }
    // Small penalty for going backwards
    else if (diff < 0) {
      car.totalDistance += diff * 0.1;
    }
  }
  
  car.lastTrackIndex = newIndex;
  return car.totalDistance;
}

// Car class with neural network
class Car {
  constructor(brain) {
    this.pos = trackPoints[0].copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    
    // Calculate initial angle pointing towards next track point
    let nextPoint = trackPoints[1];
    let direction = p5.Vector.sub(nextPoint, this.pos);
    this.angle = direction.heading();
    
    this.maxSpeed = 1;
    this.maxForce = 0.1;
    this.maxAngularVel = 0.03; // Limit spinning
    this.angularVel = 0;
    
    this.alive = true;
    this.fitness = 0;
    this.distance = 0;
    this.totalDistance = 0; // Cumulative distance in correct direction
    this.lastTrackIndex = undefined; // Track position for progressive distance
    this.checkpointsPassed = 0;
    this.timeAlive = 0;
    this.totalSpeed = 0; // Track cumulative speed for fitness
    this.stuckCounter = 0; // Count frames when barely moving
    
    // Neural network (brain)
    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(8, 4, 2); // 8 inputs, 16 hidden, 2 outputs
    }
    
    // Sensors for wall detection
    this.sensors = [];
    this.sensorLength = 100;
  }
  
  update() {
    if (!this.alive) return;
    
    this.timeAlive++;
    
    // Get sensor readings
    this.updateSensors();
    
    // Get neural network output
    let inputs = this.getSensorInputs();
    let outputs = this.brain.predict(inputs);
    
    // Apply outputs as steering and acceleration
    let steering = map(outputs[0], 0, 1, -0.1, 0.1);
    let acceleration = map(outputs[1], 0, 1, 0, this.maxForce);
    
    // Limit angular velocity to prevent excessive spinning
    this.angularVel += steering;
    this.angularVel = constrain(this.angularVel, -this.maxAngularVel, this.maxAngularVel);
    this.angularVel *= 0.9; // Add some damping
    
    // Update physics
    this.angle += this.angularVel;
    let force = p5.Vector.fromAngle(this.angle);
    force.mult(acceleration);
    this.acc.add(force);
    
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Track speed for fitness calculation
    let currentSpeed = this.vel.mag();
    this.totalSpeed += currentSpeed;
    
    // Check if car is stuck (moving very slowly)
    if (currentSpeed < 0.5) {
      this.stuckCounter++;
    } else {
      this.stuckCounter = 0;
    }
    
    // Kill car if stuck for too long
    if (this.stuckCounter > 60) { // 1 second at 60fps
      this.alive = false;
    }
    
    // Check collision with track boundaries
    if (!isOnTrack(this.pos)) {
      this.alive = false;
    }
    
    // Update distance with progressive tracking
    let currentTrackIndex = getDistanceAlongTrack(this.pos);
    this.distance = getProgressiveDistance(this, currentTrackIndex);
    this.checkCheckpoints();
    
    // Calculate fitness with speed bonus and penalties
    let speedBonus = this.totalSpeed * 0.1; // Reward for maintaining speed
    let speedPenalty = (this.timeAlive - this.totalSpeed) * 0.05; // Penalize for being slow
    let spinPenalty = Math.abs(this.angularVel) * 100; // Penalize excessive spinning
    
    this.fitness = this.distance + 
                   this.checkpointsPassed * 100 + 
                   speedBonus - 
                   speedPenalty - 
                   spinPenalty;
  }
  
  updateSensors() {
    this.sensors = [];
    let angles = [-PI/2, -PI/4, -PI/8, 0, PI/8, PI/4, PI/2, PI];
    
    for (let angle of angles) {
      let sensorAngle = this.angle + angle;
      let end = createVector(
        this.pos.x + cos(sensorAngle) * this.sensorLength,
        this.pos.y + sin(sensorAngle) * this.sensorLength
      );
      
      // Cast ray and find intersection with track boundary
      let distance = this.castRay(this.pos, end);
      this.sensors.push(distance);
    }
  }
  
  castRay(start, end) {
    let steps = 50;
    for (let i = 1; i <= steps; i++) {
      let t = i / steps;
      let testPos = p5.Vector.lerp(start, end, t);
      
      if (!isOnTrack(testPos)) {
        return p5.Vector.dist(start, testPos);
      }
    }
    return this.sensorLength;
  }
  
  getSensorInputs() {
    let inputs = [];
    
    // Normalize sensor readings
    for (let sensor of this.sensors) {
      inputs.push(sensor / this.sensorLength);
    }
    
    return inputs;
  }
  
  checkCheckpoints() {
    for (let checkpoint of checkpoints) {
      if (checkpoint.index === this.checkpointsPassed) {
        let dist = p5.Vector.dist(this.pos, checkpoint.pos);
        if (dist < 30) {
          this.checkpointsPassed++;
          break;
        }
      }
    }
  }
  
  draw() {
    if (!this.alive) return;
    
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    
    // Draw car
    fill(255, 100, 100);
    stroke(0);
    strokeWeight(1);
    rectMode(CENTER);
    rect(0, 0, 20, 10);
    
    // Draw direction indicator
    fill(255);
    rect(5, 0, 5, 3);
    
    pop();
    
    // Draw sensors (for best car only)
    if (this === getBestCar()) {
      this.drawSensors();
    }
  }
  
  drawSensors() {
    stroke(255, 100, 100, 100);
    strokeWeight(1);
    
    let angles = [-PI/2, -PI/4, -PI/8, 0, PI/8, PI/4, PI/2, PI];
    
    for (let i = 0; i < angles.length; i++) {
      let angle = this.angle + angles[i];
      let distance = this.sensors[i];
      
      let endX = this.pos.x + cos(angle) * distance;
      let endY = this.pos.y + sin(angle) * distance;
      
      line(this.pos.x, this.pos.y, endX, endY);
    }
  }
  
  copy() {
    return new Car(this.brain);
  }
  
  mutate(rate) {
    this.brain.mutate(rate);
  }
}

// Simple Neural Network implementation
class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;
    
    // Initialize weights randomly
    this.weightsIH = this.randomMatrix(this.hiddenNodes, this.inputNodes);
    this.weightsHO = this.randomMatrix(this.outputNodes, this.hiddenNodes);
    
    // Initialize biases
    this.biasH = this.randomMatrix(this.hiddenNodes, 1);
    this.biasO = this.randomMatrix(this.outputNodes, 1);
  }
  
  randomMatrix(rows, cols) {
    let matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = random(-1, 1);
      }
    }
    return matrix;
  }
  
  predict(inputs) {
    // Convert inputs to matrix
    let inputMatrix = [];
    for (let i = 0; i < inputs.length; i++) {
      inputMatrix[i] = [inputs[i]];
    }
    
    // Hidden layer
    let hidden = this.matrixMultiply(this.weightsIH, inputMatrix);
    hidden = this.matrixAdd(hidden, this.biasH);
    hidden = this.matrixMap(hidden, this.sigmoid);
    
    // Output layer
    let output = this.matrixMultiply(this.weightsHO, hidden);
    output = this.matrixAdd(output, this.biasO);
    output = this.matrixMap(output, this.sigmoid);
    
    // Convert back to array
    let result = [];
    for (let i = 0; i < output.length; i++) {
      result[i] = output[i][0];
    }
    
    return result;
  }
  
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  
  matrixMultiply(a, b) {
    let result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }
  
  matrixAdd(a, b) {
    let result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < a[0].length; j++) {
        result[i][j] = a[i][j] + b[i][j];
      }
    }
    return result;
  }
  
  matrixMap(matrix, func) {
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
      result[i] = [];
      for (let j = 0; j < matrix[0].length; j++) {
        result[i][j] = func(matrix[i][j]);
      }
    }
    return result;
  }
  
  copy() {
    let copy = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes);
    copy.weightsIH = this.copyMatrix(this.weightsIH);
    copy.weightsHO = this.copyMatrix(this.weightsHO);
    copy.biasH = this.copyMatrix(this.biasH);
    copy.biasO = this.copyMatrix(this.biasO);
    return copy;
  }
  
  copyMatrix(matrix) {
    let copy = [];
    for (let i = 0; i < matrix.length; i++) {
      copy[i] = [];
      for (let j = 0; j < matrix[0].length; j++) {
        copy[i][j] = matrix[i][j];
      }
    }
    return copy;
  }
  
  mutate(rate) {
    this.mutateMatrix(this.weightsIH, rate);
    this.mutateMatrix(this.weightsHO, rate);
    this.mutateMatrix(this.biasH, rate);
    this.mutateMatrix(this.biasO, rate);
  }
  
  mutateMatrix(matrix, rate) {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[0].length; j++) {
        if (random() < rate) {
          matrix[i][j] += random(-0.1, 0.1);
        }
      }
    }
  }
}

function initializePopulation() {
  cars = [];
  for (let i = 0; i < populationSize; i++) {
    cars.push(new Car());
  }
  currentTime = 0;
}

function updateCars() {
  let aliveCars = 0;
  bestDistance = 0;
  
  for (let car of cars) {
    if (car.alive) {
      car.update();
      aliveCars++;
      if (car.fitness > bestDistance) {
        bestDistance = car.fitness;
      }
    }
    car.draw();
  }
  
  if (bestDistance > allTimeBest) {
    allTimeBest = bestDistance;
  }
}

function allCarsDead() {
  for (let car of cars) {
    if (car.alive) return false;
  }
  return true;
}

function getBestCar() {
  let best = cars[0];
  for (let car of cars) {
    if (car.fitness > best.fitness) {
      best = car;
    }
  }
  return best;
}

function nextGeneration() {
  // Sort cars by fitness
  cars.sort((a, b) => b.fitness - a.fitness);
  
  // Create new generation
  let newCars = [];
  
  // Keep best 20% unchanged
  let eliteCount = Math.floor(populationSize * 0.2);
  for (let i = 0; i < eliteCount; i++) {
    newCars.push(cars[i].copy());
  }
  
  // Fill rest with mutations of top performers
  while (newCars.length < populationSize) {
    let parent = cars[Math.floor(random() * eliteCount)];
    let child = parent.copy();
    child.mutate(.1);
    newCars.push(child);
  }
  
  cars = newCars;
  generation++;
  currentTime = 0;
  
  // Calculate correct starting angle
  let startPoint = trackPoints[0];
  let nextPoint = trackPoints[1];
  let startDirection = p5.Vector.sub(nextPoint, startPoint);
  let startAngle = startDirection.heading();
  
  // Reset car positions and all variables
  for (let car of cars) {
    car.pos = trackPoints[0].copy();
    car.vel = createVector(0, 0);
    car.acc = createVector(0, 0);
    car.angle = startAngle;
    car.angularVel = 0;
    car.alive = true;
    car.fitness = 0;
    car.distance = 0;
    car.totalDistance = 0;
    car.lastTrackIndex = undefined;
    car.checkpointsPassed = 0;
    car.timeAlive = 0;
    car.totalSpeed = 0;
    car.stuckCounter = 0;
  }
}

function drawUI() {
  // Background for UI
  fill(0, 0, 0, 150);
  noStroke();
  rect(10, 10, 300, 160);
  
  // Text
  fill(255);
  textSize(16);
  text(`Generation: ${generation}`, 20, 30);
  text(`Time: ${currentTime}/${maxTime}`, 20, 50);
  text(`Alive: ${cars.filter(car => car.alive).length}/${populationSize}`, 20, 70);
  text(`Best Distance: ${bestDistance.toFixed(1)}`, 20, 90);
  text(`All Time Best: ${allTimeBest.toFixed(1)}`, 20, 110);
  
  let bestCar = getBestCar();
  text(`Best Checkpoints: ${bestCar.checkpointsPassed}`, 20, 130);
  
  // Show speed information for best car
  let avgSpeed = bestCar.timeAlive > 0 ? (bestCar.totalSpeed / bestCar.timeAlive).toFixed(2) : 0;
  let currentSpeed = bestCar.vel.mag().toFixed(2);
  text(`Best Car Speed: ${currentSpeed} (avg: ${avgSpeed})`, 20, 150);
  
  // Draw neural network visualization
  drawNeuralNetwork(bestCar.brain);
}

function drawNeuralNetwork(brain) {
  let netWidth = min(windowWidth * 0.2, 300);
  let netHeight = min(windowHeight * 0.4, 400);
  let netX = windowWidth - netWidth - 20;
  let netY = 20;
  
  // Background for neural network
  fill(0, 0, 0, 180);
  noStroke();
  rect(netX, netY, netWidth, netHeight);
  
  // Network parameters
  let inputNodes = brain.inputNodes;
  let hiddenNodes = brain.hiddenNodes;
  let outputNodes = brain.outputNodes;
  
  let layerSpacing = netWidth / 3;
  let inputSpacing = netHeight / (inputNodes + 1);
  let hiddenSpacing = netHeight / (hiddenNodes + 1);
  let outputSpacing = netHeight / (outputNodes + 1);
  
  // Input layer positions
  let inputPositions = [];
  for (let i = 0; i < inputNodes; i++) {
    inputPositions.push({
      x: netX + 30,
      y: netY + (i + 1) * inputSpacing
    });
  }
  
  // Hidden layer positions
  let hiddenPositions = [];
  for (let i = 0; i < hiddenNodes; i++) {
    hiddenPositions.push({
      x: netX + 30 + layerSpacing,
      y: netY + (i + 1) * hiddenSpacing
    });
  }
  
  // Output layer positions
  let outputPositions = [];
  for (let i = 0; i < outputNodes; i++) {
    outputPositions.push({
      x: netX + 30 + layerSpacing * 2,
      y: netY + (i + 1) * outputSpacing
    });
  }
  
  // Draw connections from input to hidden
  strokeWeight(1);
  for (let i = 0; i < inputNodes; i++) {
    for (let j = 0; j < hiddenNodes; j++) {
      let weight = brain.weightsIH[j][i];
      
      // Color based on weight value
      if (weight > 0) {
        stroke(0, 255, 0, map(abs(weight), 0, 2, 50, 255));
      } else {
        stroke(255, 0, 0, map(abs(weight), 0, 2, 50, 255));
      }
      
      line(inputPositions[i].x, inputPositions[i].y,
           hiddenPositions[j].x, hiddenPositions[j].y);
    }
  }
  
  // Draw connections from hidden to output
  for (let i = 0; i < hiddenNodes; i++) {
    for (let j = 0; j < outputNodes; j++) {
      let weight = brain.weightsHO[j][i];
      
      // Color based on weight value
      if (weight > 0) {
        stroke(0, 255, 0, map(abs(weight), 0, 2, 50, 255));
      } else {
        stroke(255, 0, 0, map(abs(weight), 0, 2, 50, 255));
      }
      
      line(hiddenPositions[i].x, hiddenPositions[i].y,
           outputPositions[j].x, outputPositions[j].y);
    }
  }
  
  // Draw input nodes
  for (let i = 0; i < inputNodes; i++) {
    let activation = 0;
    if (cars.length > 0) {
      let bestCar = getBestCar();
      if (bestCar.sensors && bestCar.sensors[i] !== undefined) {
        activation = bestCar.sensors[i] / bestCar.sensorLength;
      }
    }
    
    fill(map(activation, 0, 1, 50, 255));
    stroke(255);
    strokeWeight(2);
    circle(inputPositions[i].x, inputPositions[i].y, 15);
    
    // Label
    fill(255);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text(`S${i}`, inputPositions[i].x, inputPositions[i].y - 20);
  }
  
  // Draw hidden nodes
  for (let i = 0; i < hiddenNodes; i++) {
    fill(100, 100, 255);
    stroke(255);
    strokeWeight(1);
    circle(hiddenPositions[i].x, hiddenPositions[i].y, 12);
  }
  
  // Draw output nodes
  let outputLabels = ['Steering', 'Acceleration'];
  for (let i = 0; i < outputNodes; i++) {
    fill(255, 100, 100);
    stroke(255);
    strokeWeight(2);
    circle(outputPositions[i].x, outputPositions[i].y, 15);
    
    // Label
    fill(255);
    noStroke();
    textSize(10);
    textAlign(CENTER);
    text(outputLabels[i], outputPositions[i].x, outputPositions[i].y + 25);
  }
  
  // Legend
  fill(255);
  textSize(12);
  textAlign(LEFT);
  text('Neural Network (Best Car)', netX, netY - 10);
  
  fill(0, 255, 0);
  text('Green: Positive weights', netX, netY + netHeight + 15);
  fill(255, 0, 0);
  text('Red: Negative weights', netX, netY + netHeight + 30);
  fill(255);
  text('Brightness: Weight strength', netX, netY + netHeight + 45);
}

// Reset simulation
function keyPressed() {
  if (key === 'r' || key === 'R') {
    generation = 1;
    allTimeBest = 0;
    initializePopulation();
  }
}
