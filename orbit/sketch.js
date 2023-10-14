var bullets = [];
var asteroids = [];
var color;

var sun;

let G = -.000001
let friction = .001

let upKeyPressed = false;
let downKeyPressed = false;
let rightKeyPressed = false;
let leftKeyPressed = false;

let totalMomentum = 0;

let sliderG, sliderRocketMass, sliderBulletMass, sliderSunMass;
let rocketInitialVelocity = 25
let sunMass = 100
let rocketMass = 10
let bulletMass = 1

function setup() {
  createCanvas(windowWidth, windowHeight);
  bullets = [];
  asteroids = [];
  color = 1;
  rocket = new Rocket();

  rocket.pos.x = windowWidth/ 2;
  rocket.pos.y = 100;
  rocket.vel.x = rocketInitialVelocity;

  sun = { radius: 10, x: windowWidth/ 2, y: windowHeight / 2, mass: sunMass };

  // Create sliders
  sliderRocketMass = createSlider(1, 50, rocketMass, 1);
  sliderRocketMass.position(10, 40);
  sliderBulletMass = createSlider(1, 10, bulletMass, 1);
  sliderBulletMass.position(10, 70);
  sliderSunMass = createSlider(50, 500, sunMass, 1);
  sliderSunMass.position(10, 100);
}

function draw() {
  background('black');
  drawPolarGrid(0.1, 30);

  // Update variables from sliders
  rocket.mass = sliderRocketMass.value();
  bulletMass = sliderBulletMass.value();
  sun.mass = sliderSunMass.value();

  color = (color + 1) % 100;
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

  ellipse(sun.x, sun.y, sun.radius);

  // Display labels for sliders
  fill(255);
  stroke(0)
  text("Rocket Mass: " + rocket.mass, 170, 55);
  text("Bullet Mass: " + bulletMass, 170, 85);
  text("Sun Mass: " + sun.mass, 170, 115);
}

function drawPolarGrid(angleIncrement, color) {
  var centerX = windowWidth/ 2;
  var centerY = windowHeight / 2;

  var grayColor = 50


  let a = 1
  let b = 10
  for (var radius = 0; radius <= 30; radius += 1) {
    push();
    colorMode(HSB, 100);
    noFill();
    stroke(color, grayColor);
    circle(centerX, centerY, b/1000);
    pop();

    let t = a
    a = a+b
    b = t
  }

  // Draw radial lines
  for (var angle = 0; angle < TWO_PI; angle += angleIncrement) {
    var x = centerX + cos(angle) * max(width, height);
    var y = centerY + sin(angle) * max(width, height);

    push();
    colorMode(HSB, 100);
    noFill();
    stroke(color, grayColor);
    line(centerX, centerY, x, y);
    pop();
  }
}



function keyPressed() {
  if (keyCode === UP_ARROW) {
    upKeyPressed = true;
  }
  if (keyCode === DOWN_ARROW) {
    downKeyPressed = true;
  }
  if (keyCode === RIGHT_ARROW) {
    rightKeyPressed = true;
  }
  if (keyCode === LEFT_ARROW) {
    leftKeyPressed = true;
  }
  if (keyCode === 32) {

    let bullet = new Bullet();
    bullets.push(bullet);

    // Calculate the rocket's velocity after the bullet is fired
    let rocketVelCopy = rocket.vel.copy();
    let newRocketVelX = (rocketVelCopy.x * rocket.mass - bullet.vel.x * bullet.mass) / (rocket.mass + bullet.mass);
    let newRocketVelY = (rocketVelCopy.y * rocket.mass - bullet.vel.y * bullet.mass) / (rocket.mass + bullet.mass);

    // Update the rocket's velocity to conserve momentum
    rocket.vel.set(newRocketVelX, newRocketVelY);
  }
  if (keyCode === 82) {
    setup();
  }
}

function keyReleased() {
  if (keyCode === UP_ARROW) {
    upKeyPressed = false;
  }
  if (keyCode === DOWN_ARROW) {
    downKeyPressed = false;
  }
  if (keyCode === RIGHT_ARROW) {
    rightKeyPressed = false;
  }
  if (keyCode === LEFT_ARROW) {
    leftKeyPressed = false;
  }
}




function Bullet()
{
  this.pos = createVector(rocket.pos.x,rocket.pos.y);
  this.vel = createVector(rocket.vel.x/10 + cos(rocket.theta), rocket.vel.y/10 + sin(rocket.theta));
  this.vel.mult(10);
  this.acc = createVector(0,0);
  this.mass = bulletMass
  
  
  
  this.update = function() {
      this.vel.add(this.acc);
      this.vel.mult(1 - friction); // Apply friction force
      this.pos.add(this.vel);
      this.acc.mult(0);

      this.applyForce(createVector(this.pos.x - sun.x, this.pos.y - sun.y).mult(G* this.mass*sun.mass))

      totalMomentum = rocket.vel.mag() * rocket.mass + bullets.reduce((sum, bullet) => sum + bullet.vel.mag() * bullet.mass, 0);



  };

  this.applyForce = function(force)
  {
    this.acc.add(force);
  }


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





function Rocket()
{
	this.pos = createVector(0,0);
	this.vel = createVector(0,0);
  this.acc = createVector(0,0);
  this.theta = 0;
  this.degrees = 0;
  this.mass = 10;
	
  this.pastTheta = 0


	this.update = function() {
      this.vel.add(this.acc);
      this.vel.mult(1 - friction); // Apply friction force
    	this.pos.add(this.vel);
      this.acc.mult(0);

  

      this.theta = this.degrees*2*PI/360;


      gravityForce = createVector(this.pos.x - sun.x, this.pos.y - sun.y).mult(G*this.mass*sun.mass)

      this.applyForce(gravityForce)

      angle = Math.atan2(gravityForce.y, gravityForce.x);



      

      if (gravityForce.x < 0 ) {
        
        this.theta += 2*PI
      
      }


      this.theta += angle


      // Continuous thrust
      let power = 0.5;
      if (upKeyPressed) {
        this.applyForce(createVector(cos(this.theta), sin(this.theta)).mult(power));
      }
      if (downKeyPressed) {
        this.applyForce(createVector(-cos(this.theta), -sin(this.theta)).mult(power));
      }

      // Continuous rotation
      let rotationSpeed = 4;
      if (rightKeyPressed) {
        this.degrees += rotationSpeed;
      }
      if (leftKeyPressed) {
        this.degrees -= rotationSpeed;
      }


  };

  this.applyForce = function(force)
  {
    this.acc.add(force);
  }

  this.thrust = function(direction)
  {
    let power = .5
    if(direction ==1){
      this.applyForce(createVector(cos(this.theta),sin(this.theta)).mult(power));

    }
    else
    {
       this.applyForce(createVector(-cos(this.theta),-sin(this.theta)).mult(power));

    }
    
  }



  this.display = function() {
    push();
    colorMode(HSB, 100);
    stroke(color, 255, 255);
    translate(this.pos.x,this.pos.y);
    rotate(this.theta)
  	
    beginShape();
    vertex(10, 0);
    vertex(-10, -5);
    vertex(-10, 5);
    endShape(CLOSE);

    pop();
  };


}