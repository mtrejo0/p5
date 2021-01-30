var goal;
var guns = [];
var time;
var projectiles = []

function setup() {
  // put setup code here
 createCanvas(windowWidth,windowHeight);
 guns.push(new Rocket(0,0))
 guns.push(new Rocket(0,windowHeight/2))
 guns.push(new Rocket(0,windowHeight))
 time = 0;
}


function draw() {
  createCanvas(windowWidth,windowHeight);
  background("white")
  for (var i = 0; i < guns.length; i++) {
    guns[i].update()
    guns[i].display();
  }
  time++;
  for (var i = 0; i < projectiles.length; i++) {
    projectiles[i].update()
    projectiles[i].display()
    proj = projectiles[i]
    if(sqrt(pow(proj.pos.x-mouseX,2)+pow(proj.pos.y-mouseY,2)<=20)){
      noLoop()
      background("black");
      fill(255,255,255);
      text("ya lost, refresh the page to restart!",windowWidth/2-100,windowHeight/2);
    }
  }

}

function Rocket(x,y)
{
  this.pos = createVector(x,y);
  this.vel = createVector(.000001,0);
  this.acc = createVector(0,0);
  this.theto = 0;
  this.omega = 0;
  this.alpha = 0;

  this.color = "red"
  this.time = 0
  this.pError = 0;
  this.kP = 1/1000
  this.kD = 1/10000
  this.kI = 1/100000
  this.shootVelocity = 1;
  this.shootFrequency = 50;
  this.PIDangle = function()
  {

      mouseAngle = atan2(mouseY-this.pos.y,mouseX-this.pos.x)
      error = mouseAngle - this.theto
      P = error*this.kP
      I = this.kI/this.time*(error-this.pError)
      D = this.time*this.kD*(error-this.pError)
      this.alpha = (P+I+D)
      this.pError = error;

  }

  this.update = function() {
      this.time ++;
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);

      this.theto += this.omega
      this.omega += this.alpha
      this.alpha = 0
      this.vel.rotate(this.omega)
      this.PIDangle()

      if(this.time %this.shootFrequency == 0){
        projectiles.push(new Projectile(this.pos.x,this.pos.y, this.shootVelocity*cos(this.theto),this.shootVelocity*sin(this.theto)))
        this.shootVelocity+=.1
      }
      if(this.time %100== 0){
        this.shootFrequency = max(1,this.shootFrequency - 1);
      }


  };
  this.display = function() {
    push();
    fill(this.color);
    translate(this.pos.x,this.pos.y);
    rotate(this.vel.heading())
    rectMode(CENTER)
    line(0,0,2000,0)
    rect(0,0,20,10)
    pop();
  };
}
function Projectile(x,y,vx,vy)
{
  this.pos = createVector(x,y);
  this.vel = createVector(vx,vy);
  this.update = function() {
      this.time ++;
      this.pos.add(this.vel);
  };
  this.display = function() {
    fill("black");
    ellipse(this.pos.x,this.pos.y,10,10)
  };


}
