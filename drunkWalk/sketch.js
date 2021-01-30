
let walkers = [];

function setup() {
  // put setup code here

  createCanvas(windowWidth, windowHeight);
  position = createVector(windowWidth/2,windowHeight/2);
  old = createVector(position.x,position.y);
  color = 1;

  speedSlider = createSlider(1, 70, 30);
  speedSlider.position(20, 20);

  lengthSlider = createSlider(1, 70, 30);
  lengthSlider.position(20, 60);

  background("black")
  walkers.push(new RandomWalker())

}

function draw() {
  background(0,2)
  speed = speedSlider.value()
  length = lengthSlider.value()
  frameRate(speed);

  fill(255);
  strokeWeight(1)
  text("Speed", 180, 25);
  text("Length", 180, 65);

  strokeWeight(10)
  for(let i = 0 ; i < walkers.length ; i ++){
    walkers[i].update();
    walkers[i].display();
  }

  if (Math.random() < .01 && walkers.length < 10){
    walkers.push(new RandomWalker())
  }

}


function RandomWalker() {

  this.pos = createVector(windowWidth/2,windowHeight/2);
  this.old = this.pos
  this.color = 1
  this.radius = 1;

  this.update = function()
  {
    let newPos = {"x": 0, "y": 0};
    randomX = random(length);
    randomY = random(length);
    newPos.x = this.pos.x + random(-randomX,randomX);
    newPos.y = this.pos.y + random(-randomY,randomY);

    this.color = (this.color + 1 ) % 100;
    this.old = this.pos;
    this.pos = newPos;
  }

  this.display = function()
  {
    colorMode(HSB, 100);
    stroke(this.color , 255, 255);
    line(this.old.x,this.old.y,this.pos.x,this.pos.y);
  }
}