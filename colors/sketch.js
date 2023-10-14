// Global variables
let gridSize = 20;
let frameRateSlider;
let xSlider;
let ySlider;
let xSlider2;
let ySlider2;
let xSlider3;
let ySlider3;
let frameRateLabel;
let xLabel;
let yLabel;
let xLabel2;
let yLabel2;
let xLabel3;
let gridSizeSlider;
let gridSizeLabel;
let hueValueLowerSlider;
let hueValueUpperSlider;
let hueValueLowerLabel;
let hueValueUpperLabel;

let randomnessSlider;
let randomnessLabel;

// Setup function
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255); // Switch to HSV color mode

  // Create frame rate slider
  frameRateSlider = createSlider(1, 60, 30);
  frameRateSlider.position(10, 10);
  frameRateSlider.style('width', '80px');

  // Create x-slider
  xSlider = createSlider(0, 100, 1);
  xSlider.position(10, 40);
  xSlider.style('width', '80px');

  // Create y-slider
  ySlider = createSlider(0, 100, 1);
  ySlider.position(10, 70);
  ySlider.style('width', '80px');

  // Create x-slider 2
  xSlider2 = createSlider(0, 100, 0);
  xSlider2.position(10, 100);
  xSlider2.style('width', '80px');

  // Create y-slider 2
  ySlider2 = createSlider(0, 100, 0);
  ySlider2.position(10, 130);
  ySlider2.style('width', '80px');

  // Create x-slider 3
  xSlider3 = createSlider(0, 1, 0, 0.01);
  xSlider3.position(10, 160);
  xSlider3.style('width', '80px');

  // Create y-slider 3
  ySlider3 = createSlider(0, 1, 0, 0.01);
  ySlider3.position(10, 190);
  ySlider3.style('width', '80px');

  // Create labels for sliders
  frameRateLabel = createElement('label', 'Frame Rate');
  frameRateLabel.position(100, 10);

  xLabel = createElement('label', 'X');
  xLabel.position(100, 40);

  yLabel = createElement('label', 'Y');
  yLabel.position(100, 70);

  xLabel2 = createElement('label', 'X^2');
  xLabel2.position(100, 100);

  yLabel2 = createElement('label', 'Y^2');
  yLabel2.position(100, 130);

  xLabel3 = createElement('label', 'X^3');
  xLabel3.position(100, 160);

  yLabel3 = createElement('label', 'Y^3');
  yLabel3.position(100, 190);

  // Create grid size slider
  gridSizeSlider = createSlider(10, 100, gridSize);
  gridSizeSlider.position(10, 220);
  gridSizeSlider.style('width', '80px');

  // Create label for grid size slider
  gridSizeLabel = createElement('label', 'Grid Size');
  gridSizeLabel.position(100, 220);

  // Create hue value lower slider
  hueValueLowerSlider = createSlider(0, 255, 0);
  hueValueLowerSlider.position(10, 250);
  hueValueLowerSlider.style('width', '80px');

  // Create hue value upper slider
  hueValueUpperSlider = createSlider(0, 255, 255);
  hueValueUpperSlider.position(10, 280);
  hueValueUpperSlider.style('width', '80px');

  // Create labels for hue value sliders
  hueValueLowerLabel = createElement('label', 'Hue Lower');
  hueValueLowerLabel.position(100, 250);

  hueValueUpperLabel = createElement('label', 'Hue Upper');
  hueValueUpperLabel.position(100, 280);

  // Create random value slider
  randomnessSlider = createSlider(0, 255, 0);
  randomnessSlider.position(10, 310);
  randomnessSlider.style('width', '80px');

  randomnessLabel = createElement('label', 'Randomness');
  randomnessLabel.position(100, 310);


  // Set initial frame rate
  frameRate(frameRateSlider.value());

  // Set up the grid
  renderGrid();
}

// Draw function
function draw() {
  // Set frame rate based on slider value
  frameRate(frameRateSlider.value());
  renderGrid();
}

// Render grid
function renderGrid() {
  gridSize = gridSizeSlider.value();
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      const hueValue =
        (randomnessSlider.value() * Math.random() + 10 * frameCount +
          x * xSlider.value() +
          y * ySlider.value() +
          Math.pow(x, 2) * xSlider2.value() +
          Math.pow(y, 2) * ySlider2.value() +
          Math.pow(x, 3) * xSlider3.value() +
          Math.pow(y, 3) * ySlider3.value()) %
        255;
      const mappedHueValue = map(
        hueValue,
        0,
        255,
        hueValueLowerSlider.value(),
        hueValueUpperSlider.value()
      );
      fill(mappedHueValue, 255, 255);
      noStroke();
      rect(x, y, gridSize, gridSize);
    }
  }
}

// Resize canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  renderGrid();
}

// Start the game
setup();
