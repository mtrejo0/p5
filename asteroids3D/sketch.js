let t = 0; 
let redColor;
let greenColor;
let blueColor;
let sizeSlider;

let asteroids = [];


const getSign = () =>  Math.random() < .5 ? -1 : 1

class Asteroid {
  constructor(x, y, z) {
    this.x = x ?? Math.random() * windowWidth - windowWidth / 2;
    this.y = y ?? Math.random() * windowHeight - windowHeight / 2; 
    this.z = z ?? Math.random() * (windowWidth * 0.5) - windowWidth / 4; 

    this.size = Math.random() * 100 + 20;

    const vRange = 10;
    this.vx = Math.random() * vRange - vRange / 2;
    this.vy = Math.random() * vRange - vRange / 2;
    this.vz = Math.random() * vRange - vRange / 2;

    this.rx = Math.random() * 20 - 10;
    this.ry = Math.random() * 20 - 10;
    this.rz = Math.random() * 20 - 10;
  }

  draw() {
    push();
    translate(this.x, this.y, this.z); 
    rotateZ(this.rz * frameCount / 1000);
    rotateY(this.ry * frameCount / 1000);
    rotateX(this.rx * frameCount / 1000);
    box(this.size);
    pop();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.z += this.vz;
  }
}

let easycam;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  easycam = createEasyCam();

  for (let i = 0; i < 50; i++) {
    asteroids.push(new Asteroid());
  }
}

function draw() {
  background(0);

  asteroids.forEach(a => {
    a.draw();
    a.update();
  });
  

  if (frameCount % 10 == 0) {
    asteroids.push(new Asteroid(getSign() * windowWidth*2, getSign() * windowWidth*2, getSign() * windowWidth*2));

  }
}
