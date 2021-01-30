var height = 500;
var width = 500;
var bullets = [];
var asteroids = [];
var lose = false;
var win = false;
var color;

function setup() {
  // put setup code here
  createCanvas(windowWidth -5 , windowHeight -5);
   height = windowHeight-5;
   width = windowWidth-5;
   bullets = [];
   asteroids = [];
   lose = false;
   win = false;
   color = 1;
  rocket = new Rocket((windowWidth -5)/2,( windowHeight -5)/2)

  for (var i = 30; i >= 0; i--) {
   
  asteroids.push(new Asteroid());
  }

   


}

function draw() {
  // put drawing code here
  background('black');
  color = (color+1)%100;
  colorMode(HSB, 100);
  stroke(color, 255, 255);

  rocket.update();
  rocket.display();
  for (var i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].update();
    asteroids[i].display();
  }
  for (var i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].display();
  }

  clean();
  collision();
  if(lose)
  {
    
    background("black");
    fill(255,255,255);
   
    text("ya lost, press r to restart",windowWidth/2-100,windowHeight/2);

  }
  if(win)
  {
    
    background("black");
    fill(255,255,255)
    
    text("ya won, press r to restart",windowWidth/2-100,windowHeight/2);

  }
  



  

}

function clean()
{
  for (var i = bullets.length - 1; i >= 0; i--) {
    if(bullets[i].pos.x>width || bullets[i].pos.x[i]<0)
    {
      bullets.splice(i,1);
    }
    else if(bullets[i].pos.y>height || bullets[i].pos.y[i]<0)
    {
      bullets.splice(i,1);
    }

  }
  if(asteroids.length<1)
  {
    win = true;
  }
}

function collision()
{
  var colI;
  var colJ;
  var col = false;
  for (var i = bullets.length - 1; i >= 0; i--) {
    for (var j = asteroids.length - 1; j >= 0; j--) {
      if(bullets[i].pos.x<(asteroids[j].pos.x+asteroids[j].size) && bullets[i].pos.x>(asteroids[j].pos.x-asteroids[j].size) &&
        bullets[i].pos.y<(asteroids[j].pos.y+asteroids[j].size) && bullets[i].pos.y>(asteroids[j].pos.y-asteroids[j].size))
      {
        //bullets.splice(i,1);
        //asteroids.splice(j,1);
        console.log("collision")
        col = true;
        colI = i;
        colJ = j;

      }
    }
  }

  for (var j = asteroids.length - 1; j >= 0; j--) {
      if(rocket.pos.x<(asteroids[j].pos.x+asteroids[j].size) && rocket.pos.x>(asteroids[j].pos.x-asteroids[j].size) &&
        rocket.pos.y<(asteroids[j].pos.y+asteroids[j].size) && rocket.pos.y>(asteroids[j].pos.y-asteroids[j].size))
      {
        lose = true;
      }
  }



  if(col)
  {
    bullets.splice(colI,1);
    asteroids.splice(colJ,1);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    rocket.thrust(1);
  }
  if (keyCode === DOWN_ARROW) {
    rocket.thrust(-1);
  }
  if (keyCode === RIGHT_ARROW) {
    rocket.degrees+=30;
  }
  if (keyCode === LEFT_ARROW) {
    rocket.degrees-=30;
  } 
  if (keyCode === 32) {
    bullets.push(new Bullet())
  }
  if (keyCode === 82) {
    setup();
  }




}




function Bullet()
{
  this.pos = createVector(rocket.pos.x,rocket.pos.y);
  this.vel = createVector(cos(rocket.theta),sin(rocket.theta));
  this.vel.mult(10);
  this.acc = createVector(0,0);
  
  
  
  this.update = function() {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);

  };

  this.display = function() {
    push();
    colorMode(HSB, 100);
    stroke(color, 255, 255);
    fill(color, 255, 255);

    translate(this.pos.x,this.pos.y);

    ellipse(0,0,5,5);

    pop();
  };


}



function Asteroid()
{
  this.pos = createVector(random(width),random(height));
  this.vel = createVector(random(-1,1),random(-1,1));
  this.acc = createVector(0,0);
  this.size = random(10,20);
  /*this.outside = [];

  this.edges = random(5,10);
  for (var i = this.edges; i >= 0; i--) {
    this.outside.push(createVector(random(10));
  }
  for (var i = this.edges; i >= 0; i--) {
    this.outside.push(createVector(random(10));
  }*/

  
  
  this.update = function() {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);

      if(this.pos.y<0)
      {
        this.pos.y = height
      }
      if(this.pos.y>height)
      {
        this.pos.y = 0
      }
      if(this.pos.x<0)
      {
        this.pos.x = width
      }
      if(this.pos.x>width)
      {
        this.pos.x = 0
      }


      this.theta = this.degrees*2*PI/360;

  };

  this.display = function() {
    push();
    translate(this.pos.x,this.pos.y);

    /*beginShape();
    for (var i = this.outside.length - 1; i >= 0; i--) {
      vertex(this.outside[i].x,this.outside[i].y)
    }
    
    endShape(CLOSE);*/
    colorMode(HSB, 100);
    stroke(0, 0, 255);

    ellipse(0,0,this.size,this.size);

    pop();
  };




}





function Rocket(x,y)
{
	this.pos = createVector(x,y);
	this.vel = createVector(0,0);
  this.acc = createVector(0,0);
  this.theta = 0;
  this.degrees = 0;
	


	this.update = function() {
      this.vel.add(this.acc);
    	this.pos.add(this.vel);
      this.acc.mult(0);

    	if(this.pos.y<0)
    	{
    		this.pos.y = height
    	}
    	if(this.pos.y>height)
    	{
    		this.pos.y = 0
    	}
    	if(this.pos.x<0)
    	{
    		this.pos.x = width
    	}
    	if(this.pos.x>width)
    	{
    		this.pos.x = 0
    	}


      this.theta = this.degrees*2*PI/360;

  };

  this.applyForce = function(force)
  {
    this.acc.add(force);
  }

  this.thrust = function(direction)
  {
    if(direction ==1){
      this.applyForce(createVector(cos(this.theta),sin(this.theta)));

    }
    else
    {
       this.applyForce(createVector(-cos(this.theta),-sin(this.theta)));

    }
    
  }



  this.display = function() {
    push();
    colorMode(HSB, 100);
    stroke(color, 255, 255);
    translate(this.pos.x,this.pos.y);
    rotate(this.theta)
  	
    beginShape();
    console.log("ok")
    vertex(10, 0);
    vertex(-10, -5);
    vertex(-10, 5);
    endShape(CLOSE);

    pop();
  };


}