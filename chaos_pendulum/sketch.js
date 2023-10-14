class DoublePendulum {
  constructor(r1, r2, m1, m2, color) {
    this.r1 = r1;
    this.r2 = r2;
    this.m1 = m1;
    this.m2 = m2;
    this.a1 = Math.PI / 2;
    this.a2 = Math.PI / 2;
    this.a1_v = 0;
    this.a2_v = 0;
    this.g = 1;
    this.cx = width / 2;
    this.cy = height / 3;
    this.px2 = -1;
    this.py2 = -1;
    this.color = color;
    this.path = [];
  }

  update() {
    const num1 = -this.g * (2 * this.m1 + this.m2) * Math.sin(this.a1);
    const num2 = -this.m2 * this.g * Math.sin(this.a1 - 2 * this.a2);
    const num3 = -2 * Math.sin(this.a1 - this.a2) * this.m2;
    const num4 = this.a2_v * this.a2_v * this.r2 + this.a1_v * this.a1_v * this.r1 * Math.cos(this.a1 - this.a2);
    const den = this.r1 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.a1 - 2 * this.a2));
    const a1_a = (num1 + num2 + num3 * num4) / den;

    const num5 = 2 * Math.sin(this.a1 - this.a2);
    const num6 = (this.a1_v * this.a1_v * this.r1 * (this.m1 + this.m2));
    const num7 = this.g * (this.m1 + this.m2) * Math.cos(this.a1);
    const num8 = this.a2_v * this.a2_v * this.r2 * this.m2 * Math.cos(this.a1 - this.a2);
    const den2 = this.r2 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.a1 - 2 * this.a2));
    const a2_a = (num5 * (num6 + num7 + num8)) / den2;

    this.a1_v += a1_a;
    this.a2_v += a2_a;
    this.a1 += this.a1_v;
    this.a2 += this.a2_v;

    const x2 = this.cx + this.r1 * Math.sin(this.a1) + this.r2 * Math.sin(this.a2);
    const y2 = this.cy + this.r1 * Math.cos(this.a1) + this.r2 * Math.cos(this.a2);
    this.path.push({ x: x2, y: y2 });

    if (this.path.length > 200) this.path.shift(1)

  }

  display() {
    push();
    translate(this.cx-windowWidth/4, this.cy);
    stroke(this.color);
    strokeWeight(2);
  
    const x1 = this.r1 * Math.sin(this.a1);
    const y1 = this.r1 * Math.cos(this.a1);
  
    const x2 = x1 + this.r2 * Math.sin(this.a2);
    const y2 = y1 + this.r2 * Math.cos(this.a2);
  
    line(0, 0, x1, y1);
    fill(this.color);
    ellipse(x1, y1, this.m1, this.m1);
  
    line(x1, y1, x2, y2);
    fill(this.color);
    ellipse(x2, y2, this.m2, this.m2);
  
    stroke(this.color);
    for (let i = 1; i < this.path.length; i++) {
      const prev = this.path[i - 1];
      const curr = this.path[i];
      line(prev.x, prev.y-windowHeight/3, curr.x, curr.y-windowHeight/3);
    }
  
    pop();
  }
  
}

let doublePendulums = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

  const numPendulums = 10;

  for (let i = 0; i < numPendulums; i++) {
    const color = colors[i % colors.length]; // Cycle through the rainbow colors
    doublePendulums.push(new DoublePendulum(125, 125+i+Math.random()*2, 10, 10, color));
  }
}

function draw() {
  background(0);
  for (let doublePendulum of doublePendulums) {
    doublePendulum.display();
    doublePendulum.update();
  }
}
