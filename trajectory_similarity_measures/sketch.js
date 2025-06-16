let trajectory1 = [];
let trajectory2 = [];
let isRecording = false;
let currentTrajectory = 1;
let similarityScore = 0;

function setup() {
  createCanvas(800, 600);
  background(240);
  textAlign(CENTER);
}

function draw() {
  background(240);
  
  // Draw instructions
  fill(0);
  textSize(16);
  text("Click and drag to draw trajectory " + currentTrajectory, width/2, 30);
  text("Press SPACE to switch trajectories", width/2, 60);
  text("Press ENTER to calculate similarity", width/2, 90);
  
  // Draw trajectories
  drawTrajectory(trajectory1, color(255, 0, 0));
  drawTrajectory(trajectory2, color(0, 0, 255));
  
  // Draw current recording
  if (isRecording) {
    stroke(0);
    strokeWeight(2);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
  
  // Display similarity score
  if (similarityScore > 0) {
    text("Similarity Score: " + nf(similarityScore, 0, 2), width/2, height - 30);
  }
}

function drawTrajectory(trajectory, col) {
  if (trajectory.length > 0) {
    stroke(col);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let point of trajectory) {
      vertex(point.x, point.y);
    }
    endShape();
  }
}

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    isRecording = true;
    if (currentTrajectory === 1) {
      trajectory1 = [];
    } else {
      trajectory2 = [];
    }
  }
}

function mouseReleased() {
  isRecording = false;
}

function mouseDragged() {
  if (isRecording) {
    let point = createVector(mouseX, mouseY);
    if (currentTrajectory === 1) {
      trajectory1.push(point);
    } else {
      trajectory2.push(point);
    }
  }
}

function keyPressed() {
  if (keyCode === 32) { // SPACE
    currentTrajectory = currentTrajectory === 1 ? 2 : 1;
  } else if (keyCode === 13) { // ENTER
    if (trajectory1.length > 0 && trajectory2.length > 0) {
      similarityScore = calculateDTW(trajectory1, trajectory2);
    }
  }
}

function calculateDTW(traj1, traj2) {
  let n = traj1.length;
  let m = traj2.length;
  
  // Create cost matrix
  let cost = Array(n + 1).fill().map(() => Array(m + 1).fill(Infinity));
  cost[0][0] = 0;
  
  // Fill cost matrix
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      let dist = p5.Vector.dist(traj1[i-1], traj2[j-1]);
      cost[i][j] = dist + min(cost[i-1][j], cost[i][j-1], cost[i-1][j-1]);
    }
  }
  
  // Normalize the final cost
  return cost[n][m] / (n + m);
}
