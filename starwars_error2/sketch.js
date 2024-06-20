let turtles = []

let stars = []

function setup() {
  createCanvas(windowWidth, windowHeight);

  // generate stars
  for (let i = 0; i < 100; i++) {
    let angle = Math.random() * TWO_PI;
    let radius = Math.random() * windowHeight / 2;
    stars.push({
      x: windowWidth / 2 + radius * cos(angle),
      y: windowHeight / 2 + radius * sin(angle),
      speed: Math.random() * 5 + 10,
      angle: angle
    });
  }
  background(0);
}

function drawSpace() {
  stroke(255);
  for (let i = 0; i < stars.length - 1; i++) {
    line(stars[i].x, stars[i].y, stars[i].x - (stars[i].speed * cos(stars[i].angle)), stars[i + 1].y);
  }
}

function draw() {
  background(0, 10);

  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    let moveStep = s.speed;
    s.x += moveStep * cos(s.angle);
    s.y += moveStep * sin(s.angle);

    // Reset star position if it moves beyond the screen
    if (s.x < 0 || s.x > windowWidth || s.y < 0 || s.y > windowHeight) {
      let angle = Math.random() * TWO_PI;
      s.x = windowWidth / 2 + 10 * cos(angle);
      s.y = windowHeight / 2 + 10 * sin(angle);
      s.angle = angle;
    }
  }

  drawSpace();
}
