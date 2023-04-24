
let hearts = []

let me = null;
let kezia = null;
let flashing = false

const kissShift = 50

function setup() {
  // put setup code here
  createCanvas(windowWidth, windowHeight)
  noStroke()
  textSize(30);

  me = new Shep("red", -100, true)
  kezia = new Shep("blue", 50, false)
}

function draw() {
  // put drawing code here
  background(0,50);
  fill(255);

  if (flashing && new Date().getMilliseconds() % 12 == 0) {
    background(randomColor())
    hearts.push(new Heart())

    for(let i = 0 ; i < 5 ; i ++) {
      text("wow", getRandomArbitrary(0,windowWidth), getRandomArbitrary(0,windowHeight))
      text("i love you", getRandomArbitrary(0,windowWidth), getRandomArbitrary(0,windowHeight))
    }
  }

  for (let i = 0 ; i < hearts.length ; i ++){
      let heart = hearts[i];
      if (heart.y < windowHeight){
        heart.draw()
        heart.update()
      }
  }

  

  me.draw()
  kezia.draw()
}


function addManyHearts() {
  hearts = []
  for (let i = 0 ; i < 100 ; i ++){
    hearts.push(new Heart())
  }

}

function mousePressed() {

  me.x += kissShift
  kezia.x -= kissShift
  flashing = true
  
  background(randomColor())

}

function mouseReleased() {

  me.x -= kissShift
  kezia.x += kissShift

  console.log("here", me.x)

  addManyHearts()

  flashing = false


}


function randomColor(){
  let colors = ["#4287f5","#ff0000", "#42f5ef","#f542f5","#f5d442"]
  return colors[Math.floor(Math.random() * colors.length)]
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

class Heart {
  constructor() {
      
      this.x = windowWidth/2;
      this.y = windowHeight - 100;
      this.vx = getRandomArbitrary(-10, 10);
      this.vy = getRandomArbitrary(-30, 0);
      this.ay = -Math.random();
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



class Shep {
  constructor(color, offset, reflected) {
      
      this.x = windowWidth/2 + offset;
      this.y = windowHeight - 100;
      this.color = color
      this.reflected = reflected
  }
  draw(){
      
      push()
      fill(this.color)
      stroke(255)
      strokeWeight(10)
      

      rect(this.x, this.y, 50, 20)

      strokeWeight(10)

      if (this.reflected){

        rect(this.x + 40, this.y-10, 10, 10)
        rect(this.x + 40, this.y+20, 1, 10)
        rect(this.x + 10, this.y+20, 1, 10)

      }
      else {
        rect(this.x, this.y-10, 10, 10)
        rect(this.x, this.y+20, 1, 10)
        rect(this.x + 40, this.y+20, 1, 10)

      }
      pop()
  }
}