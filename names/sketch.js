

var nameInput;

let savedName = "moises"

function randomColor(){
  let colors = ["#4287f5","#ff0000", "#42f5ef","#f542f5","#f5d442"]
  return colors[Math.floor(Math.random() * colors.length)]
}


function setup() {
  // put setup code here
  createCanvas(windowWidth, windowHeight)
  noStroke()
  textSize(30);

  nameInput = createInput(savedName);
  nameInput.position(50,50);

}

function draw() {
  // put drawing code here
  background(0,50);
  fill(255);

  if (nameInput.value().length > 0) {
    savedName = nameInput.value();

    text(savedName, windowWidth/2 - savedName.length * 8, windowHeight/2)
    fill(randomColor())

    for (let i = 0; i < 10; i ++) {
      push();
      translate(Math.random() * windowWidth, Math.random() * windowHeight);
      rotate(Math.random() * 10)
      text(savedName, 0, 0)
      pop();
      
    }
   
    
  }

}

