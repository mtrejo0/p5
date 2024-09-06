let classifier;
let img;
let label = "";
let confidence = "";

function preload() {
  classifier = ml5.imageClassifier('MobileNet');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("Upload an image to classify", width/2, height/2);

  // Create file input
  let fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);
}

function draw() {
  if (img) {
    let aspectRatio = img.width / img.height;
    let newWidth, newHeight;
    
    if (width / height > aspectRatio) {
      newHeight = height - 100;
      newWidth = newHeight * aspectRatio;
    } else {
      newWidth = width;
      newHeight = newWidth / aspectRatio;
    }
    
    let x = (width - newWidth) / 2;
    let y = 100 + (height - 100 - newHeight) / 2;
    
    image(img, x, y, newWidth, newHeight);
  }
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      image(img, 0, 0);
      classifyImage();
    });
  } else {
    console.log('Not an image file!');
  }
}

function classifyImage() {
  classifier.classify(img, gotResult);
}

function gotResult(results, error) {
  if (error) {
    console.error(error);
    return;
  }

  console.log(results)
  background(255);
  textSize(16);
  textAlign(LEFT, TOP);
  let y = 30;
  for (let i = 0; i < results.length; i++) {
    let label = results[i].label;
    let confidence = nf(results[i].confidence, 0, 2);
    fill(0);
    text(`${label}: ${confidence}`, 10, y);
    y += 20;
  }
}
