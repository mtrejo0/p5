
var time;
var start;
var stop;
var reset;
var play;
var hr;
var min;
var sec;
var redius;
function setup() {

	createCanvas(windowWidth, windowHeight)
	play = false;
	time = 0;
	start = createButton("Start");
  	start.position(windowWidth/2-50,windowHeight/2);
  	start.mousePressed(startF);
  	reset = createButton("Reset");
  	reset.position(windowWidth/2+50,windowHeight/2);
  	reset.mousePressed(resetF);

  	hr = 0;
  	min = 0;
  	sec = 0;
  	time = 0;


}


function startF()
{
	play = true;
	start.remove();
	stop = createButton("Stop");
  	stop.position(windowWidth/2-50,windowHeight/2);
  	stop.mousePressed(stopF);
}
function stopF()
{
	play = false;
	stop.remove();
	start = createButton("Start");
  	start.position(windowWidth/2-50,windowHeight/2);
  	start.mousePressed(startF);

}
function resetF()
{

	time = 0;
	hr = 0;
  	min = 0;
  	sec = 0;
	play = false;
	stop.remove();
	start.remove(0)
	start = createButton("Start");
  	start.position(windowWidth/2-50,windowHeight/2);
  	start.mousePressed(startF);


}


function draw() {
	background(0,50)
	radius = windowWidth/3
	if(radius< 300)
	{
		radius = 300;
	}

	reset.position(windowWidth/2+75,windowHeight/2);
	if(play)
	{
		time++;
		stop.position(windowWidth/2-125,windowHeight/2);
	}
	else
	{
		start.position(windowWidth/2-125,windowHeight/2);
	}

	textSize(20);

	if(time>=59)
	{
		sec++;
		time = 0
	}
	if(sec>=59)
	{
		min++
		sec = 0
	}
	if(min>=59)
	{
		hr++
		min = 0
	}
	fill('white')
	text(hr+" hr "+ min+" min "+ sec+" sec "+time, windowWidth/2-75,windowHeight/2-50)
	rectMode(CORNERS)
	/*push();
	fill("red")
	rect(10,10,10+time*10,20)
	rect(10,20,10+sec*10,30)
	rect(10,30,10+min*10,40)
	rect(10,40,10+hr*10,50)
	pop();*/

	push();

	strokeWeight(15)
	noFill()
	stroke("cyan")
	arc(windowWidth/2,windowHeight/2,radius,radius,-PI/2,map(time,0,59,0,2*PI)-PI/2)
	stroke("pink")
	arc(windowWidth/2,windowHeight/2,radius + 40,radius +40,-PI/2,map(sec,0,59,0,2*PI)-PI/2)
	stroke("lime")
	arc(windowWidth/2,windowHeight/2,radius + 80,radius + 80,-PI/2,map(min,0,59,0,2*PI)-PI/2)
	stroke("orange	")
	arc(windowWidth/2,windowHeight/2,radius +120,radius + 120,-PI/2,map(hr,0,59,0,2*PI)-PI/2)

	pop();




}
