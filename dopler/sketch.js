
var waves = []
var time= 0;

var pos = {"x": 0, "y": 0};

var linearButton;
var sinButton;
var manualButton;
var circleButton;

var frequencyRange = {
  "min": 3,
  "max": 30
}

var state = "sinusoidal"

function setup() {
  // put setup code here
 createCanvas(windowWidth-10,windowHeight-10);
  
  manualButton = createButton("Manual"); 
  manualButton.position(10,10);
  manualButton.mousePressed(()=>{
    state = 'manual'
  });

  circleButton = createButton("Circular"); 
  circleButton.position(10,50);
  circleButton.mousePressed(()=>{
    state = 'circle'
  });

  linearButton = createButton("Linear"); 
  linearButton.position(10,90);
  linearButton.mousePressed(()=>{
    state = 'linear'
  });
  
  sinButton = createButton("Sinusodial"); 
  sinButton.position(10,130);
  sinButton.mousePressed(()=>{
    state = 'sinusoidal'
  });

  ellipseButton = createButton("Ellipse"); 
  ellipseButton.position(10,170);
  ellipseButton.mousePressed(()=>{
    state = 'ellipse'
  });

    
  frequencySlider = createSlider(3, 30, 25);
  frequencySlider.position(windowWidth-150, 20);

  speedSlider = createSlider(1, 300, 100);
  speedSlider.position(windowWidth-150, 60);

  amplitudeSlider = createSlider(1, 300, 75);
  amplitudeSlider.position(windowWidth-150, 100);

  angularSlider = createSlider(1, 300, 75);
  angularSlider.position(windowWidth-150, 140);

  periodXSlider = createSlider(1, 300, 75);
  periodXSlider.position(windowWidth-150, 180);

  periodYSlider = createSlider(1, 300, 75);
  periodYSlider.position(windowWidth-150, 220);

  
}

function draw() {

  background("white");
  fill(0)
  text("Frequency",windowWidth-250, 25);
  text("Speed",windowWidth-250, 65);
  text("Amplitude",windowWidth-250, 105);
  text("Angular freq",windowWidth-250, 145);
  text("Period X",windowWidth-250, 185);
  text("Period Y",windowWidth-250, 225);

  time++;

  let frequency = frequencyRange.max - 1 - frequencySlider.value();
  let speed = speedSlider.value();
  let amplitude = amplitudeSlider.value()
  let angular = angularSlider.value()
  let periodX = periodXSlider.value();
  let periodY = periodYSlider.value();


  if(state === 'linear')
  {
    
    pos.x += speed/50;
    pos.y = windowHeight/2;

    pos.x = pos.x % windowWidth;

    if(time % frequency == 0)
    {
      waves.push(new wave(pos.x,pos.y));
    }
  }
  if(state === "manual")
  {
    if(time % frequency == 0)
    {
      waves.push(new wave(mouseX,mouseY));
    }
  }
  if(state === "sinusoidal")
  {
    pos.x = windowWidth/2;
    pos.y = windowHeight/2+amplitude*sin(angular/1000*time);

    if(time % frequency == 0)
    {
      waves.push(new wave(pos.x,pos.y));
    }
  }
  if(state === "circle")
  {
    pos.x = windowWidth/2+amplitude*cos(angular/1000*time);
    pos.y = windowHeight/2+amplitude*sin(angular/1000*time);

    if(time % frequency == 0)
    {
      waves.push(new wave(pos.x,pos.y));
    }
  }

  if(state === "ellipse")
  {
    pos.x = windowWidth/2+amplitude*cos(periodX/1000*time);
    pos.y = windowHeight/2+amplitude*sin(periodY/1000*time);

    if(time % frequency == 0)
    {
      waves.push(new wave(pos.x,pos.y));
    }
  }



  for (var i = waves.length - 1; i >= 0; i--) {
    waves[i].update();
    waves[i].display();

  }
  for (var i = waves.length - 1; i >= 0; i--) {
    if(waves[i].radius > 2*windowWidth)
    {
      waves.splice(i,1);
    }
  }
  
}


function wave(x,y)
{
  this.pos = createVector(x,y);
  this.radius = 1;

  this.update = function()
  {
    this.radius+=10;
  }
  this.display = function()
  {
    noFill();
    ellipse(this.pos.x,this.pos.y, this.radius,this.radius);
  }
}

