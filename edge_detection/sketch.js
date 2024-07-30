let originalImage;
let img;
let uploadButton;

function preload() {
  img = loadImage('nature.jpeg'); 
  originalImage = loadImage('nature.jpeg'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  uploadButton = createFileInput(handleFile);
  uploadButton.position(10, 10);
}

function handleFile(file) {
  if (file.type === 'image') {
    img = loadImage(file.data, () => {
      originalImage = img.get();
    });
  } else {
    console.log('Not an image file!');
  }
}

function grayScale() {
  img.loadPixels();
  for (let i = 0; i < img.width; i++) {
    for (let j = 0; j < img.height; j++) {
      let index = (i + j * img.width) * 4;
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      let gValue = (r + g + b) / 3;
      img.pixels[index] = gValue;
      img.pixels[index + 1] = gValue;
      img.pixels[index + 2] = gValue;
    }
  }
  img.updatePixels();
}

function edgeDetection(k) {
  let imgCopy = createImage(img.width, img.height);
  imgCopy.loadPixels();
  img.loadPixels();
  
  const r = Math.floor(k.length / 2);
  const w = img.width;
  const h = img.height;

  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      let sum = 0;
      const outIndex = (i + j * w) * 4;

      for (let ii = 0; ii < k.length; ii++) {
        for (let jj = 0; jj < k.length; jj++) {
          const x = constrain(i - r + ii, 0, w - 1);
          const y = constrain(j - r + jj, 0, h - 1);
          const index = (x + y * w) * 4;
          sum += img.pixels[index] * k[ii][jj];
        }
      }

      imgCopy.pixels[outIndex] = imgCopy.pixels[outIndex + 1] = imgCopy.pixels[outIndex + 2] = sum;
      imgCopy.pixels[outIndex + 3] = 255;
    }
    console.log(i/w * 100)
  }

  console.log("finished");
  imgCopy.updatePixels();
  img = imgCopy;
}

function draw() {
  // image(img, 0, 0, width, height);
  background(img)
}

function keyPressed() {
  if (key === "f") {
    img = originalImage.get();
  }

  if (key === " ") {
    grayScale();
  }

  // Sobel operators (edge detection)
  if (keyCode === UP_ARROW) {
    let k = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    console.log(k)
    edgeDetection(k);
  }
  if (keyCode === DOWN_ARROW) {
    let k = [
      [1, 2, 1],
      [0, 0, 0],
      [-1, -2, -1]
    ];
    console.log(k)
    edgeDetection(k);
  }

  // Prewitt operators (edge detection)
  if (keyCode === RIGHT_ARROW) {
    let k = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    edgeDetection(k);
  }
  if (keyCode === LEFT_ARROW) {
    let k = [
      [1, 0, -1],
      [2, 0, -2],
      [1, 0, -1]
    ];
    edgeDetection(k);
  }

  // Gaussian blur
  if (key === "g") {
    let k = [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ];
    k = k.map(row => row.map(val => val / 16)); // Normalize
    edgeDetection(k);
  }

  // Laplacian (edge detection)
  if (key === "l") {
    let k = [
      [0, 1, 0],
      [1, -4, 1],
      [0, 1, 0]
    ];
    edgeDetection(k);
  }

  // Sharpen
  if (key === "s") {
    let k = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ];
    edgeDetection(k);
  }
}
