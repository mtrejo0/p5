class ShrinkingCircle {
  constructor(bpm, pos) {
      this.bpm = bpm
      this.pos = pos ?? [Math.random() * windowWidth,Math.random() * windowHeight]
      this.r = 0
      this.alpha = 225
      this.color = color_controller.get_color()
      this.max_r = 500
  }

  draw() {
    stroke(255,255,255, this.alpha)

    let r,g,b;
    [r,g,b] = this.color
    stroke(r,g,b, this.alpha)
    // stroke(255,255,255, this.alpha)
    // stroke(0,0,0, this.alpha)
    strokeWeight(5)

    fill(r,g,b,this.alpha)
    ellipse(this.pos[0], this.pos[1] , this.r)
    
    this.r += this.max_r / this.bpm * 4
    this.alpha -= 225 / this.bpm * 2
    return this.r < this.max_r
  }
}

class Curve {
  constructor(bpm, clockwise) {

    this.theta = 0    

    this.clockwise = clockwise
    
    this.r = 1
    this.bpm = bpm
    this.color = color_controller.get_color()
  }

  draw() {
    strokeWeight(0)
    let [r,g,b] = color_controller.get_color()
    // let [r,g,b] = this.color
    fill(r,g,b)

    this.points = []
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < this.r; i++) {

        strokeWeight(i*2)
        stroke(r,g,b)
        let x = windowWidth/2 + windowWidth/4 * i /12 * Math.cos((this.clockwise ? 1 : -1 ) * i/10 * 2*Math.PI + this.theta + j * Math.PI/2)
        let y = windowHeight/2 + windowWidth/4 * i /12 * Math.sin((this.clockwise ? 1 : -1 ) * i/10 * 2*Math.PI + this.theta + j * Math.PI/2)
        ellipse(x, y, 10, 10)
      }
      
    }
    this.theta += Math.PI / 6

    this.r += 60 / this.bpm * 2

    return  this.r < 30

    
  }
}

class ConcentricCircle {
  constructor(bpm) {
      this.bpm = bpm
      this.pos = [windowWidth/2,windowHeight/2]
      this.r = 0
      this.alpha = 100
      this.color = color_controller.get_color()
      this.max_r = windowWidth
      
  }

  draw() {
    strokeWeight(0)
    let r,g,b;
    [r,g,b] = this.color

    fill(r,g,b,this.alpha)
    ellipse(this.pos[0], this.pos[1] , this.r)
    
    this.r += this.max_r / this.bpm * 4
    this.alpha -= 225 / this.bpm * 2
    return this.r < this.max_r
  }
}

class ObjectsController {
  constructor(bpm) {
      this.objects = []
      this.bpm = bpm
      this.object_types={
        "ShrinkingCircle": true, 
        "LineFlash": true, 
        "LineCross": true,
        "ConcentricCircle": true,
        "Curve": true
      }
      this.theta = 0
      this.curve_count = 0
  }
  update() {
    var i = this.objects.length
    while (i--) {
      let object = this.objects[i]

      if(!this.object_types[object.constructor.name]) continue

      if (!object.draw()) { 
          this.objects.splice(i, 1);
      } 
    }
  }
  new_object() {



    if(this.object_types["Curve"]) {
        this.objects.push(new Curve(this.bpm, this.curve_count < 2))
        this.clockwise = !this.clockwise
        this.curve_count += 1
        this.curve_count = this.curve_count%4

      }

    for(let i = 0 ; i < 5; i ++) {
      // if(this.object_types["ShrinkingCircle"]) {
      //   this.objects.push(new ShrinkingCircle(this.bpm))
      // }

      // if(this.object_types["ShrinkingCircle"]) {
      //   this.objects.push(new ShrinkingCircle(this.bpm, [windowWidth/6 * (i+1), windowHeight/2]))
      // }

      if(this.object_types["ShrinkingCircle"]) {
        
        
        let x = windowWidth/2 + windowWidth / 4 * Math.cos(Math.PI*2/5*i + this.theta)
        let y = windowHeight/2 + windowWidth / 4 * Math.sin(Math.PI*2/5*i + this.theta)

        this.theta += Math.PI/60

        // let x = windowWidth/6 * (i+1)
        // let y = windowHeight/2

        this.objects.push(new ShrinkingCircle(this.bpm, [x,y]))
      }
      if(this.object_types["LineFlash"]) {
        this.objects.push(new LineFlash(this.bpm))
      }
      if(this.object_types["LineCross"]) {
        this.objects.push(new LineCross(this.bpm))
      }

      if(this.object_types["ConcentricCircle"]) {
        this.objects.push(new ConcentricCircle(this.bpm))
      }
    }
  }

  clear_objects(type) {
    var i = this.objects.length
    while (i--) {
      let object = this.objects[i]
      if (object.constructor.name == type) { 
        this.objects.splice(i, 1);
      } 
    }
  }

  toggle_draw(object_name) {
    this.object_types[object_name] = !this.object_types[object_name]
  }
}

class LineFlash {
  constructor(bpm) {
      this.bpm = bpm
      this.pos = [Math.random() * windowWidth,Math.random() * windowHeight]
      
      
      this.color = color_controller.get_color()
      this.max_r = 500
      this.r = this.max_r
      this.max_alpha = 100
      this.alpha = this.max_alpha
  }

  draw() {
    stroke(this.color)
    // stroke("white")
    strokeWeight(10)
    let r,g,b;
    [r,g,b] = this.color

    fill(r,g,b,this.alpha)

    rectMode(CENTER);
    rect(this.pos[0], this.pos[1] , this.r, 4 * windowHeight)
    
    this.r -= this.max_r / this.bpm * 4
    this.alpha -= this.max_alpha / this.bpm * 2
    return this.r > 0
  }
}

class LineCross {
  constructor(bpm) {
      this.bpm = bpm
      this.y1 = Math.random() * windowHeight
      this.y2 = Math.random() * windowHeight
      this.color = color_controller.get_color()

      this.max_alpha = 100
      this.alpha = this.max_alpha

      this.dir = Math.random() > .5 ? -1 : 1

      this.theta = 0
  }

  draw() {
    let r,g,b;
    [r,g,b] = this.color

    fill(r,g,b,this.alpha)
    strokeWeight(10)
    stroke(r,g,b,100)

    rectMode(CENTER);
    line(0, this.y1, windowWidth, this.y2)
    
    let change = Math.sin(this.theta) * 10
    this.theta += Math.PI /60
    if (this.dir < 0) {

      this.y1 += change
      this.y2 -= change
    }
    else {
      this.y1 -= change
      this.y2 += change
    }
    
    this.alpha -= this.max_alpha / this.bpm * 4

    return this.alpha > 0
  }
}

class BeatsController {
  constructor(callback) {
      this.bpm = 120
      this.callback = callback
      this.state = "idle"
      this.savedTime = 0;
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

      
  }
}

class ColorController {
  constructor(bpm) {
      this.bpm = bpm
      
      this.states = ["red", "blue", "green", "purple", "yellow","red-purple", "yellow-purple", "yellow-blue", "random"]
      this.state = "random"

      this.delta = 60 / this.bpm

      this.color;

  }
  color_shift(color){
        
    if (this.state == "random") {
        h,s,v = color.hsv
        h += random()/2
        h = h % 1
        return h,1,1
    }
    return this.get_color()
  }
  shift_state(change = 1) {
    let i = this.states.indexOf(this.state)
    i = (i+change)%this.states.length
    if (i < 0) i = this.states.length -1
    this.state = this.states[i]
  }

  get_red () {
    let r = random(100,255); 
    let b = random(50,100);
    let g = b/2;

    while(r + g + b < 255) {
      [r,g,b] = this.get_red();
    }

    return [r,g,b]
  }
  
  get_blue() {
    let r = 0; 
    let g = random(100,255); 
    let b = random(100,255);
    while(r + g + b < 255) {
      [r,g,b] = this.get_blue();
    }

    return [r,g,b]
  }

  get_green() {
    let r = random(0,100); 
    let g = random(200,255); 
    let b = random(0,100);
    return [r,g,b]
  }

  get_purple() {
    let r = random(90,150); 
    let g = random(0,50); 
    let b = 255;
    return [r,g,b]
  }

  get_yellow() {
    let r = random(200,255); 
    let g = random(200,255); 
    let b = 0;
    return [r,g,b]
  }

  get_random_rgb() {
    return [random(0,255), random(0,255), random(0,255)]
  }

  get_random() {
    
    if (this.color == undefined) {
      this.color = this.get_random_rgb()
    }
    let [r,g,b] = this.color

    r += random(100,200)
    g += random(100,200)
    b += random(100,200)

    r = r%255
    g = g%255
    b = b%255

    while( r + g + b < 255 * 2) {
      [r,g,b] = this.get_random_rgb()
    }

    return [r,g,b]
  }
  
  get_color(){

    if (this.state == "red"){
      this.color = this.get_red()
    } 
    if (this.state == "blue"){
      this.color = this.get_blue()
    } 

    if (this.state == "green"){
      this.color = this.get_green()
    } 

    if (this.state == "purple"){
      this.color = this.get_purple()
    } 

    if (this.state == "yellow"){
      this.color = this.get_yellow()
    } 

    if (this.state == "red-purple"){
      let choices = [this.get_purple(), this.get_red()]
      this.color = choices[Math.floor(Math.random() * choices.length)];
    } 

    if (this.state == "yellow-purple"){
      let choices = [this.get_purple(), this.get_yellow()]
      this.color = choices[Math.floor(Math.random() * choices.length)];
    } 

    if (this.state == "yellow-blue"){
      let choices = [this.get_blue(), this.get_yellow()]
      this.color = choices[Math.floor(Math.random() * choices.length)];
    } 

    if (this.state == "random") {
      this.color = this.get_random()
    }

    return this.color
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


let color_controller = new ColorController(120)
let objects_controller = new ObjectsController(120)

function new_beat() {
  let color = color_controller.get_color()
  background(color)

  objects_controller.new_object()

  // let [r,g,b] = color
  // tint(r,g,b,255)
  // image(img, 0, 0, windowWidth, windowHeight);

  // tint(r,g,b,255)
  // image(vid, 0, 0);
  // let time =int(100 * Math.random())
  // console.log(time, vid.time(), vid.duration())
  // vid.time(time)

}


let bpm_controller = new BeatsController(new_beat)



let vid;
let img;
let cap;
// let mic;
let showCap = true;
let tapper = new Tapper()
function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(30);

  cap = createCapture(VIDEO);
  cap.hide();

  console.log(", - halves the bpm\n\
. - doubles the bpm\n\
[ ] - shifts color theme down/up\n\
1 - toggles random circles\n\
2 - toggles verticle lines\n\
3 - toggles spiral lines\n\
4 - toggles center circle\n\
up/down - changes bpm +/- 5\n\
left/right - changes bpm +/- 1\n\
spacebar - tap for the program to learn the BPM you are tapping at");
}

let levels = []
function draw() {
  // Display the webcam feed as background
  

  if (frameCount % 2 == 0) {
    image(cap, 0, 0, windowWidth, windowHeight);
  }

  

  background(0, 120 * 4/bpm_controller.bpm);


  // if (showCap) {
  //   image(cap, 0, 0, windowWidth, windowHeight);
  // }

  bpm_controller.update();
  bpm_controller.draw();
  objects_controller.update();


  // let flag = millis() % 100 < 50
  // console.log(flag)
  // if (flag) {
  //   tint(255,100)
  //   image(vid, 0, 0);
  //   tint(255,100)
  //   image(img, 0, 0);
  // }
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

  if (keyCode === 49) { // 1
    objects_controller.toggle_draw("ShrinkingCircle")
    objects_controller.clear_objects("ShrinkingCircle")
  } 
  if (keyCode === 50) { // 2
    objects_controller.toggle_draw("LineFlash")
    objects_controller.clear_objects("LineFlash")
  } 
  if (keyCode === 51) { // 3
    objects_controller.toggle_draw("LineCross")
    objects_controller.clear_objects("LineCross")
  } 

  if (keyCode === 52) { // 4
    objects_controller.toggle_draw("ConcentricCircle")
    objects_controller.clear_objects("ConcentricCircle")
  } 

  if (keyCode === 53) { // 5
    objects_controller.toggle_draw("Curve")
    objects_controller.clear_objects("Curve")
  } 

  if (keyCode === 67) { // c
    showCap = !showCap
  } 



  bpm_controller.bpm += delta
  color_controller.bpm += delta

  bpm_controller.bpm *= multiplier
  color_controller.bpm *= multiplier


  if (keyCode === 219) { // [
    color_controller.shift_state(-1)
  } 
  if (keyCode === 221) { // ]
    color_controller.shift_state(1)
  } 

  if (keyCode === 32) { // space
    tapper.newTap()
  } 

  console.log("key", keyCode)

}


class Heart {
  constructor() {
      
      this.x = Math.random()*1500;
      this.y = Math.random()*500;
      this.vx = getRandomArbitrary(-10, 10);
      this.vy = getRandomArbitrary(-30, 0);
      this.ay = Math.random();
      this.color = randomColor()
      this.streak = [[this.x,this.y]]
  }
  update() {
      this.x += this.vx
      this.y += this.vy
      this.vy += this.ay

      this.streak.push([this.x,this.y])
      
      if (this.streak.length > 10){
          this.streak.shift()
      }

      if (Math.random() < .05){
          this.color = randomColor();
      }
  }
  draw(){
      fill(this.color)
      for(let i = 0 ; i < this.streak.length; i ++){
          let coord = this.streak[i]
          circle(coord[0],  coord[1], i);
      }

      beginShape();
      vertex(this.x, this.y);
      vertex(this.x+10, this.y-10);
      vertex(this.x+15, this.y);
      vertex(this.x, this.y+15);
      vertex(this.x-15, this.y);
      vertex(this.x-10, this.y-10);
      endShape(CLOSE);
  }
}