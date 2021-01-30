

function setup() {
  // put setup code here
 createCanvas(windowHeight,windowHeight);
 console.log(windowHeight)

}

function keyTyped() {

  if (key === " ") {
    console.log("space")
    for (var i = 0; i < windowHeight; i+=100) {
      for (var j = 0; j < windowHeight; j+=100) {
        console.log(i+" "+j)
        console.log(get(i,j))
      }
    }
  } else if (key === "f") {
    calculateWeights()

  }
}

function calculateWeights(){

  arr = []
  norm = []
  space = windowHeight/28|0
  for (var i = 0; i < 28; i++) {
    for (var j = 0; j < 28; j++) {
      total = 0
      for (var k = 0; k < space; k++) {
        for (var l = 0; l < space; l++) {
          x = i*space+k
          y = j*space+l
          total += get(x,y)[3]
        }
      }
      avg = total/(space*space)
      noStroke()
      fill(255 - avg)
      rect(i*space,j*space,space,space)

      arr.push(avg)
      norm.push(avg/255)
    }
  }
  console.log(""+norm)


}


function mouseDragged() {
  push()
  strokeWeight(100)
  line(mouseX, mouseY, pmouseX, pmouseY);

  pop()
}
function mousePressed(){
  i = mouseX
  j = mouseY
  console.log(i+" "+j)
  console.log(get(i,j))
}
