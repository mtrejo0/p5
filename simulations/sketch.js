
let simulations = [[0,0]]
let origin = [0,0]
let step = 10
let max_steps = 100
let color = 0

let endStates = {}

let h = 4
let normalDistOrigin;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255); // Switch to HSV color mode

  origin = [100, windowHeight/2]

  normalDistOrigin = [10, windowHeight/2]

  background(0)

  // stroke(100)
  strokeWeight(5)


}

// Draw function
function draw() {

  background(0,1)


  let new_simulation = runSimulation()


  color = (color+1)%255

  stroke(color,255, 255)



  for (let i = 1; i < new_simulation.length; i++) {
    const curr = new_simulation[i];
    const last = new_simulation[i-1];

    line(
      origin[0] + curr[0] * step, origin[1] + curr[1] * step, 
      origin[0] + last[0] * step, origin[1] + last[1] * step
      )
    
  }




  push()
  for (const key in endStates) {
    
    let v = Number(key)
    stroke(0)
    fill(255)


    rect(
      normalDistOrigin[0], 
      normalDistOrigin[1] + v * step,
      normalDistOrigin[0] + endStates[key] * h,
      10,
      )
  }
  pop()







}


const runSimulation = () => {

  let arr = [[0,0]]
  for (let i = 1; i < max_steps; i++) {
    let old_y = arr[i-1][1]
    let new_y = old_y + (Math.random() < .5 ? 1 : -1)
    arr.push([i, new_y])
  }


  let finish = arr[max_steps-1][1]

  if(!endStates[finish]) endStates[finish] = 0
  endStates[finish] += 1

  return arr
}