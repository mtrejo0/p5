let pipes = [];
let gridSize = 20; // Size of each grid cell
let occupied = new Set(); // Keep track of occupied positions

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB);
  
  // Start with a few initial pipes
  for (let i = 0; i < 3; i++) {
    addNewPipe();
  }

  // Create save button
  let saveButton = createButton('Save Canvas');
  saveButton.position(10, 10);
  saveButton.mousePressed(() => save('3DPipes.jpg'));

  // frameRate(5)
}

function draw() {
  background(0);
  orbitControl();
  
  // Add lighting
  directionalLight(255, 255, 255, 0, 1, -1);
  ambientLight(60);
  
  // Draw all pipes
  noStroke();
  for (let pipe of pipes) {
    pipe.grow();
    pipe.show();
  }
  
  // Randomly add new pipes
  if (frameCount % 60 === 0 && pipes.length < 10) {
    addNewPipe();
  }
}

class Pipe {
  constructor(x, y, z) {
    this.positions = [{x, y, z}];
    this.hue = random(360);
    this.growing = true;
    this.addPosition(x, y, z);
  }
  
  addPosition(x, y, z) {
    let key = `${x},${y},${z}`;
    occupied.add(key);
  }
  
  grow() {
    if (!this.growing) return;
    
    let current = this.positions[this.positions.length - 1];
    let directions = [
      {x: 1, y: 0, z: 0},
      {x: -1, y: 0, z: 0},
      {x: 0, y: 1, z: 0},
      {x: 0, y: -1, z: 0},
      {x: 0, y: 0, z: 1},
      {x: 0, y: 0, z: -1}
    ];
    
    // Filter valid directions
    let validDirections = directions.filter(dir => {
      let newX = current.x + dir.x * gridSize;
      let newY = current.y + dir.y * gridSize;
      let newZ = current.z + dir.z * gridSize;
      let key = `${newX},${newY},${newZ}`;
      return !occupied.has(key);
    });
    
    if (validDirections.length > 0) {
      let dir = random(validDirections);
      // Go 5-10 steps in the chosen direction
      let steps = floor(random(7, 20));
      for (let step = 0; step < steps; step++) {
        let newPos = {
          x: current.x + dir.x * gridSize,
          y: current.y + dir.y * gridSize,
          z: current.z + dir.z * gridSize
        };
        // Check if position is already occupied
        let key = `${newPos.x},${newPos.y},${newPos.z}`;
        if (occupied.has(key)) {
          // Instead of stopping growth, break out of this direction
          break;
        }
        this.positions.push(newPos);
        this.addPosition(newPos.x, newPos.y, newPos.z);
        current = newPos; // Update current for next step
      }
    } else {
      // Try to find a new valid position by backtracking
      for (let i = this.positions.length - 2; i >= 0; i--) {
        current = this.positions[i];
        let validBacktrack = directions.some(dir => {
          let newX = current.x + dir.x * gridSize;
          let newY = current.y + dir.y * gridSize;
          let newZ = current.z + dir.z * gridSize;
          let key = `${newX},${newY},${newZ}`;
          return !occupied.has(key);
        });
        if (validBacktrack) {
          // Remove positions after this point
          this.positions = this.positions.slice(0, i + 1);
          return; // Exit and try growing from this position next frame
        }
      }
      // If no valid positions found after backtracking, then stop
      this.growing = false;
    }
  }
  
  show() {
    push();
    fill(this.hue, 70, 90);
    
    for (let i = 0; i < this.positions.length; i++) {
      let current = this.positions[i];
      
      push();
      translate(current.x, current.y, current.z);
      
      if (i < this.positions.length - 1) {
        let next = this.positions[i + 1];
        
        // Calculate direction vector
        let dx = next.x - current.x;
        let dy = next.y - current.y;
        let dz = next.z - current.z;

        // Apply rotations based on direction
        if (dx !== 0) {
          rotateZ(HALF_PI);
        } else if (dy !== 0) {
          rotateY(-HALF_PI);
        } else if (dz !== 0) {
          rotateX(-HALF_PI);
        }
        
        // Draw cylinder from center to next position
        // translate(0, gridSize/2, 0);  // Move to center of connection
        cylinder(gridSize, gridSize);
      }
      
      // Only draw sphere at joints where direction changes
      if (i > 0 && i < this.positions.length - 1) {
        let prev = this.positions[i - 1];
        let next = this.positions[i + 1];
        
        // Check if direction changes by comparing vectors
        let prevDir = {
          x: current.x - prev.x,
          y: current.y - prev.y, 
          z: current.z - prev.z
        };
        let nextDir = {
          x: next.x - current.x,
          y: next.y - current.y,
          z: next.z - current.z
        };
        
        if (prevDir.x !== nextDir.x || prevDir.y !== nextDir.y || prevDir.z !== nextDir.z) {
          sphere(gridSize*1.5);
        }
      }
      pop();
    }
    pop();
  }
}

function addNewPipe() {
  // Start from a random position near the center
  let startPos = {
    x: round(random(-2, 2)) * gridSize,
    y: round(random(-2, 2)) * gridSize,
    z: round(random(-2, 2)) * gridSize
  };
  
  let key = `${startPos.x},${startPos.y},${startPos.z}`;
  if (!occupied.has(key)) {
    pipes.push(new Pipe(startPos.x, startPos.y, startPos.z));
  }
}