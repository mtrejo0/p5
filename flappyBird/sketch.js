

var bird;
var pipes = [];
var gravity = .1;
var time ;
var game;
var birdImg;
var start;
var score;

function setup() {
  // put setup code here
 createCanvas(windowWidth,windowHeight);
 bird = new flap(windowWidth/2,windowHeight/2);
 time = 0;
 game = true;
 start = false;
 score = 25;
 noStroke();


}



function keyPressed()
{
  if (keyCode === 32) {
    bird.vel.y=-10;
  }
  if(!start)
  {
    start = true;
  }


}
function mousePressed()
{

    bird.vel.y=-10;

  if(!start)
  {
    start = true;
  }
}


function draw() {

  createCanvas(windowWidth,windowHeight);
  if(!start){
  background("cyan");
  bird.display();
  fill("lime");
    rectMode(CENTER);
    rect(windowWidth/2,windowHeight-20,windowWidth,100)
    fill("black");
    textSize(30);
    text("Play Blappy Fird", windowWidth/2-100,windowHeight/3);

  }




  if(start)
  {

    background("cyan");


    bird.update();
    bird.display();

    for (var i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();
      pipes[i].display();

      if(bird.intersects(pipes[i]))
      {
        game = false;
      }

      if(pipes[i].pos.x+pipes[i].size<0)
      {
        pipes.splice(i,1);

      }
      if(bird.bA.x>=pipes[i].pos.x+pipes[i].size && bird.bA.x<=pipes[i].pos.x+pipes[i].size*2)
      {
        score++;
      }

    }



    if(bird.bD.y>windowHeight-50)
    {
      game = false;
    }

    if(time % 250 == 0)
    {
      pipes.push(new pipe(windowWidth,random(windowHeight/2-200,windowHeight/2+200)));
    }

    time++;
    fill("lime");
    rectMode(CENTER);
    rect(windowWidth/2,windowHeight-20,windowWidth,100)

    fill("black");
    textSize(30);
    text("Score: " + ((score/26|0)), windowWidth/6,75);


    if(!game)
    {
      background("cyan");
      fill("lime");
      rectMode(CENTER);
      rect(windowWidth/2,windowHeight-20,windowWidth,100)
      fill("black");
      textSize(30);
      text("Max Score: " + (score/26|0), windowWidth/2-100,windowHeight/2);
      noLoop()

    }

  }





}

function flap(x,y)
{
  this.pos = createVector(x,y);
  this.vel = createVector(0,0);
  this.acc = createVector(0,.5);
  this.size = 20;
  this.bA = createVector(this.pos.x-this.size/2, this.pos.y-this.size/2)
  this.bB = createVector(this.pos.x-this.size/2, this.pos.y+this.size/2)
  this.bC = createVector(this.pos.x+this.size/2, this.pos.y-this.size/2)
  this.bD = createVector(this.pos.x+this.size/2, this.pos.y+this.size/2)

  this.update = function()
  {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
  this.pos.x = windowWidth/2
  this.bA = createVector(this.pos.x-this.size/2, this.pos.y-this.size/2)
  this.bB = createVector(this.pos.x-this.size/2, this.pos.y+this.size/2)
  this.bC = createVector(this.pos.x+this.size/2, this.pos.y-this.size/2)
  this.bD = createVector(this.pos.x+this.size/2, this.pos.y+this.size/2)

  }
  this.intersects = function(pipe)
  {



    if((this.bA.x>pipe.pos.x && this.bA.x < pipe.pos.x+pipe.size && this.bA.y> pipe.pos.y)
      ||(this.bA.x>pipe.pos.x && this.bA.x < pipe.pos.x+pipe.size && this.bA.y< pipe.pos.y-pipe.gap))
    {
      return true
    }

    if((this.bD.x>pipe.pos.x && this.bD.x < pipe.pos.x+pipe.size && this.bD.y> pipe.pos.y)
      ||(this.bD.x>pipe.pos.x && this.bD.x < pipe.pos.x+pipe.size && this.bD.y< pipe.pos.y-pipe.gap))
    {
      return true
    }
    if((this.bB.x>pipe.pos.x && this.bB.x < pipe.pos.x+pipe.size && this.bB.y> pipe.pos.y)
      ||(this.bB.x>pipe.pos.x && this.bB.x < pipe.pos.x+pipe.size && this.bB.y< pipe.pos.y-pipe.gap))
    {
      return true
    }

    if((this.bC.x>pipe.pos.x && this.bC.x < pipe.pos.x+pipe.size && this.bC.y> pipe.pos.y)
      ||(this.bC.x>pipe.pos.x && this.bC.x < pipe.pos.x+pipe.size && this.bC.y< pipe.pos.y-pipe.gap))
    {
      return true
    }


    return false;


  }
  this.display = function()
  {
    push();
    fill("red");
    rectMode(CORNERS);

    rect(this.bA.x,this.bA.y,this.bD.x,this.bD.y);


    pop();

  }


}

function pipe(x,y)
{
  this.pos = createVector(x,y);
  this.vel = createVector(-2,0);
  this.size = 50;
  this.gap = 150;


  this.update = function()
  {

      this.pos.add(this.vel);

  }


  this.display = function()
  {
    push();
    fill("green");
    rectMode(CORNERS);
    rect(this.pos.x,this.pos.y,this.pos.x+this.size,windowHeight);
    rect(this.pos.x,this.pos.y-this.gap,this.pos.x+this.size,0);
    pop();

  }


}
