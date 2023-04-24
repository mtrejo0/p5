

class BeatsController {
  constructor(callback) {
      this.bpm = 120
      this.callback = callback
      this.state = "idle"
      this.savedTime = 0;
      this.count = 0
  }

  reset() {
    this.savedTime = millis() / 1000
  }
  update() {

    let time = millis() / 1000 - this.savedTime

    let delta = 60 / this.bpm 

    if (time % delta < delta * .5  && this.state != "change"){
      this.state = "change"
      this.callback()
      this.savedTime = millis() / 1000
      this.count += 1
    }
    else if( time % delta < delta * .5 && this.state == "change"){
      this.state = "change"
    }
    else {
      this.state = "idle"
    }
  }
  draw(){
      fill("red")
      strokeWeight(0)
      text(`BPM: ${this.bpm}`, 10, 50);

      push()
      textSize(18)
      text(`Arrow keys to change`, 10, 90);
      pop()

      
  }
}

class Tapper {
  constructor(bpm) {
      this.bpm = bpm
      this.taps = []
  }

  calculateBPM(){
    if(this.taps.length === 1){
      return 0;
    }
    const averageDelta = ([x,...xs]) => {
      if (x === undefined)
        return NaN
      else
        return xs.reduce(
          ([acc, last], x) => [acc + (x - last), x],
          [0, x]
        ) [0] / xs.length
    };
    let bpm = 60/ (averageDelta(this.taps.slice(-5)) /1000)

    return int(bpm)
  }

  newTap(){

    let time = millis()
    if(abs(this.taps[this.taps.length-1] - time) > 3000){
      this.taps = []
      console.log("reset")
    }
    this.taps.push(time)

    let bpm = this.calculateBPM()
    console.log(bpm)

    if (bpm > 10) {
      bpm_controller.bpm = bpm
    }
    else {
      bpm_controller.bpm = 120
    }
  }
}



function new_beat() {
  console.log(bpm_controller.count)


  const current = (bpm_controller.count % 4) + 1

  text(current, windowWidth/2 + current * 100 - 250, windowHeight/2)


}


let bpm_controller = new BeatsController(new_beat)



let vid;
let img;
let cap;
// let mic;
let showCap = true;
let tapper = new Tapper()
function setup() {
  // put setup code here
  

  createCanvas(windowWidth, windowHeight)

  textSize(30);



}

let levels = []
function draw() {



  background(0, 120 * 4/bpm_controller.bpm);
  bpm_controller.update();
  bpm_controller.draw();




}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {

  let delta = 0
  let multiplier = 1
  if (keyCode === UP_ARROW) {
    delta = 5
  } 
  if (keyCode === DOWN_ARROW) {
    delta = -5
  } 

  if (keyCode === LEFT_ARROW) {
    delta = -1
  } 
  if (keyCode === RIGHT_ARROW) {
    delta = 1
  } 

  if (keyCode === 188) { // <
    multiplier = .5
  } 
  if (keyCode === 190) { // >
    multiplier = 2
  } 

  if (keyCode === 48) { // 0
    bpm_controller.reset()
  } 


  bpm_controller.bpm += delta

  bpm_controller.bpm *= multiplier


  if (keyCode === 32) { // space
    tapper.newTap()
  } 

  console.log("key", keyCode)

}
