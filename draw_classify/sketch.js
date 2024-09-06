let classifier;
let canvas;
let label = "";
let confidence = "";

function preload() {
  classifier = ml5.imageClassifier('MobileNet');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  background(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Draw something, then press 'c' to classify", width/2, 20);
}

function draw() {
  if (mouseIsPressed) {
    stroke(0);
    strokeWeight(16);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

function keyPressed() {
  if (key === 'c') {
    classifyCanvas();
  } else if (key === ' ') {
    background(255);
    label = "";
    confidence = "";
    text("Draw something, then press 'c' to classify", width/2, 20);
  }
}

function classifyCanvas() {
  classifier.classify(canvas, gotResult);
}

function gotResult(results, error) {
  if (error) {
    console.error(error);
    return;
  }
  textSize(16);
  strokeWeight(1);
  textAlign(LEFT, TOP);
  let y = 20;
  for (let i = 0; i < results.length; i++) {
    let label = results[i].label;
    let confidence = nf(results[i].confidence, 0, 2);
    text(`${label}: ${confidence}`, 10, y);
    y += 20;
  }
  textAlign(CENTER, CENTER);
}

function mouseDragged() {
  stroke(0);
  strokeWeight(8);
  line(mouseX, mouseY, pmouseX, pmouseY);
}

function mousePressed() {
  stroke(0);
  strokeWeight(8);
  point(mouseX, mouseY);
}
