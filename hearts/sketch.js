
let hearts = []
let pos = { "x" : 500, "y": 500}

function setup() {
  // put setup code here
  createCanvas(windowWidth, windowHeight)
  noStroke()
  textSize(30);
  for (let i = 0 ; i < 100 ; i ++){
    hearts.push(new Heart())
  }
}

function draw() {
  // put drawing code here
  background(255,50);
  fill(255);
        
  pos.x += getRandomArbitrary(-10, 10);
  pos.y += getRandomArbitrary(-10, 10);
  
  fill("red")
  text("I LOVE YOU", pos.x, pos.y);

  for (let i = 0 ; i < hearts.length ; i ++){
      let heart = hearts[i];
      heart.draw()
      heart.update()
      if (heart.y > 1000){
          hearts[i] = new Heart()
      }
  }
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
      
      this.x = Math.random()*1500;
      this.y = Math.random()*500;
      this.vx = getRandomArbitrary(-10, 10);
      this.vy = getRandomArbitrary(-30, 0);
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

      // if (Math.random() < .001){
      //     let newHeart = new Heart()
      //     newHeart.x = this.x
      //     newHeart.y = this.y
      //     newHeart.vx = -this.vx
      //     newHeart.vy = this.vy / 2
      //     newHeart.vy = this.vy
      //     hearts.push(newHeart)
      // }

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