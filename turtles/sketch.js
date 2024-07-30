let turtles = []

let stars = []

let t = 0

function setup() {
  createCanvas(windowWidth, windowHeight);

  

  // generate stars
  for (let i = 0; i < 100; i++) {
    stars.push({x: Math.random() * windowWidth, y: Math.random() * windowHeight, r: Math.random() * 5})
  }

  // initial turtles
  for (let i = 0; i < 20; i++) {
    turtles.push(new Turtle(windowWidth/2, windowHeight/2 + i * 50, i / 100))
  } 

  turtles[0].earth = true

  
  
}

function drawSpace() {

  fill(255)
  background(0)
  stars.forEach(star => {

    ellipse(star.x, star.y, star.r)
  });

}

function draw() {
  drawSpace()

  for (let i = turtles.length-1; i >=0 ; i--) {
    const turtle = turtles[i];
    turtle.update()

    turtle.draw()

    if (turtle.pos.y < -100) {
      turtles.splice(i, 1);
    }
    
  }

  push()
  colorMode(HSB)
  fill(t%255, 255,255)
  textSize(32)
  text("TURTLES ALL THE WAY DOWN", windowWidth/2 + 200 , 100)
  pop()

  if (t % 5 == 0) {
    turtles.push(new Turtle( windowWidth/2, windowHeight + 100, t))
  }
  t += 1
}



class Turtle {
  constructor(x, y, t) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, -10);
    this.color = color(0, 255, 0); // Green color that changes with t
    this.earth = false
  }

  update() {
    this.pos.add(this.vel);
  }

  draw() {
    

    if (this.earth) {

      strokeWeight(5)
      stroke(0)
      fill("blue");
      ellipse(this.pos.x, this.pos.y, 100, 100); 
      strokeWeight(0)

      // Draw continents
      fill("green"); // Continent color

      // Continent 1
      beginShape();
      curveVertex(this.pos.x - 40, this.pos.y + 10);
      curveVertex(this.pos.x - 30, this.pos.y - 10);
      curveVertex(this.pos.x - 20, this.pos.y - 30);
      curveVertex(this.pos.x-10, this.pos.y - 10);
      curveVertex(this.pos.x - 15, this.pos.y + 20);
      endShape(CLOSE);

      // Continent 2
      beginShape();
      curveVertex(this.pos.x + 10, this.pos.y - 20);
      curveVertex(this.pos.x + 20, this.pos.y - 40);
      curveVertex(this.pos.x + 40, this.pos.y - 20);
      curveVertex(this.pos.x + 30, this.pos.y + 10);
      curveVertex(this.pos.x + 15, this.pos.y + 20);
      endShape(CLOSE);

      // Continent 3
      beginShape();
      curveVertex(this.pos.x + 5, this.pos.y + 10);
      curveVertex(this.pos.x + 15, this.pos.y + 30);
      curveVertex(this.pos.x + 25, this.pos.y + 20);
      curveVertex(this.pos.x + 20, this.pos.y + 5);
      curveVertex(this.pos.x + 10, this.pos.y);
      endShape(CLOSE);

      // Draw clouds
      fill(255, 255, 255, 150); // Cloud color (semi-transparent white)
      ellipse(this.pos.x + 20, this.pos.y - 20, 30, 20);
      ellipse(this.pos.x - 30, this.pos.y, 40, 20);

      // Reset drawing settings
      noStroke();

      return
    }
    console.log(this.color)
    fill(this.color);
    strokeWeight(5)
    stroke(0)
    ellipse(this.pos.x, this.pos.y, 100, 50); // Drawing the turtle as an ellipse
    ellipse(this.pos.x-50, this.pos.y, 50, 20);
    ellipse(this.pos.x-30, this.pos.y+20, 20, 10);
    ellipse(this.pos.x+30, this.pos.y+20, 20, 10);
    noStroke();
  }
}

