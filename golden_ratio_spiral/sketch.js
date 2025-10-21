let fibonacci = [1, 1];
let currentIndex = 0;
let boxes = [];
let angle = 0;
let zoomScale = 1;
let offsetX = 0;
let offsetY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Start with first two boxes
  boxes.push({value: 1, x: 20, y: 0, size: 20, angle: 0});
  boxes.push({value: 1, x: 0, y: 0, size: 20, angle: 0});
  currentIndex = 2;
  
  // Center the view
  offsetX = width / 2;
  offsetY = height / 2;
}

function draw() {
  background(0);
  
  // Draw all boxes
  push();
  translate(offsetX, offsetY);
  scale(zoomScale);
  
  
  for (let box of boxes) {
    push();
    translate(box.x + box.size/2, box.y + box.size/2);
    rotate(box.angle);
    
    // Draw the box
    stroke(255);
    strokeWeight(box.size * 0.01); // Scale stroke with box size
    noFill();
    rectMode(CENTER);
    rect(0, 0, box.size, box.size);
    
    // Draw the number
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(box.size * 0.6); // Even bigger text size (60% of box)
    text(box.value, 0, 0);
    pop();
    
  }
  pop();
  
  // Display current ratio
  if (fibonacci.length >= 2) {
    let ratio = fibonacci[fibonacci.length - 1] / fibonacci[fibonacci.length - 2];
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(24);
    // Reverse the fibonacci array for display (newest first)
    let reversedFib = [...fibonacci].reverse();
    text(`Fibonacci: ${reversedFib.join(', ')}`, 20, 20);
    text(`Ratio: ${ratio.toFixed(6)}`, 20, 50);
    text(`Golden Ratio: 1.618034`, 20, 80);
    text(`Press SPACE to add next`, 20, 110);
    text(`Press R to reset`, 20, 140);
    text(`Use +/- to zoom`, 20, 170);
    text(`Click and drag to pan`, 20, 200);
  }
}

function keyPressed() {
  if (key === ' ') {
    addNextFibonacci();
  } else if (key === 'r' || key === 'R') {
    resetVisualization();
  } else if (key === '+' || key === '=') {
    zoomScale *= 1.2;
  } else if (key === '-' || key === '_') {
    zoomScale *= 0.8;
  }
}

function addNextFibonacci() {
  if (fibonacci.length >= 2) {
    let next = fibonacci[fibonacci.length - 1] + fibonacci[fibonacci.length - 2];
    fibonacci.push(next);
    
    // Calculate position for next box
    let size = next * 20; // Scale size
    
    // For the golden ratio spiral, we need to track the previous two boxes
    let prevBox = boxes[boxes.length - 1];
    let prevPrevBox = boxes[boxes.length - 2];
    
    let newX, newY;
    let direction = (currentIndex - 2) % 4; // Adjust for starting at index 2
    
    switch(direction) {
      case 1: // Right - box goes to the right of previous
        newX = prevBox.x + prevBox.size;
        newY = prevBox.y + prevBox.size - size;
        break;
      case 2: // Up - box goes above previous
        newX = prevBox.x - size + (size - prevPrevBox.size);
        newY = prevBox.y - size;
        break;
      case 3: // Left - box goes to the left of previous
        newX = prevBox.x - size;
        newY = prevBox.y;
        break;
      case 0: // Down - box goes below previous
        newX = prevBox.x ;
        newY = prevBox.y + prevBox.size;
        break;
    }
    
    boxes.push({
      value: next,
      x: newX, 
      y: newY,
      size: size,
      angle: 0
    });
    
    currentIndex++;
    
    // Auto-scale to fit
    autoScale();
  }
}

function autoScale() {
  // Find bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (let box of boxes) {
    minX = min(minX, box.x);
    maxX = max(maxX, box.x + box.size);
    minY = min(minY, box.y);
    maxY = max(maxY, box.y + box.size);
  }
  
  let totalWidth = maxX - minX;
  let totalHeight = maxY - minY;
  
  // Calculate scale to fit
  let scaleX = (width * 0.8) / totalWidth;
  let scaleY = (height * 0.8) / totalHeight;
  zoomScale = min(scaleX, scaleY);
  
  // Center the spiral
  offsetX = width / 2 - (minX + totalWidth / 2) * zoomScale;
  offsetY = height / 2 - (minY + totalHeight / 2) * zoomScale;
}

function resetVisualization() {
  fibonacci = [1, 1];
  currentIndex = 0;
  boxes = [];
  angle = 0;
  zoomScale = 1;
  
  boxes.push({value: 1, x: 0, y: 0, size: 20, angle: 0});
  boxes.push({value: 1, x: 20, y: 0, size: 20, angle: 0});
  currentIndex = 2;
  
  offsetX = width / 2;
  offsetY = height / 2;
}

let isDragging = false;
let lastMouseX, lastMouseY;

function mousePressed() {
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function mouseDragged() {
  if (isDragging) {
    offsetX += mouseX - lastMouseX;
    offsetY += mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseReleased() {
  isDragging = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  autoScale();
}

