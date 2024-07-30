
let points = []

let r;
function setup() {
  createCanvas(windowWidth, windowHeight);

  r = windowHeight / 3



}



function draw() {
  background(0)

  noFill()
  strokeWeight(5)
  stroke(255)
  ellipse(windowWidth/2, windowHeight/2, r * 2)

  rect(windowWidth/2 - r, windowHeight/2 -r,2*r,2*r)

  let insideCount = 0;
  points.forEach(p => {

    

    let x = p.x - windowWidth/2
    let y = p.y - windowHeight/2

    if (Math.sqrt(x * x + y * y) <= r) {
      stroke(255, 0, 0)
      insideCount += 1
    }
    else {
      stroke(255)
    }

    ellipse(p.x, p.y, 1)
    
  });


  for (let i = 0; i < 10; i++) {
    points.push({x: windowWidth/2 - r + Math.random()* 2* r, y: windowHeight/2 - r + Math.random()* 2* r })
  }
  
  


  strokeWeight(1)
  stroke(255)
  text(`points: ${points.length}`, 100, 100)
  text(`inside: ${insideCount}`, 100, 120)

  text(`pi approximation: ${ 4 / ((points.length / insideCount))}`, 100, 140)
  

  
}



// 4r^2 / pi r^2 = x