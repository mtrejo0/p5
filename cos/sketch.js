let origin;
let sin = []
let cos = []

let t = 0
let r = 100

let tSlider;
let rSlider;
let color = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);


  origin = {x: 100, y: windowHeight - 200}

  tSlider = createSlider(1, 50, 5);
  tSlider.position(500, 40);

  rSlider = createSlider(50, 300, 100);
  rSlider.position(500, 80);

  colorMode(HSB, 255); 
}

function draw() {
  background(0)

  r = rSlider.value()

  noFill()
  stroke(255)

  ellipse(origin.x, origin.y, 2*r)

  ellipse(origin.x + Math.cos(t)*r, origin.y + Math.sin(t)*r, 10)

  line( origin.x + Math.cos(t)*r,origin.y, origin.x + Math.cos(t)*r, origin.y + Math.sin(t)*r )
  line(origin.x,origin.y + Math.sin(t)*r,origin.x + Math.cos(t)*r, origin.y + Math.sin(t)*r )

  line(origin.x,origin.y,origin.x + Math.cos(t)*r, origin.y + Math.sin(t)*r )


  line(origin.x - r, origin.y, windowWidth, origin.y)

  line(origin.x, 0, origin.x, origin.y+r)

  sin.push(origin.y + Math.sin(t)*r)
  cos.push(origin.x + Math.cos(t)*r)

  
  



  for (let i = 1; i < sin.length; i++) {
    
    let n = (sin.length-i)


    color = (i*2) % 255

    stroke(color, 255, 255)

    line(origin.x+(n+1)*10,sin[i-1], origin.x+n*10,sin[i])
    ellipse(origin.x+n*10,sin[i], 5)

    line(cos[i-1], origin.y-(n+1)*10, cos[i], origin.y-n*10)
    ellipse(cos[i], origin.y-n*10, 5)
    
  }



  t += tSlider.value()/100

  
}

