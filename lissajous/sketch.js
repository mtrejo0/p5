var periodX;
var periodY;
var x;
var y;
var pX;
var pY;
var time;
var button;

var positions = [];

function setup() {
  // put setup code here
  createCanvas(windowWidth,windowHeight);
  periodYSlider = createSlider(0, 2*Math.PI, Math.PI, Math.PI/12);
  periodYSlider.position(20, 20);
  periodYSlider.size(windowWidth/3,50)
  periodXSlider = createSlider(0, 2*Math.PI, Math.PI, Math.PI/12);
  periodXSlider.size(windowWidth/3,50)
  periodXSlider.position(20, 50);
  
  time = 0;
}

function mouseReleased()
{
  positions = []
}

function draw() {
  createCanvas(windowWidth,windowHeight);

  periodX = periodXSlider.value()
  periodY = periodYSlider.value()
  displayX = Math.round(periodX/Math.PI * 10) / 10
  displayY = Math.round(periodY/Math.PI * 10) / 10
  time+=.02;
  
  text(`X Period - ${displayX} pi`,windowWidth/2.5,45);
  text(`Y Period - ${displayY} pi`,windowWidth/2.5,75);

  strokeWeight(4)

  x = windowWidth/6*cos(periodX*time);
  y = windowWidth/6*sin(periodY*time);

  positions.push([x,y])
  past = [x,y]
  for (var i = positions.length - 1; i >= 0; i--) {
    push()
    translate(windowWidth/2,windowHeight/2)
    line(positions[i][0],positions[i][1],past[0],past[1])
    past = positions[i]
    pop()
  }
}

