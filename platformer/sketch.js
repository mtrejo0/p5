

var player;
var platforms = [];
var gravity = .1;

var time ;
var game;
var birdImg;
var start;
var score;
var game

function setup() {
  // put setup code here
 createCanvas(windowWidth-10,windowHeight-10);
 
 for (var i = 30; i >= 0; i--) {
 	platforms.push(new platform(random(windowWidth),random(windowHeight)))

 }

 platforms.push(new platform(100,200))
 player = new Player(100,100);
 time =0
 game = true;
 
 
}
function keyPressed()
{
	
	if(keyCode == UP_ARROW)
	{
		player.jump();
	}
}



function keyReleased()
{
	if(keyCode == RIGHT_ARROW || keyCode == LEFT_ARROW)
	{
		player.mode = "idle"
	}
}



function draw() {

  createCanvas(windowWidth-10,windowHeight-10);
 	
  background("orange");
  fill("red")
  rect(0,windowHeight-50,windowWidth,windowHeight)
  fill("orange")
  rect(0,windowHeight-30,windowWidth,windowHeight)
  fill("yellow")
  rect(0,windowHeight-20,windowWidth,windowHeight)

  if(game){

	  if(time % 30 == 0){
	  	platforms.push(new platform(windowWidth,random(windowHeight)))

	  }
	  
	  for (var i = platforms.length - 1; i >= 0; i--) {
	  	platforms[i].display()
	  	platforms[i].update()
	  }
	  player.display()
	  player.update()

	  time+=1
	}
	else
	{
		for (var i = platforms.length - 1; i >= 0; i--) {
		  	platforms[i].display()
		  
		  }
		  player.display()
		textSize(100)
		text("GAME OVER",windowWidth/2-300,windowHeight/2)
	}
  
 
  
}

function Player(x,y)
{
  this.pos = createVector(x,y);
  this.vel = createVector(0,0);
  this.acc = createVector(0,.5);
  this.size = 20;
  this.state = "air";
  this.move = "idle"
  this.dir = 'right'
  

  this.update = function()
  {

    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if(this.pos.y>windowHeight)
    {
    	game = false
    }

    onPlat = false;
    onThisPlat = 0;
    for (var i = platforms.length - 1; i >= 0; i--) {

    	if(platforms[i].pos.y+platforms[i].height>=this.pos.y && platforms[i].pos.y+platforms[i].height<this.pos.y+30
    	&& this.pos.x + 15 > platforms[i].pos.x && this.pos.x < platforms[i].pos.x+platforms[i].size)
    	{
    		
    		this.vel.y = 0;
    		this.pos.y = platforms[i].pos.y+platforms[i].height

    	}

    	else if(platforms[i].pos.y<=this.pos.y+30 && platforms[i].pos.y>this.pos.y
    	&& this.pos.x + 15 > platforms[i].pos.x && this.pos.x < platforms[i].pos.x+platforms[i].size)
    	{
    		
    		onPlat = true
    		onThisPlat = platforms[i]

    	}



	}
	if(onPlat)
	{
		this.vel.y = 0;
    	this.acc.y = 0;
    	this.pos.y = onThisPlat.pos.y-30
    	this.state = 'plat'
    	this.pos.x-=1
	}
	else
	{
		this.state = 'air'
		this.acc.y = .5
	}


	if (keyIsDown(LEFT_ARROW)) {
		this.pos.x -= 5;
		this.dir ='left'
	}

	if (keyIsDown(RIGHT_ARROW)) {
		this.pos.x += 5;
		this.dir = 'right'
	}



	
		    

  }
  this.jump = function()
  {
  	if(this.state == "plat")
  	{
  		this.acc.y = .5;
  		this.vel.y = -10;
  		this.state = "air"
  	}
  }

  this.display = function()
  {
    push();
    fill("red");
    rectMode(CORNERS);
    
    rect(this.pos.x,this.pos.y,this.pos.x+15,this.pos.y+30);
   	if(this.dir =='right')
   	{
   		rect(this.pos.x + 10,this.pos.y+5,this.pos.x+11,this.pos.y+6);
   	}
   	else
   	{
   		rect(this.pos.x + 4,this.pos.y+5,this.pos.x+5,this.pos.y+6);
   	}


    
    pop();

  }

  
}

function platform(x,y)
{
  this.pos = createVector(x,y);
  this.size = 100;
  this.height = 20;
  this.vel = -1;

  this.update =function()
  {
  	this.pos.x+=this.vel
  }

  this.display = function()
  {
  	
    push();
    fill("grey");
    rectMode(CORNERS);
    rect(this.pos.x,this.pos.y,this.pos.x+this.size,this.pos.y+this.height);
    
    pop();

  }

  

  
}

