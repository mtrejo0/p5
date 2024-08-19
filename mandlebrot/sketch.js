let maxIterations = 100;
let minVal = -2;
let maxVal = 2;
let centerX = 0;
let centerY = 0;
let zoomLevel = 1;
let isLoading = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noLoop();
  drawMandelbrot();
}

function drawMandelbrot() {
  loadPixels();
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let a = map(x, 0, width, minVal + centerX, maxVal + centerX);
      let b = map(y, 0, height, minVal + centerY, maxVal + centerY);
      
      let ca = a;
      let cb = b;
      
      let n = 0;
      
      while (n < maxIterations) {
        let aa = a * a - b * b;
        let bb = 2 * a * b;
        
        a = aa + ca;
        b = bb + cb;
        
        if (abs(a + b) > 16) {
          break;
        }
        
        n++;
      }
      
      let bright = map(n, 0, maxIterations, 0, 1);
      bright = map(sqrt(bright), 0, 1, 0, 255);
      
      if (n === maxIterations) {
        bright = 0;
      }
      
      let pix = (x + y * width) * 4;
      pixels[pix + 0] = bright;
      pixels[pix + 1] = bright;
      pixels[pix + 2] = bright;
      pixels[pix + 3] = 255;
    }
  }
  
  updatePixels();
  isLoading = false;
}

function mousePressed() {
  if (!isLoading) {
    isLoading = true;
    
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Loading...", width / 2, height / 2);
    
    // Use setTimeout to allow the loading message to be displayed
    setTimeout(() => {
      let zoomFactor = 10;
      zoomLevel *= zoomFactor;
      let newWidth = (maxVal - minVal) / zoomFactor;
      let newHeight = newWidth * (height / width);
      
      centerX = map(mouseX, 0, width, minVal + centerX, maxVal + centerX);
      centerY = map(mouseY, 0, height, minVal + centerY, maxVal + centerY);
      
      minVal = -newWidth / 2;
      maxVal = newWidth / 2;
      
      drawMandelbrot();
    }, 50); // Small delay to ensure the loading message is displayed
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawMandelbrot();
}
