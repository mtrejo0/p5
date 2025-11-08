let pointCount = 200;
const ITERATIONS_PER_FRAME = 200;

let points = [];
let currentPath = [];
let currentDistance = Infinity;

let bestPath = [];
let bestDistance = Infinity;

let isRunning = false;
let playButton;
let pointCountInput;
let highlightIndices = [];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);

  frameRate(60);
  initPoints();
  randomizePath(true);

  const uiContainer = select('#ui');
  const countLabel = createElement('label', 'Dots:');
  countLabel.parent(uiContainer);
  pointCountInput = createInput(pointCount.toString(), 'number');
  pointCountInput.parent(countLabel);
  pointCountInput.attribute('min', '2');
  pointCountInput.attribute('max', '1000');
  pointCountInput.attribute('step', '1');
  pointCountInput.input(handlePointCountChange);

  playButton = createButton('Play');
  playButton.parent(uiContainer);
  playButton.mousePressed(togglePlay);

  const reshuffleButton = createButton('Reshuffle Path');
  reshuffleButton.parent(uiContainer);
  reshuffleButton.mousePressed(() => randomizePath(true));

  const repointButton = createButton('Regenerate Points');
  repointButton.parent(uiContainer);
  repointButton.mousePressed(() => {
    initPoints();
    randomizePath(true);
  });
}

function draw() {
  background(15);

  if (isRunning) {
    for (let iter = 0; iter < ITERATIONS_PER_FRAME; iter++) {
      tryImprovePath();
    }
  }

  drawPath(bestPath, color(82, 239, 153), 4, 220);
  drawPath(currentPath, color(80, 150, 255), 2, 160);
  drawHighlight();
  drawPoints();
  drawInfo();
}

function initPoints() {
  points = [];
  const padding = 40;
  for (let i = 0; i < pointCount; i++) {
    points.push(createVector(random(padding, width - padding), random(padding, height - padding)));
  }
}

function randomizePath(resetBest = false) {
  currentPath = shuffle([...Array(points.length).keys()]);
  currentDistance = calculateDistance(currentPath);
  highlightIndices = [];

  if (resetBest || currentDistance < bestDistance) {
    bestPath = [...currentPath];
    bestDistance = currentDistance;
  }
}

function togglePlay() {
  isRunning = !isRunning;
  playButton.html(isRunning ? 'Pause' : 'Play');
}

function tryImprovePath() {
  if (points.length < 6) return;

  const indices = new Set();
  while (indices.size < 3) {
    indices.add(floor(random(points.length)));
  }
  const sorted = [...indices].sort((a, b) => a - b);
  const [i, j, k] = sorted;

  if (j - i < 1 || k - j < 1) {
    highlightIndices = [];
    return;
  }

  highlightIndices = [...currentPath.slice(i, j), ...currentPath.slice(j, k)];

  const candidates = threeOptCandidates(currentPath, i, j, k);

  let bestCandidate = null;
  let bestCandidateDistance = currentDistance;

  for (const candidate of candidates) {
    const candidateDistance = calculateDistance(candidate);
    if (candidateDistance < bestCandidateDistance) {
      bestCandidateDistance = candidateDistance;
      bestCandidate = candidate;
    }
  }

  if (bestCandidate && bestCandidateDistance < currentDistance) {
    currentPath = bestCandidate;
    currentDistance = bestCandidateDistance;

    if (bestCandidateDistance < bestDistance) {
      bestPath = [...bestCandidate];
      bestDistance = bestCandidateDistance;
    }
  }
}

function twoOptSwap(path, start, end) {
  const newPath = [
    ...path.slice(0, start),
    ...path.slice(start, end + 1).reverse(),
    ...path.slice(end + 1),
  ];
  return newPath;
}

function threeOptCandidates(path, i, j, k) {
  const A = path.slice(0, i);
  const B = path.slice(i, j);
  const C = path.slice(j, k);
  const D = path.slice(k);

  const revB = [...B].reverse();
  const revC = [...C].reverse();

  const candidates = [];

  // Option 1: 2-opt on B
  candidates.push([...A, ...revB, ...C, ...D]);
  // Option 2: 2-opt on C
  candidates.push([...A, ...B, ...revC, ...D]);
  // Option 3: Reverse both B and C
  candidates.push([...A, ...revB, ...revC, ...D]);
  // Option 4: Swap B and C
  candidates.push([...A, ...C, ...B, ...D]);
  // Option 5: reverse C then append B
  candidates.push([...A, ...revC, ...B, ...D]);
  // Option 6: append C then reversed B
  candidates.push([...A, ...C, ...revB, ...D]);
  // Option 7: reverse C and B order
  candidates.push([...A, ...revC, ...revB, ...D]);

  return candidates;
}

function calculateDistance(path) {
  if (path.length === 0) return Infinity;

  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = points[path[i]];
    const p2 = points[path[i + 1]];
    distance += p5.Vector.dist(p1, p2);
  }
  // close the loop
  const first = points[path[0]];
  const last = points[path[path.length - 1]];
  distance += p5.Vector.dist(last, first);
  return distance;
}

function drawPath(path, strokeColor, weight, alpha) {
  if (path.length === 0) return;
  stroke(red(strokeColor), green(strokeColor), blue(strokeColor), alpha);
  strokeWeight(weight);
  noFill();
  beginShape();
  for (const index of path) {
    const pt = points[index];
    vertex(pt.x, pt.y);
  }
  const first = points[path[0]];
  vertex(first.x, first.y);
  endShape();
}

function drawPoints() {
  noStroke();
  fill(255);
  for (const pt of points) {
    circle(pt.x, pt.y, 10);
  }
}

function drawInfo() {
  noStroke();
  fill(240);
  textAlign(LEFT, TOP);
  textSize(16);
  const lines = [
    `Best Path Length: ${bestDistance.toFixed(2)}`,
  ];
  const lineHeight = 20;
  lines.forEach((line, idx) => {
    text(line, 20, 5 + idx * lineHeight);
  });
}

function handlePointCountChange() {
  const value = parseInt(pointCountInput.value(), 10);
  if (Number.isNaN(value)) {
    return;
  }
  const clamped = constrain(value, 2, 1000);
  pointCount = clamped;
  if (clamped !== value) {
    pointCountInput.value(clamped.toString());
  }
  initPoints();
  randomizePath(true);
}

function drawHighlight() {
  if (highlightIndices.length === 0) return;

  // highlight edges being considered
  stroke(255, 208, 0, 220);
  strokeWeight(4);
  noFill();
  beginShape();
  for (const idx of highlightIndices) {
    const pt = points[idx];
    vertex(pt.x, pt.y);
  }
  endShape();

  // emphasize the points themselves
  noStroke();
  fill(255, 208, 0, 220);
  for (const idx of highlightIndices) {
    const pt = points[idx];
    circle(pt.x, pt.y, 18);
  }
}


