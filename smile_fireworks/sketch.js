// ml5 Face Detection Model
let faceapi;
let detections = [];

// Video
let video;

// Smile detection
let isSmiling = false;

// Hearts
let hearts = [];
let pos = { "x": 500, "y": 500 };

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create the video and start face tracking
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the video element
  // Need landmarks and expressions for smile detection
  const faceOptions = { withLandmarks: true, withExpressions: true, withDescriptors: false };
  faceapi = ml5.faceApi(video, faceOptions, faceReady);

  // Initialize hearts
  for (let i = 0; i < 100; i++) {
    hearts.push(new Heart());
  }
}

// Start detecting faces
function faceReady() {
  faceapi.detect(gotFaces);
}

// Got faces
function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
}

// Check if smiling
function checkSmile(expressions) {
  return expressions.happy > 0.7; // Adjust threshold as needed
}

// Draw everything
function draw() {
  // Display the video
  image(video, 0, 0, width, height);

  // Just look at the first face and draw all the points
  if (detections.length > 0) {
    let points = detections[0].landmarks.positions;
    for (let i = 0; i < points.length; i++) {
      push()
      stroke(161, 95, 251);
      strokeWeight(4);
      point(points[i]._x, points[i]._y);
      pop()
    }

    // Check for smile
    isSmiling = checkSmile(detections[0].expressions);

    // Draw hearts if smiling
    if (isSmiling) {
      background(255, 50);
      
      pos.x += getRandomArbitrary(-10, 10);
      pos.y += getRandomArbitrary(-10, 10);
      
      fill("red");
      textSize(32);
      textAlign(CENTER, CENTER);
      text("smile", width / 2, height / 2);

      for (let i = 0; i < hearts.length; i++) {
        let heart = hearts[i];
        heart.draw();
        heart.update();
        if (heart.y > height) {
          hearts[i] = new Heart();
        }
      }
    }
  }
}

function randomColor() {
  let colors = ["#4287f5", "#ff0000", "#42f5ef", "#f542f5", "#f5d442"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

class Heart {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = getRandomArbitrary(-10, 10);
    this.vy = getRandomArbitrary(-30, 0);
    this.ay = Math.random();
    this.color = randomColor();
    this.streak = [[this.x, this.y]];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.ay;

    this.streak.push([this.x, this.y]);
    
    if (this.streak.length > 10) {
      this.streak.shift();
    }

    if (Math.random() < .05) {
      this.color = randomColor();
    }
  }

  draw() {
    fill(this.color);

    for (let i = 0; i < this.streak.length; i++) {
      let coord = this.streak[i];
      circle(coord[0], coord[1], i);
    }

    beginShape();
    vertex(this.x, this.y);
    vertex(this.x + 10, this.y - 10);
    vertex(this.x + 15, this.y);
    vertex(this.x, this.y + 15);
    vertex(this.x - 15, this.y);
    vertex(this.x - 10, this.y - 10);
    endShape(CLOSE);
  }
}