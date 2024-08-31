let img;
let pixelSize = 10;
let shapeType = 'circle';
let pixelatedImg;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create file input
  let fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);
  
  // Create pixel size slider
  let sizeSlider = createSlider(5, 50, 10);
  sizeSlider.position(10, 40);
  sizeSlider.input(() => pixelSize = sizeSlider.value());
  
  // Create shape type radio buttons
  let shapeRadio = createRadio();
  shapeRadio.option('circle');
  shapeRadio.option('square');
  shapeRadio.selected('circle');
  shapeRadio.position(10, 70);
  shapeRadio.changed(() => shapeType = shapeRadio.value());
  
  // Create go button
  let goButton = createButton('Go');
  goButton.position(10, 100);
  goButton.mousePressed(processImage);
  
  // Create download button
  let downloadButton = createButton('Download');
  downloadButton.position(10, 130);
  downloadButton.mousePressed(downloadImage);
}

function draw() {
  background(0);
  if (img) {
    image(img, 0, 0);
  }
  if (pixelatedImg) {
    image(pixelatedImg, 0, 0);
  }
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      // Resize canvas to match image dimensions
      resizeCanvas(img.width, img.height);
      // Center the canvas on the screen
      let x = (windowWidth - width) / 2;
      let y = (windowHeight - height) / 2;
      canvas.position(x, y);
    });
  }
}

function processImage() {
  if (!img) return;
  
  pixelatedImg = createGraphics(img.width, img.height);
  pixelatedImg.background(0);
  
  img.loadPixels();
  for (let y = 0; y < img.height; y += pixelSize) {
    for (let x = 0; x < img.width; x += pixelSize) {
      let index = 4 * (y * img.width + x);
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      
      pixelatedImg.noStroke();
      pixelatedImg.fill(r, g, b);
      
      if (shapeType === 'circle') {
        pixelatedImg.ellipse(x, y, pixelSize, pixelSize);
      } else {
        pixelatedImg.rect(x, y, pixelSize, pixelSize);
      }
    }
  }
}

function downloadImage() {
  if (pixelatedImg) {
    saveCanvas(pixelatedImg, 'pixelated_image', 'png');
  }
}

function windowResized() {
  if (img) {
    // Center the canvas on the screen
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 2;
    canvas.position(x, y);
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }
}
