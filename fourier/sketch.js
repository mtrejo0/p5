let time = 0;
const wave = []; // Array to store the signal waveform
const fourierX = []; // Array to store the Fourier Transform for X
const fourierY = []; // Array to store the Fourier Transform for Y
const maxHarmonics = 20; // Number of harmonics (circles) to display


function setup() {
  createCanvas(windowWidth, windowHeight);
  translate(width / 2, height / 2); 
}


class Complex {
  constructor(a, b) {
    this.re = a;
    this.im = b;
  }

  add(other) {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other) {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mult(other) {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }
}

function dft(x) {
  const X = [];
  const N = x.length;
  for (let k = 0; k < N; k++) {
    let sum = new Complex(0, 0);
    for (let n = 0; n < N; n++) {
      const phi = (TWO_PI * k * n) / N;
      const c = new Complex(cos(phi), -sin(phi));
      sum = sum.add(x[n].mult(c));
    }
    sum.re /= N;
    sum.im /= N;

    let freq = k;
    let amp = sqrt(sum.re * sum.re + sum.im * sum.im);
    let phase = atan2(sum.im, sum.re);
    X[k] = { freq, amp, phase };
  }
  return X;
}


function createSignal() {
  const frequency = 1 / 3; // Frequency of the square wave (adjust as needed)
  const amplitude = 100; // Amplitude of the square wave (adjust as needed)
  const squareWave = amplitude * (sin(TWO_PI * frequency * time) >= 0 ? 1 : -1);
  wave.unshift(squareWave); // Add the y-coordinate to the beginning of the array
}

function calculateFFT() {
  const X = [];
  const Y = [];
  for (let i = 0; i < wave.length; i++) {
    X[i] = new Complex(wave[i], 0);
    Y[i] = new Complex(0, 0);
  }
  const fftX = dft(X);
  const fftY = dft(Y);

  fourierX.unshift(fftX);
  fourierY.unshift(fftY);

  if (fourierX.length > maxHarmonics) {
    fourierX.pop();
    fourierY.pop();
  }
}


function draw() {
  background(255);

  createSignal();
  calculateFFT();
  

  let x = 0;
  let y = 0;

  for (let i = 0; i < fourierX.length; i++) {
    const prevX = x;
    const prevY = y;
    const freqX = fourierX[i].freq;
    const freqY = fourierY[i].freq;
    const radius = fourierX[i].amp / 100; // Adjusting the circle size for better visualization

    x += radius * cos(freqX * time + fourierX[i].phase);
    y += radius * sin(freqY * time + fourierY[i].phase);

    stroke(0, 100);
    noFill();
    ellipse(prevX, prevY, radius * 2);

    // Draw line from the center of the previous circle to the current one
    stroke(0);
    line(prevX, prevY, x, y);
  }

  wave.unshift(x); // Add the x-coordinate to the beginning of the array
  beginShape();
  noFill();
  stroke(255, 0, 0); // Red for the resulting spiral
  for (let i = 0; i < wave.length; i++) {
    vertex(i + 200, wave[i]);
  }
  endShape();

  const dt = TWO_PI / wave.length;
  time += dt;

  if (wave.length > 500) {
    wave.pop();
  }
}
