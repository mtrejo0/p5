var racer;
var objects = []
var time;
var positions =[];
var drawingBox;
var tempShape;
function setup() {
  // put setup code here
 createCanvas(windowWidth-10,windowHeight-10);
 racer = new Rocket();
 time = 0;
 objects.push(new block([[0,windowHeight-50],[windowWidth,windowHeight]]))
 objects.push(new block([[windowWidth-50,0],[windowWidth,windowHeight]]))
 objects.push(new block([[0,0],[windowWidth,50]]))
 objects.push(new block([[0,0],[50,windowHeight]]))
 drawingBox = false;
 
}

function mousePressed()
{
  startPoint = [mouseX,mouseY];
  drawingBox = true;
  tempShape = [mouseX,mouseY];
  // noLoop();
}
function mouseReleased()
{
  endPoint = [mouseX,mouseY];

  objects.push(new block([startPoint,endPoint]))
  drawingBox = false;
  // loop();
}


function draw() {
 
  
  
  

  background("white")
  
  
    if(time%10 == 0){
    if(!drawingBox) positions.push([racer.pos.x,racer.pos.y])}
    
    for (var i = positions.length - 1; i >= 0; i--) {
      fill("blue")
      ellipse(positions[i][0],positions[i][1],10,10)
    }
    time++;
    if(!drawingBox) racer.update();
    racer.display();
  

  if(drawingBox)
  {
    fill("green")
    rectMode(CORNERS)
    rect(tempShape[0],tempShape[1],mouseX,mouseY);
  } 
  for (var i = objects.length - 1; i >= 0; i--) {

      objects[i].update()
      objects[i].display()
    }
  
  
}




function Rocket()
{
  this.pos = createVector(windowWidth/2,windowHeight-250);
  this.vel = createVector(1,0);
  this.acc = [0,0];
  
  this.color = "red"
  this.time = 0
  this.pError = 0;
  this.kP = -1/10000
  this.kD = -1/100000
  this.kI = -1/1000000



  this.bang = function()
  {
      d = this.avgDist();
      velH = this.vel.heading()
      if(d<200)
      {
        this.acc = createVector(cos(velH-PI/2)/1000,sin(velH-PI/2)/1000)
      }
      if(d> 200)
      {
        //this.vel.rotate(PI/1000)
        this.acc = createVector(cos(velH+PI/2)/1000,sin(velH+PI/2)/1000)
      }
  }
  this.PID = function()
  {
      
       d = this.avgDist(PI/2);
      error = 200-d;
      

      velH = this.vel.heading()

      angle = velH+PI/2
      P = error*this.kP
      I = this.kI/this.time*(error-this.pError)
      D = this.time*this.kD*(error-this.pError)

      this.acc = [cos(angle)*( P+I+D),sin(angle)*( P+I+D)]
      this.pError = error;
  }
  
  this.update = function() {
      this.time ++;
      this.vel.x+=this.acc[0]
      this.vel.y+=this.acc[1]
      this.pos.add(this.vel);
      this.acc = [0,0]

      if(this.time>800)
      {
        this.time  = 1;
        this.pError = 0;
      }

      if(this.vel.mag()>1)
      {
        this.vel.mult(1/this.vel.mag())
      }


      //this.vel.add(createVector(cos(this.vel.heading()),sin(this.vel.heading())))

      
      if(this.pos.y<0)
      {
        this.pos.y = windowHeight-10
      }
      
        this.PID()
      

      for (var j = objects.length - 1; j >= 0; j--) {
        if(this.pos.x > objects[j].points[0][0] && this.pos.x < objects[j].points[1][0] && 
          this.pos.y > objects[j].points[0][1] && this.pos.y < objects[j].points[1][1])
        {
         noLoop()
        
        }
        if(this.pos.x > objects[j].points[1][0] && this.pos.x < objects[j].points[0][0] && 
          this.pos.y > objects[j].points[1][1] && this.pos.y < objects[j].points[0][1])
        {
          noLoop()
        }
        if(this.pos.x > objects[j].points[0][0] && this.pos.x < objects[j].points[1][0] && 
          this.pos.y < objects[j].points[0][1] && this.pos.y > objects[j].points[1][1])
        {
         noLoop()
        
        }
        if(this.pos.x > objects[j].points[1][0] && this.pos.x < objects[j].points[0][0] && 
          this.pos.y < objects[j].points[1][1] && this.pos.y > objects[j].points[0][1])
        {
          noLoop()
        }


      }
      
  };

  this.avgDist = function(){
    sum = 0;
    count = 0;
    angle = PI/2+PI/6
    weight = .8
    while(angle>PI/2-PI/6 )
    {
      sum+=this.dist(angle)*weight
      count++
      angle-=.1
      if(angle>PI/2)
      {
        weight+=.05
      }
      else
      {
        weight-=.05
      }

    }
    return sum/count
  }

  
  

  this.dist = function(angle)
  {
    var dist = 0;
    var hit = false
    var curr = createVector(this.pos.x,this.pos.y);
    while(!hit)
    { 
      point(curr.x,curr.y)
      curr.x = curr.x+cos(this.vel.heading()+angle)*5
      curr.y = curr.y+sin(this.vel.heading()+angle)*5
      dist += 5
      for (var j = objects.length - 1; j >= 0; j--) {
        if(curr.x > objects[j].points[0][0] && curr.x < objects[j].points[1][0] && 
          curr.y > objects[j].points[0][1] && curr.y < objects[j].points[1][1])
        {
          hit = true;
          break
        }
        if(curr.x > objects[j].points[1][0] && curr.x < objects[j].points[0][0] && 
          curr.y > objects[j].points[1][1] && curr.y < objects[j].points[0][1])
        {
          hit = true;
          break
        }
        if(curr.x > objects[j].points[0][0] && curr.x < objects[j].points[1][0] && 
          curr.y < objects[j].points[0][1] && curr.y > objects[j].points[1][1])
        {
          hit = true;
          break
       
        }
        if(curr.x > objects[j].points[1][0] && curr.x < objects[j].points[0][0] && 
          curr.y < objects[j].points[1][1] && curr.y > objects[j].points[0][1])
        {
          hit = true;
          break;
        }

      }
      
    }

    return dist
  }
 

  this.display = function() {

    angle = PI/2+PI/6
    
    
    push();
    fill(this.color);
    translate(this.pos.x,this.pos.y);
    rotate(this.vel.heading())
    rectMode(CENTER)
    rect(0,0,20,10)

    pop();
  };


}

function block([[a,b],[c,d]])
{
  this.points = [[a,b],[c,d]]
  this.pos = createVector(a,b);
  this.vel = createVector(0,0);
  this.acc = createVector(0,0);
  this.color = "green"

  this.update = function() {

      
      this.points[0][1] += this.vel.y;
      this.points[1 ][1] += this.vel.y;

      

      
      
                
  };

  this.display = function() {
    
    push();
    
    rectMode(CORNERS)
    fill(this.color);
    rect(this.points[0][0],this.points[0][1],this.points[1][0],this.points[1][1])
    pop();
  };



}