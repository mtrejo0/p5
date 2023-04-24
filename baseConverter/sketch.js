var input;
var output;
var nameInput;
var outputBase;
var correctInput = true;
var correctInputBase = true;
var correctOutputBase = true;

var correct = true;

function setup() {
  // put setup code here
  createCanvas(windowWidth,windowHeight);
  input = createInput();
  input.position(windowWidth/2,windowHeight/2-115 );
  text("Input Number",windowWidth/2-200,windowHeight/2-100);


  text("Input Number base ",windowWidth/2-200,windowHeight/2-50);
  nameInput = createInput();
  nameInput.position(windowWidth/2,windowHeight/2-70);

  text("Output Number base ",windowWidth/2-200,windowHeight/2);
  outputBase = createInput();
  outputBase.position(windowWidth/2,windowHeight/2-25);

  noLoop();

  button = createButton('Output Number');
  button.position(windowWidth/2-200,windowHeight/2+50);
  button.mousePressed(calculate);


}

function calculate()
{
  correctInput = true;
  correctInputBase = true;
  correctOutputBase = true;
  correct = true;

  output = "";

  
  var inputBaseIn = nameInput.value();
  if(inputBaseIn<=1 || inputBaseIn > 16)
  {
    correctInputBase = false;
    correct = false;
  }
  else
  {
    correctInputBase = true ;
  }

  var outputBaseIn = outputBase.value();
  if(outputBaseIn<=1 || outputBaseIn>16)
  {
    correctOutputBase = false;
    correct = false;
  }
  else
  {
    correctOutputBase = true ;
  }

  var inputIn = input.value();
  for (var i = inputIn.length - 1; i >= 0; i--) {
    if(parseInt(inputIn[i],36) >=inputBaseIn)
    {

      correctInput = false;
      correct = false;
      break;
    }


  }
  if(correct)
  {
    output = parseInt(inputIn,inputBaseIn);
    output = output.toString(outputBaseIn);
  }
  else
  {
    output = "";
  }

  

  




  redraw();
  

}

function draw()
{
  createCanvas(windowWidth,windowHeight);
  background(255);
  text(output,windowWidth/2,windowHeight/2+65);

  text("Input Number",windowWidth/2-200,windowHeight/2-100);
  if(!correctInput)
  {
    push();
    fill("red");
    ellipse(windowWidth/2+200,windowHeight/2-110,10,10);
    text("Not possible in current base",windowWidth/2+220,windowHeight/2-105);
    pop();
  }


  text("Input Number base (2-16)",windowWidth/2-200,windowHeight/2-50);
  if(!correctInputBase)
  {
    push();
    fill("red");
    ellipse(windowWidth/2+200,windowHeight/2-60,10,10);
    pop();
  }
 

  text("Output Number base (2-16)",windowWidth/2-200,windowHeight/2);
  if(!correctOutputBase)
  {
    push();
    fill("red");
    ellipse(windowWidth/2+200,windowHeight/2-10,10,10);
    pop();
  }
}

