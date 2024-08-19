function Tree (x , y, h) {

  this.x = x;
  this.y = y;
  this.left;
  this.right;
  this.h = h ?? 1
  

  this.draw = () => {

    ellipse(this.x, this.y, 5)

    if (this.left) {
      line(this.x, this.y, this.left.x, this.left.y)
      this.left.draw()
    }
    if (this.right) {
      line(this.x, this.y, this.right.x, this.right.y)
      this.right.draw()
    }


  }

  this.growRight = () => {

    this.right = new Tree(this.x + windowWidth/4 / Math.pow(this.h, 1.6180339887498947), this.y + 50)
    this.right.h = this.h + 1
  }

  this.growLeft = () => {

    this.left = new Tree(this.x - windowWidth/4 / Math.pow(this.h, 1.6180339887498947), this.y + 50)

    this.left.h = this.h + 1
  }

  this.kids = () => {



    if (!this.right && !this.left ) return 1

    let s = 0

    if (this.right) s += this.right.kids()
    if (this.left) s += this.left.kids()

    return s


  }


}

let t;

function setup() {
  createCanvas(windowWidth,windowHeight);
  background(255)

  stroke(0)
  fill(0)

  t = new Tree(windowWidth/2, 0)

  console.log(t)

  
  t.growLeft()
  t.growRight()
  

}


function draw() {


  t.draw()

  console.log(t.kids())
  

  let c = t

  while (c.left || c.right)  {



    if (c.left && !c.right) {

      c = c.left
      continue
    }
    if (!c.left && c.right) {

      c = c.right
      continue
    }

    if ( Math.random() < .5) {
      c = c.right
    }
    else {

      c = c.left

    }
    
  }

  c.growLeft()
  
  c.growRight()
  

}
