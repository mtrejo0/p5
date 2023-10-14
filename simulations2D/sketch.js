
let players = []


let w = 100
let h = 50



let origin = {x: 300, y: 100}

let size = 8
let step = 10


let creationRate = 0

let bornWithItRate = .2

let transferRate = .2

let recoveryRate = 0.1

let initialPop = 500

let deathHorizon = 100

let infectionDistance = 1

let history = []


let removeThese = []


let graphStep = 2;

let graphOrigin;


let creationRateSlider, bornWithItRateSlider, transferRateSlider, recoveryRateSlider, applyButton;
let creationRateLabel, bornWithItRateLabel, transferRateLabel, recoveryRateLabel;


function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255); // Switch to HSV color mode


  background(0)

  for (let i = 0; i < initialPop; i++) {
    players.push(new Player())
    
  }
  
  frameRate(10)

  graphOrigin = [10, windowHeight-10]
  textSize(40)


  // Create sliders with labels
  creationRateSlider = createSlider(0, 1, creationRate, 0.01);
  creationRateSlider.position(150, 100);
  creationRateLabel = createElement('p', 'Creation Rate');
  creationRateLabel.position(0, 80);
  creationRateLabel.style('color', 'white'); // Set label color to white

  bornWithItRateSlider = createSlider(0, 1, bornWithItRate, 0.01);
  bornWithItRateSlider.position(150, 130);
  bornWithItRateLabel = createElement('p', 'Born With It Rate');
  bornWithItRateLabel.position(0, 110);
  bornWithItRateLabel.style('color', 'white'); // Set label color to white

  transferRateSlider = createSlider(0, 1, transferRate, 0.01);
  transferRateSlider.position(150, 160);
  transferRateLabel = createElement('p', 'Transfer Rate');
  transferRateLabel.position(0, 140);
  transferRateLabel.style('color', 'white'); // Set label color to white

  recoveryRateSlider = createSlider(0, 1, recoveryRate, 0.01);
  recoveryRateSlider.position(150, 190);
  recoveryRateLabel = createElement('p', 'Recovery Rate');
  recoveryRateLabel.position(0, 170);
  recoveryRateLabel.style('color', 'white'); // Set label color to white

  // Create apply button
  applyButton = createButton('Apply');
  applyButton.position(100, 220);
  applyButton.mousePressed(applyChanges);

}

function applyChanges() {
  // Update simulation parameters with slider values
  creationRate = creationRateSlider.value();
  bornWithItRate = bornWithItRateSlider.value();
  transferRate = transferRateSlider.value();
  recoveryRate = recoveryRateSlider.value();

  // Restart the simulation
  restartSimulation();
}

// Update the display of slider values
function updateSliderValues() {
  creationRateLabel.html('Creation Rate: ' + creationRateSlider.value());
  bornWithItRateLabel.html('Infected Born Rate: ' + bornWithItRateSlider.value());
  transferRateLabel.html('Transfer Rate: ' + transferRateSlider.value());
  recoveryRateLabel.html('Recovery Rate: ' + recoveryRateSlider.value());


  push()

  textSize(18 )
  fill(255)
  text("Population Size: "+ players.length, 0, 300 )
  pop()
}

function restartSimulation() {
  // Reset simulation variables
  players = [];
  history = [];
  removeThese = [];

  // Create initial population of players
  for (let i = 0; i < initialPop; i++) {
    players.push(new Player());
  }

  // Clear canvas
  background(0);
}


function saveHistory() {


  let state = {0: 0, 1: 0, 2: 0}

  players.forEach(player => {

    state[player.state] += 1

    
  });

  history.push(state)
}

function removePlayers() {


  let keepThese = []

  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    let remove = false
    for (let j = 0; j < removeThese.length; j++) {
      const other_player = removeThese[j];

      if (player.x == other_player.x && player.y == other_player.y) {
        remove = true
        break
      }
      
      
    }
    if (remove) continue
    keepThese.push(player)
    
  }

  removeThese = []

  players = [...keepThese]
}

// Draw function
function draw() {

  background(0)

  updateSliderValues()

 

  
  fill(255)
  text("Infection Rates", 100, 50)
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {

      
      rect(origin.x + step * i, origin.y + step * j, 2)
      
    }
  }


  players.forEach(player => {
    player.draw()
    player.update()
  });

  players.forEach(player => {
    player.updateSickness()
  });



  if (Math.random() < creationRate){
    players.push(new Player())
  }

  removePlayers()

  push()
  for (let i = 1; i < history.length; i++) {
    const lastHistory = history[i];
    const currHistory = history[i-1]

    for (let j = 0; j < 3; j++) {

      if(j == 0)  stroke(100,255, 255)
      if(j == 1) stroke(255,255, 255)
      if(j == 2) stroke(50,255, 255)

      line( 
        graphOrigin[0] + (i-1)*graphStep, graphOrigin[1] -currHistory[j]/2, 
        graphOrigin[0] + i*graphStep, graphOrigin[1] -lastHistory[j]/2
      )
      
    }
    
  }
  pop()

  saveHistory()


}



class Player {
  constructor() {

    this.state = Math.random() < bornWithItRate ? 1 : 0


    while(true) {

        let rx = Math.floor(Math.random()*w)
        let ry = Math.floor(Math.random()*h)

        let make = true
        for (let i = 0; i < players.length; i++) {
          const other_player = players[i];
    
          if (other_player.x == rx && other_player.y == ry) {
            make = false
    
          }
          
        }
        if (make) {
          this.x = rx
          this.y = ry
          break
        }
     }

     this.age = 0
      
      
      
  }
  update() {
    
    this.age += 1



    let rx = Math.floor(Math.random()*3)
    let dx = [1,0,-1][rx]
    let ry = Math.floor(Math.random()*3)
    let dy = [1,0,-1][ry]

    if (dx == 0 && dy == 0) return

    let new_x = this.x + dx
    let new_y = this.y + dy

    if (new_x < 0 || new_x >= w) return
    if (new_y < 0 || new_y >= h) return


    let move = true
    for (let i = 0; i < players.length; i++) {
      const other_player = players[i];

      if (other_player.x == new_x && other_player.y == new_y) {
        move = false

      }
      
    }

    if (move) {
      this.x = new_x
      this.y = new_y
    }

    if (this.state == 1 && Math.random() < recoveryRate ) this.state = 2

    
    // if (this.age > deathHorizon ) {
    //   removeThese.push(this)
    // }

  }

  updateSickness() {


    if (this.state != 1) {

    
      let inContact = false

      for (let i = 0; i < players.length; i++) {
        const other_player = players[i];

        if (other_player.state != 1) continue
        
        if (other_player.x === this.x && other_player.y === this.y) {
          continue
        }

        if ((Math.abs(other_player.x - this.x) < infectionDistance +1) && (Math.abs(other_player.y - this.y) < infectionDistance+1)) {
          inContact = true
          break
        }
        
      }

      if (inContact && Math.random()< transferRate) {this.state = 1}


    }


  }
  draw(){
    if(this.state == 0)  fill(100,255, 255)
    if(this.state == 1) fill(255,255, 255)
    if(this.state == 2) fill(50,255, 255)
   
    rect(origin.x + step * this.x, origin.y + step * this.y, size, size)

  }
}