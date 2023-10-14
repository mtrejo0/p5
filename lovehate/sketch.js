let origin;
let iLoveYouHistory = [];
let iHateYouHistory = [];

let t = 0;
let r = 100;

let tSlider;
let rSlider;
let frameCountSlider;
let randomSlider;
let color = 0;
let spacing = 20
let frameRateValue = 20
let textSizeValue = 18;

// Variable to store the last used method (0 for frameCount, 1 for Math.random)
let lastUsedMethod = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  origin = { x: windowWidth / 2, y: windowHeight - 10 };

  tSlider = createSlider(1, 50, 5);
  tSlider.position(20, 40);


  rSlider = createSlider(50, 300, 250);
  rSlider.position(20, 80);


  frameCountSlider = createSlider(1, 30, 10);
  frameCountSlider.position(20, 120);
  frameCountSlider.changed(() => {
    lastUsedMethod = 0; // Set the last used method to frameCount when frameCountSlider is changed
  });

  randomSlider = createSlider(0, 50, 5);
  randomSlider.position(20, 160);
  randomSlider.changed(() => {
    lastUsedMethod = 1; // Set the last used method to Math.random when randomSlider is changed
  });

  colorMode(HSB, 255);

  frameRate(frameRateValue);

  textSize(textSizeValue)
  
}

function draw() {
  background(0);

  r = rSlider.value();
  let frameCountThreshold = frameCountSlider.value();
  let randomThreshold = randomSlider.value() / 100;

  noFill();
  stroke(255);

  iLoveYouHistory.push(origin.y + Math.sin(t) * r);

  if (frameCount % (31 - frameCountThreshold) == 0 && lastUsedMethod === 0) {
    iHateYouHistory.push(origin.y + Math.sin(t - PI) * r);
  } else if (lastUsedMethod === 1 && Math.random() < randomThreshold) {
    iHateYouHistory.push(origin.y + Math.sin(t - PI) * r);
  } else {
    iHateYouHistory.push(-1000);
  }
  

  for (let i = 1; i < iLoveYouHistory.length; i++) {
    let n = iLoveYouHistory.length - i;
    color = (i * 2) % 255;
    stroke(color, 255, 255);
    fill(color, 255, 255)
    text("i love you.", iLoveYouHistory[i], origin.y - n * spacing);
    text("i hate you.", iHateYouHistory[i], origin.y - n * spacing - spacing/2);
  }

  t += tSlider.value() / 100;
}
