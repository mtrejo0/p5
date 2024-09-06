let env, wave;
let audioContext;

function getFrequency(note) {
  let notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  let baseFrequencies = [440, 466.1638, 493.8833, 261.6256, 277.1826, 293.6648, 311.1270, 329.6276, 349.2282, 369.9944, 391.9954, 415.3047];
  let octave = parseInt(note.slice(-1));
  let noteIndex = notes.indexOf(note.slice(0, -1));
  if (noteIndex === -1) {
    console.error(`Invalid note: ${note}`);
    return null;
  }
  let baseFrequency = baseFrequencies[noteIndex];
  let frequency = baseFrequency * Math.pow(2, (octave - 4) / 12);

  return frequency;
}

let ball;
let musicalSequence = ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
let sequenceIndex = 0;
let circleRadius;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create a button to start audio context
  let startButton = createButton('Start Audio');
  startButton.position(10, 10);
  startButton.mousePressed(startAudio);

  env = new p5.Envelope();
  env.setADSR(0.05, 0.1, 0.5, 1);
  env.setRange(1.2, 0);

  wave = new p5.Oscillator();

  wave.setType('sine');
  wave.start();
  wave.freq(440);
  wave.amp(env);

  circleRadius = min(width, height) / 2 - 20;
  ball = {
    x: width / 2 + 0,
    y: height / 2 + 150,
    radius: 20,
    speedX: 20,
    speedY: 0
  };
}

function startAudio() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}

function draw() {
  background(255, 10);
  
  // Draw the circular boundary
  noFill();
  stroke(0);
  ellipse(width / 2, height / 2, circleRadius * 2);
  
  // Update ball position
  ball.x += ball.speedX;
  ball.y += ball.speedY;
  
  // Check for collisions with circular boundary
  let dx = ball.x - width / 2;
  let dy = ball.y - height / 2;
  let distance = sqrt(dx * dx + dy * dy);

  // Draw the ball
  fill(0);
  noStroke();
  ellipse(ball.x, ball.y, ball.radius * 2);

  
  if (distance + ball.radius > circleRadius) {
    // Calculate the normal vector
    let nx = dx / distance;
    let ny = dy / distance;
    
    // Calculate the dot product of velocity and normal
    let dotProduct = ball.speedX * nx + ball.speedY * ny;
    
    // Calculate the new velocity
    ball.speedX = ball.speedX - 2 * dotProduct * nx;
    ball.speedY = ball.speedY - 2 * dotProduct * ny;
    
    // Move the ball back inside the circle
    let overlap = distance + ball.radius - circleRadius;
    ball.x -= overlap * nx;
    ball.y -= overlap * ny;
    
    // Play the next note and set the current note for display
    playNextNote();

    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(16);
    let currentNote = musicalSequence[sequenceIndex % musicalSequence.length];
    let textX = width / 2 + (circleRadius + 20) * cos(atan2(dy, dx));
    let textY = height / 2 + (circleRadius + 20) * sin(atan2(dy, dx));
    text(currentNote, textX, textY);
  }
  
  
}

function playNextNote() {
  let note = musicalSequence[sequenceIndex % musicalSequence.length];
  wave.freq(getFrequency(note));
  env.play();
  sequenceIndex++;
}
