const ITERATIONS_PER_FRAME = 40;
const MAX_ALLOWED_COLORS = 20;

let nodeCount = 18;
let nodes = [];
let adjacency = [];
let edgeCount = 0;

let currentColors = [];
let solver = null;
let isRunning = false;
let isSolved = false;

let playButton;
let nodeCountInput;
let colorCountInput;
let highlightNode = null;
let highlightNeighbors = [];
let highlightMode = 'assign';
let statusMessage = 'Ready';

let maxColors = 6;

const colorPalette = [
  '#ff6b6b',
  '#feca57',
  '#48dbfb',
  '#1dd1a1',
  '#5f27cd',
  '#ee5253',
  '#ff9ff3',
  '#54a0ff',
  '#00d2d3',
  '#ffaf40',
  '#10ac84',
  '#c8d6e5',
  '#576574',
  '#ff8c00',
  '#ff1493',
  '#20c997',
  '#ffa502',
  '#3742fa',
  '#2ed573',
  '#ff4757',
];
const neutralColor = '#202534';

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.body);

  frameRate(60);

  initGraph(true);

  const uiContainer = select('#ui');

  const countLabel = createElement('label', 'Nodes:');
  countLabel.parent(uiContainer);
  nodeCountInput = createInput(nodeCount.toString(), 'number');
  nodeCountInput.parent(countLabel);
  nodeCountInput.attribute('min', '3');
  nodeCountInput.attribute('max', '4000');
  nodeCountInput.attribute('step', '1');
  nodeCountInput.input(handleNodeCountChange);

  const colorLabel = createElement('label', 'Colors:');
  colorLabel.parent(uiContainer);
  colorCountInput = createInput(maxColors.toString(), 'number');
  colorCountInput.parent(colorLabel);
  colorCountInput.attribute('min', '2');
  colorCountInput.attribute('max', MAX_ALLOWED_COLORS.toString());
  colorCountInput.attribute('step', '1');
  colorCountInput.input(handleColorCountChange);

  playButton = createButton('Play');
  playButton.parent(uiContainer);
  playButton.mousePressed(togglePlay);

  const randomizeButton = createButton('Randomize Graph');
  randomizeButton.parent(uiContainer);
  randomizeButton.mousePressed(() => {
    initGraph(false);
  });

  const layoutButton = createButton('Regenerate Layout');
  layoutButton.parent(uiContainer);
  layoutButton.mousePressed(() => {
    initGraph(true);
  });
}

function draw() {
  background(12);

  if (isRunning) {
    for (let iter = 0; iter < ITERATIONS_PER_FRAME && isRunning; iter++) {
      stepSolver();
    }
  }

  drawEdges();
  drawNodes();
  drawInfo();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function initGraph(regeneratePositions) {
  if (regeneratePositions || nodes.length !== nodeCount) {
    nodes = [];
    const padding = 60;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(createVector(random(padding, width - padding), random(padding, height - padding)));
    }
  }

  generateEdges();

  currentColors = new Array(nodeCount).fill(-1);
  solver = null;
  isSolved = false;
  isRunning = false;
  playButton && playButton.html('Play');

  highlightNode = null;
  highlightNeighbors = [];
  statusMessage = 'Ready';
}

function generateEdges() {
  adjacency = Array.from({ length: nodeCount }, () => new Set());
  edgeCount = 0;

  // ensure connectivity by connecting each node to a previous node
  for (let i = 1; i < nodeCount; i++) {
    const target = floor(random(i));
    addEdge(i, target);
  }

  const baseProbability = constrain(3 / nodeCount, 0.12, 0.45);

  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (random() < baseProbability) {
        addEdge(i, j);
      }
    }
  }

  adjacency = adjacency.map((set) => Array.from(set));
}

function addEdge(a, b) {
  if (a === b) return;
  if (adjacency[a].has && adjacency[a].has(b)) return;

  adjacency[a].add(b);
  adjacency[b].add(a);
  edgeCount++;
}

function togglePlay() {
  if (isSolved) {
    resetSolver();
  }

  isRunning = !isRunning;

  if (isRunning && !solver) {
    solver = createColoringGenerator();
    statusMessage = 'Solving…';
  } else if (!isRunning && !isSolved) {
    statusMessage = 'Paused';
  }

  playButton.html(isRunning ? 'Pause' : 'Play');
}

function resetSolver() {
  currentColors = new Array(nodeCount).fill(-1);
  solver = null;
  isSolved = false;
  isRunning = false;
  playButton.html('Play');
  highlightNode = null;
  highlightNeighbors = [];
  highlightMode = 'assign';
  statusMessage = 'Ready';
}

function stepSolver() {
  if (!solver) {
    solver = createColoringGenerator();
    statusMessage = 'Solving…';
  }

  const { value, done } = solver.next();

  if (done) {
    if (value && value.type === 'fail') {
      statusMessage = 'No solution with current palette.';
    }
    isRunning = false;
    playButton.html('Play');
    return;
  }

  if (!value) return;

  currentColors = value.assignment;
  highlightNode = value.node ?? null;
  highlightNeighbors = highlightNode !== null ? adjacency[highlightNode] : [];
  highlightMode = value.type;

  if (value.type === 'success') {
    isSolved = true;
    isRunning = false;
    playButton.html('Play');
    const used = countUsedColors();
    statusMessage = `Solved using ${used} color${used === 1 ? '' : 's'}.`;
    highlightNode = null;
    highlightNeighbors = [];
  } else if (value.type === 'assign') {
    statusMessage = `Assigning node ${value.node + 1}…`;
  } else if (value.type === 'backtrack') {
    statusMessage = `Backtracking from node ${value.node + 1}…`;
  }
}

function createColoringGenerator() {
  const order = [...Array(nodeCount).keys()].sort(
    (a, b) => adjacency[b].length - adjacency[a].length
  );
  const assignment = new Array(nodeCount).fill(-1);
  const triedColors = new Array(order.length).fill(0);

  return (function* () {
    let index = 0;

    while (index >= 0) {
      if (index === order.length) {
        yield {
          type: 'success',
          assignment: [...assignment],
          node: null,
        };
        return { type: 'success', assignment: [...assignment] };
      }

      const node = order[index];
      let assigned = false;

      for (let colorIdx = triedColors[index]; colorIdx < maxColors; colorIdx++) {
        if (isColorValid(node, colorIdx, assignment)) {
          assignment[node] = colorIdx;
          triedColors[index] = colorIdx + 1;
          index++;
          yield {
            type: 'assign',
            assignment: [...assignment],
            node,
          };
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        assignment[node] = -1;
        triedColors[index] = 0;
        index--;

        if (index < 0) {
          yield {
            type: 'fail',
            assignment: [...assignment],
            node: null,
          };
          return { type: 'fail' };
        }

        const prevNode = order[index];
        yield {
          type: 'backtrack',
          assignment: [...assignment],
          node: prevNode,
        };
      }
    }
  })();
}

function isColorValid(node, colorIdx, assignment) {
  for (const neighbor of adjacency[node]) {
    if (assignment[neighbor] === colorIdx) {
      return false;
    }
  }
  return true;
}

function drawEdges() {
  strokeWeight(2);
  for (let i = 0; i < nodeCount; i++) {
    for (const neighbor of adjacency[i]) {
      if (neighbor <= i) continue;

      const isHighlighted =
        highlightNode !== null &&
        (i === highlightNode || neighbor === highlightNode);

      stroke(isHighlighted ? 'rgba(255, 208, 0, 0.8)' : 'rgba(90, 90, 120, 0.5)');
      line(nodes[i].x, nodes[i].y, nodes[neighbor].x, nodes[neighbor].y);
    }
  }
}

function drawNodes() {
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(14);

  for (let i = 0; i < nodeCount; i++) {
    const assignment = currentColors[i];
    const isFocused = highlightNode === i;
    const fillColor =
      assignment >= 0 ? colorPalette[assignment % colorPalette.length] : neutralColor;

    stroke(isFocused ? (highlightMode === 'backtrack' ? '#ff5c93' : '#ffd000') : '#111');
    strokeWeight(isFocused ? 4 : 2);
    fill(fillColor);
    circle(nodes[i].x, nodes[i].y, isFocused ? 38 : 32);

    noStroke();
    fill(12);
    text(i + 1, nodes[i].x, nodes[i].y + 1);
  }
}

function drawInfo() {
  const used = countUsedColors();
  const lines = [
    `Nodes: ${nodeCount}`,
    `Edges: ${edgeCount}`,
    `Used Colors: ${used}`,
    `Palette Size: ${maxColors}`,
    `Status: ${statusMessage}`,
    '',
    'Controls:',
    ' - Play/Pause to run the solver',
    ' - Randomize Graph to keep layout but change edges',
    ' - Regenerate Layout to reposition nodes',
    ' - Adjust Nodes input for different sizes',
  ];

  noStroke();
  fill(235);
  textAlign(LEFT, TOP);
  textSize(16);
  const lineHeight = 20;
  lines.forEach((line, idx) => {
    text(line, 20, 20 + idx * lineHeight);
  });
}

function countUsedColors() {
  const used = new Set();
  for (const value of currentColors) {
    if (value >= 0) {
      used.add(value);
    }
  }
  return used.size;
}

function handleNodeCountChange() {
  const value = parseInt(nodeCountInput.value(), 10);
  if (Number.isNaN(value)) {
    return;
  }
  const clamped = constrain(value, 3, 4000);
  nodeCount = clamped;
  if (clamped !== value) {
    nodeCountInput.value(clamped.toString());
  }
  initGraph(true);
}

function handleColorCountChange() {
  const value = parseInt(colorCountInput.value(), 10);
  if (Number.isNaN(value)) {
    return;
  }

  const clamped = constrain(value, 2, MAX_ALLOWED_COLORS);
  maxColors = clamped;
  if (clamped !== value) {
    colorCountInput.value(clamped.toString());
  }

  resetSolver();
  statusMessage = 'Palette updated. Ready';
}

