var length = 500;
var width = 500;
var particles = [];
var slider;
var time = 0;
function setup() {
  // put setup code here
  createCanvas(windowWidth, windowHeight);
  fill(240);
  noStroke();
  slider = createSlider(0, 100, 50);
  slider.position(20, 20);

  sliderB = createSlider(1, 70, 1);
  sliderB.position(20, 50);
  

  
  
}

function draw() {
  // put drawing code here
  background('black');
  time++;

  fill("white");
  text("Length",200,30);
  text("Frame Rate",200,70);

  
  if(mouseIsPressed && particles.length<300 && !(mouseX<200 && mouseY<100))
  {
    particles.push(new Particle(mouseX,mouseY))
  }
  


  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].connect();
    

  }
  var frame = map(sliderB.value(),1,70,70,1);
  
  for (var i = particles.length - 1; i >= 0; i--) {

    if(time%frame==0)
    {particles[i].update();}
    
    particles[i].display();
    

  }
}





function Particle(x,y)
{
	this.x = x;
	this.y = y;
	this.vx = random(-2,2);
	this.vy = random(-2,2);
	this.size = random(2,10);

	this.connect = function(){
    	var max = slider.value();
		for (var i = particles.length - 1; i >= 0; i--) {
			var dist  = sqrt(pow(this.x-particles[i].x,2)+pow(this.y-particles[i].y,2))
			//console.log(dist)
			if(dist < max && dist>0)
			{
				stroke(map(dist, 0, max, 255, 0))
				strokeWeight(map(dist, 0, max, 10, 0))
    			line(this.x, this.y, particles[i].x,particles[i].y)
    		}
		}


	}

	this.update = function() {
    	this.x+=this.vx;
    	this.y+=this.vy;
    	

    	if(this.y<0)
    	{
    		this.y = height
    	}
    	if(this.y>height)
    	{
    		this.y = 0
    	}
    	if(this.x<0)
    	{
    		this.x = width
    	}
    	if(this.x>width)
    	{
    		this.y = width
    	}

  };

  this.display = function() {
  	noStroke();
  	fill(255,0,0);
    ellipse(this.x, this.y, this.size);
  };
}