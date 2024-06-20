let turtles = []

let stars = []

function setup() {
  createCanvas(windowWidth, windowHeight);

  // generate stars
  for (let i = 0; i < 300; i++) {
    let angle = Math.random() * TWO_PI;
    let radius = (Math.random() * windowHeight / 2) + 100;
    stars.push({
      x: windowWidth / 2 + radius * cos(angle),
      y: windowHeight / 2 + radius * sin(angle),
      speed: 0, // Start with 0 speed
      angle: angle,
      maxSpeed: Math.random() * 5 + 10, // Maximum speed the star can reach
    });
  }
  background(0);
}

function drawSpace() {
  for (let i = 0; i < stars.length - 1; i++) {
    let radius = dist(stars[i].x, stars[i].y, windowWidth / 2, windowHeight / 2);
    let grayValue = map(radius, 0, windowHeight / 2, 0, 255);
    stroke(grayValue);
    strokeWeight(5);
    line(stars[i].x, stars[i].y, stars[i].x - (stars[i].speed * cos(stars[i].angle)), stars[i].y - (stars[i].speed * sin(stars[i].angle)));
  }
}

function draw() {
  background(0, 10);

  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    // Increase speed based on distance from center
    let distance = dist(s.x, s.y, windowWidth / 2, windowHeight / 2);
    s.speed = map(distance, 0, windowHeight / 2, 0, s.maxSpeed);

    s.x += s.speed * cos(s.angle);
    s.y += s.speed * sin(s.angle);

    // Reset star position if it moves beyond the screen
    if (s.x < 0 || s.x > windowWidth || s.y < 0 || s.y > windowHeight) {
      let angle = Math.random() * TWO_PI;
      let radius = (Math.random() * 100) + 90;
      s.x = windowWidth / 2 + radius * cos(angle)
      s.y = windowHeight / 2 + radius * sin(angle),
      s.angle = angle;
      s.speed = 0; // Reset speed to 0
    }
  }

  drawSpace();
}
