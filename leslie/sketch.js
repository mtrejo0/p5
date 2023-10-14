let angle = 0;
let earthRadius = 250;
let moonRadius = 40;
let sunRadius = 50;
let paused = true;
let events = [
  { date: "1999-08-24", text: "Leslie is born!", seen: false },
  { date: "2000-06-17", text: "Moises is born!" , seen: false},
  { date: "2012-08-24", text: "Leslie can have babies!", seen: false },
  { date: "2017-08-01", text: "Leslie starts college at UTA!", seen: false },
  { date: "2017-08-24", text: "Leslie is a legal adult ... but Moises is not ...", seen: false },
  { date: "2018-06-17", text: "Moises is a legal adult" , seen: false},
  { date: "2021-05-01", text: "Leslie graduates from UTA!", seen: false },
  { date: "2022-05-01", text: "Moises graduates from MIT!", seen: false },
  { date: "2023-08-18", text: "Moises sends Leslie a fake story about how they met" , seen: false},
  { date: "2023-02-01", text: "Lelie does coca cola!", seen: false },
  { date: "2023-08-19", text: "Date #1: We went to Sixty Vines and Te Deseo :)", seen: false },
  { date: "2023-08-20", text: "Date #2: We went to White Rock and The GOAT", seen: false },
  { date: "2023-08-24", text: "Leslie turns 24!! happy birdthay queen :) <3", seen: false },
];
let eventAngles = [];  // Angles corresponding to the event dates
let stars = [];


let leslieBirthDate = new Date("1999-08-24").getTime();
let moisesBirthDate = new Date("2000-06-17").getTime();

let confetti = [];


function setup() {
  createCanvas(windowWidth, windowHeight);

  textSize(16);
  textAlign(CENTER);

  for (let year = 2000; year <= 2023; year += 5) {
    events.push({ date: `${year}-08-24`, text: `Leslie turns ${year-1999}!`, seen: false });
    if(year > 2000)
    events.push({ date: `${year}-06-17`, text: `Moises turns ${year-2000}!`, seen: false });
  }


  // Map event dates to angles
  let startDate = new Date("1999-08-24").getTime();
  let endDate = new Date("2000-08-24").getTime();
  for (let i = 0; i < events.length; i++) {
    let eventDate = new Date(events[i].date);
    let eventAngle = map(eventDate.getTime(), startDate, endDate, 0, TWO_PI);
    eventAngles.push(eventAngle);
  }

 
    // Create 500 stars
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: random(width),  // Initial x position
        y: random(height), // Initial y position
        size: random(1, 3) // Star size
      });
    }
}

function draw() {
  background(0);

  // Move stars to the right
  for (let i = 0; i < stars.length; i++) {
    if (!paused)
      stars[i].x += stars[i].size/5;
    if (stars[i].x > width) {
      stars[i].x = 0;
    }
    fill(255);
    noStroke();
    ellipse(stars[i].x, stars[i].y, stars[i].size);
  }

  translate(width / 2, height / 2);

  text("Leslie's age: " + (angle / TWO_PI).toFixed(1), 0, 300);
  text("Moises's age: " + ((angle) / TWO_PI - 0.82).toFixed(1), 0, 350);

  let step = TWO_PI / 36.5;
  if (!paused) {
    angle += step;
  }

  let sunX = 0;
  let sunY = 0;

  let earthX = cos(angle) * earthRadius;
  let earthY = sin(angle) * earthRadius;

  let moonX = earthX + cos(angle * 13) * moonRadius;
  let moonY = earthY + sin(angle * 13) * moonRadius;
  

  push()
  noFill()
  stroke(100)
  ellipse(sunX, sunY, earthRadius * 2)
  pop()

  fill(255, 223, 0);
  ellipse(sunX, sunY, sunRadius * 2, sunRadius * 2);

  fill(0, 102, 255);
  ellipse(earthX, earthY, 20, 20);

  push()
  noFill()
  stroke(100)
  ellipse(earthX, earthY, moonRadius * 2)
  pop()

  fill(200);
  ellipse(moonX, moonY, 10, 10);

  if (angle > 25 * TWO_PI) {

    text("And they live happily ever after <3", 0, 100);

  }

  // Set vertical offset for event text
  let yOffset = -300;

  for (let i = 0; i < eventAngles.length; i++) {
    if (abs(angle - eventAngles[i]) < step ) {
      
      text(events[i].text, 0, yOffset);
      text(events[i].date, 0, yOffset + 25);
      
      yOffset += 70; // Increase the vertical spacing between text

      if (!events[i].seen) {
        paused = true;
        events[i].seen = true
        celebrate()
      }
      
    }
  }

    // Update and draw confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      confetti[i].update();
      confetti[i].draw();
      if (confetti[i].y > height) {
        confetti.splice(i, 1);
      }
    }
}


function keyPressed() {
    paused = !paused;
}

function mousePressed() {
  paused = !paused;
}


function celebrate() {
  for (let i = 0; i < 50; i++) {
    confetti.push(new Confetti());
  }
}


function randomColor(){
  let colors = ["#4287f5","#ff0000", "#42f5ef","#f542f5","#f5d442"]
  return colors[Math.floor(Math.random() * colors.length)]
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}


class Confetti {
  constructor() {
      
      this.x = 0;
      this.y = 0;
      this.vx = getRandomArbitrary(-10, 10);
      this.vy = getRandomArbitrary(-30, -10);
      this.ay = Math.random();
      this.color = randomColor()
      this.streak = [[this.x,this.y]]
  }
  update() {
      this.x += this.vx
      this.y += this.vy
      this.vy += this.ay

      this.streak.push([this.x,this.y])
      
      if (this.streak.length > 10){
          this.streak.shift()
      }

      if (Math.random() < .05){
          this.color = randomColor();
      }

  }
  draw(){
      

      fill(this.color)
      

      for(let i = 0 ; i < this.streak.length; i ++){
          let coord = this.streak[i]
          circle(coord[0],  coord[1], i);
      }

      beginShape();
      vertex(this.x, this.y);
      vertex(this.x+10, this.y-10);
      vertex(this.x+15, this.y);
      vertex(this.x, this.y+15);
      vertex(this.x-15, this.y);
      vertex(this.x-10, this.y-10);
      endShape(CLOSE);
      
      
      
      
      
      

  }
}