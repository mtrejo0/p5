let colorSliders = [];
let sizeSlider;
let undoButton, clearButton;
let paths = [];
let currentPath = [];
let mouseIsPressed;
let saveButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // Color sliders for R, G, B
  for (let i = 0; i < 3; i++) {
    colorSliders[i] = createSlider(0, 255, Math.random()* 100+100);
    colorSliders[i].position(10, i * 30 + 10);
  }

  // Size slider
  sizeSlider = createSlider(1, 50, 10);
  sizeSlider.position(10, 100);

  // Undo button
  undoButton = createButton('Undo');
  undoButton.position(10, 140);
  undoButton.mousePressed(undoLast);

  // Clear canvas button
  clearButton = createButton('Clear Canvas');
  clearButton.position(10, 170);
  clearButton.mousePressed(clearCanvas);

  saveButton = createButton('Save Canvas');
  saveButton.position(10, 200);
  saveButton.mousePressed(saveCanvas);
}

function draw() {
  noFill();

  console.log(mouseIsPressed)
  if (mouseIsPressed) {
    const point = {
      x: mouseX,
      y: mouseY,
      color: [
        colorSliders[0].value(),
        colorSliders[1].value(),
        colorSliders[2].value(),
      ],
      size: sizeSlider.value(),
    };
    currentPath.push(point);
  }


  redrawCanvas()
}

function mousePressed() {
  currentPath = [];
  paths.push(currentPath);
  mouseIsPressed = true
}

function mouseReleased() {
  // Save the canvas state
  // saveCanvas();
  mouseIsPressed = false


  // add current path to paths
}

function undoLast() {
  if (paths.length > 0) {
    paths.pop();
    redrawCanvas();
  }
}

function clearCanvas() {
  paths = [];
  redrawCanvas();
}

function drawBackground() {
  background(0); // Set the background to white or any base color

  strokeWeight(2)
  let brickWidth = 100; // Width of each brick
  let brickHeight = 50; // Height of each brick
  let rows = height / brickHeight; // Calculate the number of rows based on canvas height
  let cols = width / brickWidth; // Calculate the number of columns based on canvas width

  for (let i = -1; i < rows; i++) {
    for (let j = -1; j < cols; j++) {
      // Offset every other row to create the brick pattern
      let x = j * brickWidth + (i % 2) * (brickWidth / 2);
      let y = i * brickHeight;

      // Check if the brick exceeds the canvas width and adjust its width
      let adjustedBrickWidth = x + brickWidth > width ? width - x : brickWidth;

      // Draw the brick
      fill(173, 98, 65, 255-(i*j)%10); // Brick color
      stroke(99, 49, 33); // Brick border color
      rect(x, y, adjustedBrickWidth, brickHeight);
    }
  }
}

function redrawCanvas() {
  drawBackground()
  for (let path of paths) {
    if (path.length > 1) { // Ensure there are at least two points to draw a line
      for (let i = 0; i < path.length - 1; i++) {
        let point = path[i];
        let nextPoint = path[i + 1];
        
        stroke(point.color[0], point.color[1], point.color[2]);
        strokeWeight(point.size);
        line(point.x, point.y, nextPoint.x, nextPoint.y);
      }
    }
  }
}

function saveCanvas() {
  // Redraw everything before saving to ensure the latest state is captured
  redrawCanvas();
  save('myCanvas.jpg');
}