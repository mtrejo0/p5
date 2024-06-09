

let msg = "Add a number, press f to calculate"

let model;
async function loadModel() {
  model = await tf.loadLayersModel('https://example.com/mnist/model.json');
}

function setup() {
  // put setup code here
 createCanvas(windowHeight,windowHeight);
 console.log(windowHeight)

 text(msg, 10, 10)

 loadModel()

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
    push()
    fill(255)
    text(msg, 10, 10)
    pop()
    calculateWeights()

  }
  if (key === 'p') { // Let 'p' be the key to predict the number
    predictNumber();
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

function preprocessCanvas() {
  let img = get(); // Get the image data from the canvas
  img.resize(28, 28); // Resize to 28x28
  img.loadPixels();
  const inputs = [];
  for (let i = 0; i < img.pixels.length; i += 4) {
    // Convert to grayscale and normalize
    const avg = (img.pixels[i] + img.pixels[i + 1] + img.pixels[i + 2]) / 3;
    inputs.push(avg / 255);
  }
  return tf.tensor2d([inputs], [1, 784]); // Create a tensor
}

async function predictNumber() {
  const processed = preprocessCanvas();
  const prediction = model.predict(processed.reshape([1, 28, 28, 1])); // Reshape if your model expects a 4D tensor
  const predictedLabel = prediction.argMax(1).dataSync()[0]; // Get the label with the highest probability
  console.log(`Predicted Label: ${predictedLabel}`);
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
