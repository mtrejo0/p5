let points = [];
let regressionLine = [];
let isLearning = false;
let currentPointIndex = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let button = createButton('Start Linear Regression');
  button.position(10, 10);
  button.mousePressed(startRegression);
  
  // Generate random points with a normal distribution around a random slope
  let slope = random(-1, 1); // Random slope
  for (let i = 0; i < width; i += 10) {
    let y = height / 2 + slope * (i - width / 2) + randomGaussian(0, 50); // More normal distribution around the line
    points.push(createVector(i, y));
  }
}

function draw() {
  background(0);
  
  // Draw the points
  fill(255);
  noStroke();
  for (let point of points) {
    ellipse(point.x, point.y, 5, 5);
  }
  
  // Draw the regression line if learning
  if (isLearning) {
    stroke(255, 0, 0);
    strokeWeight(2);
    for (let i = 0; i < regressionLine.length - 1; i++) {
      line(regressionLine[i].x, regressionLine[i].y, regressionLine[i + 1].x, regressionLine[i + 1].y);
    }
    
    // Update regression line with every other point
    if (currentPointIndex < points.length) {
      regressionLine = calculateLinearRegression(points.slice(0, currentPointIndex + 1));
      currentPointIndex += 1; // Update every other point
    }
  }
}

function startRegression() {
  isLearning = true;
  currentPointIndex = 0; // Reset index for regression updates
  regressionLine = calculateLinearRegression(points.slice(0, 1)); // Start with the first point
}

function mousePressed() {
  // Add a new point at the cursor position
  let newPoint = createVector(mouseX, mouseY);
  points.push(newPoint);
}

function calculateLinearRegression(points) {
  let xSum = 0;
  let ySum = 0;
  let xSquaredSum = 0;
  let xySum = 0;
  let n = points.length;

  for (let point of points) {
    xSum += point.x;
    ySum += point.y;
    xSquaredSum += point.x * point.x;
    xySum += point.x * point.y;
  }

  let slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
  let intercept = (ySum - slope * xSum) / n;

  let linePoints = [];
  for (let x = 0; x < width; x++) {
    let y = slope * x + intercept;
    linePoints.push(createVector(x, y));
  }
  return linePoints;
}