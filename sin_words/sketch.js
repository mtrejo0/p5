let origin;
let sin = []

let t = 0
let r = 100

let tSlider;
let rSlider;
let sSlider;
let color = 0;

var nameInput;
let savedName = "moises"

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);


  origin = {x: -100, y: windowHeight/2}

  tSlider = createSlider(1, 50, 5);
  tSlider.position(500, 40);

  rSlider = createSlider(50, 300, 100);
  rSlider.position(500, 80);

  sSlider = createSlider(1, 30, 15);
  sSlider.position(500, 120);

  colorMode(HSB, 255); 

  nameInput = createInput(savedName);
  nameInput.position(50,50);

  textSize(30)

}

function draw() {
  background(0)

  r = rSlider.value()

  fill(color, 255, 255)
  stroke(255)

  if (frameCount % 2 == 0) {
    sin.push(origin.y + Math.sin(t)*r)
  }
  

  
  


  let v = nameInput.value();
  let s = sSlider.value()


  for (let i = 1; i < sin.length; i++) {
    
    let n = (sin.length-i)


    color = (i*2) % 255

    stroke(color, 255, 255)

    // line(origin.x+(n+1)*10,sin[i-1], origin.x+n*10,sin[i])
    // ellipse(origin.x+n*10,sin[i], 5)
    text(v, origin.x+n*(v.length * s),sin[i])

    
  }



  t += tSlider.value()/100

  

  
}

