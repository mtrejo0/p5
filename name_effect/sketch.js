let inputBox;
let inputText = "";
let textLayers = [];
let maxLayers = 20;
let modeCheckboxes = [];
let currentMode = 1; // Default to center mode

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 255);
  
  // Create input box at the top
  inputBox = createInput('');
  inputBox.position(20, 20);
  inputBox.size(300, 30);
  inputBox.style('font-size', '16px');
  inputBox.style('padding', '5px');
  inputBox.attribute('placeholder', 'Enter your name here...');
  
  // Create mode checkboxes
  let centerCheckbox = createCheckbox('Mode 1: Center', true);
  centerCheckbox.position(20, 70);
  centerCheckbox.style('color', 'white');
  centerCheckbox.changed(() => {
    if (centerCheckbox.checked()) {
      currentMode = 1;
      cursorCheckbox.checked(false);
      oscillateCheckbox.checked(false);
      randomCheckbox.checked(false);
    }
  });
  
  let cursorCheckbox = createCheckbox('Mode 2: Follow Cursor', false);
  cursorCheckbox.position(20, 100);
  cursorCheckbox.style('color', 'white');
  cursorCheckbox.changed(() => {
    if (cursorCheckbox.checked()) {
      currentMode = 2;
      centerCheckbox.checked(false);
      oscillateCheckbox.checked(false);
      randomCheckbox.checked(false);
    }
  });
  
  let oscillateCheckbox = createCheckbox('Mode 3: Oscillate', false);
  oscillateCheckbox.position(20, 130);
  oscillateCheckbox.style('color', 'white');
  oscillateCheckbox.changed(() => {
    if (oscillateCheckbox.checked()) {
      currentMode = 3;
      centerCheckbox.checked(false);
      cursorCheckbox.checked(false);
      randomCheckbox.checked(false);
    }
  });
  
  let randomCheckbox = createCheckbox('Mode 5: Random Position', false);
  randomCheckbox.position(20, 160);
  randomCheckbox.style('color', 'white');
  randomCheckbox.changed(() => {
    if (randomCheckbox.checked()) {
      currentMode = 5;
      centerCheckbox.checked(false);
      cursorCheckbox.checked(false);
      oscillateCheckbox.checked(false);
    }
  });
  
  modeCheckboxes.push(centerCheckbox, cursorCheckbox, oscillateCheckbox, randomCheckbox);
  
  // Update inputText when user types
  inputBox.input(() => {
    inputText = inputBox.value();
    // Add new text layer when text changes
    if (inputText.length > 0) {
      addTextLayer();
    }
  });
}

function draw() {
  background(0);
  
  // Update and draw all text layers (from back to front)
  for (let i = textLayers.length - 1; i >= 0; i--) {
    let layer = textLayers[i];
    
    // Update layer properties
    layer.size += layer.growthRate;
    layer.alpha -= layer.fadeRate;
    
    // Update position for oscillate mode
    if (currentMode === 3) {
      layer.y = windowHeight / 2 + sin(frameCount * 0.05 + layer.timeOffset) * 100;
    }
    
    // Remove layers that are too faded
    if (layer.alpha <= 0) {
      textLayers.splice(i, 1);
      continue;
    }
    
    // Draw the text layer with HSV color (using original hue)
    fill(layer.hue, 80, 100, layer.alpha);
    textAlign(CENTER, CENTER);
    textSize(layer.size);
    text(layer.text, layer.x, layer.y);
  }
  
  // Add new layers periodically if there's text
  if (inputText.length > 0 && frameCount % 10 === 0) {
    addTextLayer();
  }
}

function addTextLayer() {
  // Remove oldest layer if we have too many
  if (textLayers.length >= maxLayers) {
    textLayers.shift();
  }
  
  // Determine position based on current mode
  let x, y;
  if (currentMode === 1) {
    // Center mode
    x = windowWidth / 2;
    y = windowHeight / 2;
  } else if (currentMode === 2) {
    // Cursor mode
    x = mouseX;
    y = mouseY;
  } else if (currentMode === 3) {
    // Oscillate mode
    x = windowWidth / 2;
    y = windowHeight / 2; // Initial position, will be updated in draw()
  } else if (currentMode === 5) {
    // Random position mode
    x = random(windowWidth);
    y = random(windowHeight);
  }
  
  // Add new layer at the front (smallest)
  textLayers.push({
    text: inputText,
    size: 20,
    alpha: 255,
    growthRate: 2,
    fadeRate: 3,
    hue: frameCount % 360, // Start with current frame-based hue and keep it
    x: x,
    y: y,
    timeOffset: frameCount * 0.1 // Add time offset for oscillation variation
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
