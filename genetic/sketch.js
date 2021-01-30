var rockets = [];
var color = 0;
var time;
var goal;
var origin;
var numMoves = 200;
var num = 100;
var genNum = 0;
var objects = [];
var drawingBox;
var tempShape;
var stars = []
var startPoint;
var endPoint;
var clock;
function setup() {
  // put setup code here
  //frameRate(30);
  createCanvas(windowWidth, windowHeight);

  goal = [windowWidth-100,windowHeight/2,windowHeight * windowWidth/30000];
  time = 0;
  clock = 0;
  origin = createVector(50,windowHeight/2);

  for (var i =num; i >= 0; i--) {
    rockets.push(new Rocket());
  }
  startPoint = createVector();
  endPoint = createVector();
  drawingBox = false;

  for (var i = 70; i >= 0; i--) {
    stars.push([random(0,windowWidth),random(0,windowHeight)])
  }


}

function draw() {
  clock++
  fill(255-clock)
  text("Click and Drag to add Obstacles",windowWidth/2-100,100);

  origin = createVector(50,windowHeight/2);
  goal = [windowWidth-100,windowHeight/2,windowHeight * windowWidth/30000];

  // createCanvas(windowWidth -5 , windowHeight -5);
  background(10, 40);
  // background('black');
  textSize(20);
  fill(255);
  text("Generation: "+ genNum,10,30);
  for (var i = stars.length - 1; i >= 0; i--) {
    fill("white")
    ellipse(stars[i][0],stars[i][1],1,1)
  }



  if(time < numMoves){
    for (var i = rockets.length - 1; i >= 0; i--) {
    if(!drawingBox)   rockets[i].update();
    rockets[i].display();

    }
    time++;
  }
  else
  {
    newGen();
    genNum++;
  }


  noStroke()
  fill("orange")
  ellipse(goal[0],goal[1],goal[2],goal[2]);
  fill("blue")
  ellipse(origin.x,origin.y,goal[2],goal[2]);




  for (var i = objects.length - 1; i >= 0; i--) {
    rectMode(CORNERS);
    fill("white");
    rect(objects[i][0][0],objects[i][0][1],objects[i][1][0],objects[i][1][1])
  }

  if(drawingBox)
  {
    fill("white")
    rectMode(CORNERS)
    rect(tempShape[0],tempShape[1],mouseX,mouseY);
  }





}

function mousePressed()
{
  startPoint = [mouseX,mouseY];
  drawingBox = true
  tempShape = [mouseX,mouseY]
  // noLoop();
}
function mouseReleased()
{
  endPoint = [mouseX,mouseY];
  drawingBox = false
  objects.push([startPoint,endPoint])
  // loop();
}


function newGen()
{
  time = 0;
  var maxFit = -Infinity;
  var minFit = Infinity;
  var bestRocket;
  for (var i = rockets.length - 1; i >= 0; i--) {
    var fit = rockets[i].getFitness();


    if(fit>maxFit)
    {
      maxFit = fit;
      bestRocket = rockets[i];

    }
    if(fit<minFit)
    {
      minFit = fit;

    }
  }

  for (var i = rockets.length - 1; i >= 0; i--) {
    rockets[i].fitness = rockets[i].fitness/maxFit;

  }


  var pool = [];
  for (var i = rockets.length - 1; i >= 0; i--) {
    var n = rockets[i].fitness*50;
    for (var j = n; j >= 0; j--) {
      pool.push(rockets[i]);
    }
  }

  rockets = [];

  for (var i = num; i >= 0; i--) {
    rockets.push(new Rocket());
  }

  for (var i = rockets.length- 1; i >= 0; i--) {
    rockets[i].moves = mate(random(pool),random(pool));
    rockets[i].moves = mutation(rockets[i].moves);
  }

}

function mutation(movesToMutate)
{
  var movesMutated = []

  for (var i = movesToMutate.length - 1; i >= 0; i--) {
    if(random(1)<0.01)
    {
      var x = random(-1,1);
      var y = random(-1,1);

      movesMutated.push([x,y])
    }
    else
    {
      movesMutated.push(movesToMutate[i]);
    }

  }
  return movesMutated;
}
function mate(rocketA,rocketB)
{
  var babyMoves = [];
  var index = random(rocketA.moves.length);
  for (var i = rocketA.moves.length-1; i >= 0; i--) {
    if(i<index)
    {
      babyMoves.push(rocketA.moves[i]);
    }
    else
    {
      babyMoves.push(rocketB.moves[i]);
    }
  }


  return babyMoves;


}



function Rocket()
{
	this.pos = createVector(origin.x,origin.y);
  this.vel = createVector(0,0);
  this.acc = createVector(0,0);
  this.moves = [];
  this.win = false;
  this.lose = false;

  this.fitness = -Infinity;
  this.index = 0;

  this.color = random(100,255);
  this.time = -Infinity;
  this.size = windowHeight * windowWidth/100000

  for (var i = numMoves; i >= 0; i--) {
    var x = random(-1,1);
    var y = random(-1,1);
    this.moves.push([x,y]);
  }

	this.update = function() {
    this.size = windowHeight * windowWidth/100000
    if(!this.win && !this.lose){
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);

      if(this.index < this.moves.length)
      {
        this.acc = createVector(this.moves[this.index][0],this.moves[this.index][1]);
        this.index++;
      }

      if(this.pos.x > goal[0]-goal[2]/2 && this.pos.x < goal[0]+goal[2]/2 && this.pos.y > goal[1]-goal[2]/2 && this.pos.y < goal[1]+goal[2]/2)
      {
        this.win = true;
        this.time = this.index;
      }
      for (var j = objects.length - 1; j >= 0; j--) {

        x1 = objects[j][0][0]
        y1 = objects[j][0][1]

        x2 = objects[j][1][0]
        y2 = objects[j][1][1]
        if(this.pos.x > x1 && this.pos.x < x2 && this.pos.y > y1 && this.pos.y < y2)
        {
        this.lose = true;

        }

        if(this.pos.x < x1 && this.pos.x > x2  && this.pos.y < y1 && this.pos.y > y2)
        {
        this.lose = true;
        }

        if(this.pos.x > x1 && this.pos.x < x2 && this.pos.y < y1 && this.pos.y > y2)
        {
        this.lose = true;

        }

        if(this.pos.x < x1 && this.pos.x > x2  && this.pos.y > y1 && this.pos.y < y2)
        {
        this.lose = true;
        }
      }

    }


  };

  this.getFitness = function()
  {
     var dist = sqrt(pow((this.pos.x-goal[0]),2)+pow((this.pos.y-goal[1]),2));
      this.fitness = 1/(pow(dist,2));

      if(this.win)
      {

        this.fitness /= this.moves.length/this.time
      }
      if(this.lose)
      {
        this.fitness /= 50;
      }
      return this.fitness;

  };



  this.display = function() {
    push();
    // colorMode(HSB, 100);
    fill(this.color);
    translate(this.pos.x,this.pos.y);
    rotate(this.vel.heading())

    beginShape();
    vertex(this.size, 0);
    vertex(-this.size, -this.size/2);
    vertex(-this.size, this.size/2);
    endShape(CLOSE);

    pop();
  };


}
