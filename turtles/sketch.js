let turtles = []

let stars = []


function setup() {
  createCanvas(windowWidth, windowHeight);

  // generate stars
  for (let i = 0; i < 100; i++) {
    stars.push({x: Math.random() * windowWidth, y: Math.random() * windowHeight, r: Math.random() * 5})
  }

  
  
}


function draw() {
  background(0, 10)

  for (let i = stars.length-1; i >=0 ; i--) {
   
    let s = stars[i]

    s.x += 1
    x.y +=1
    
  }

}