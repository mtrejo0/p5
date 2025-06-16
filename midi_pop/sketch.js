let midiAccess;
let midiInputs = [];
let particles = [];
let lastNote = 0;
let lastVelocity = 0;
let pressedNotes = new Set(); // Track which notes are currently pressed down
let oscillators = {}; // Store oscillators for each note
let audioStarted = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Request MIDI access
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
      .then(onMIDISuccess, onMIDIFailure);
  } else {
    console.log("Web MIDI API not supported in this browser");
  }
}

// Add mousePressed to start audio context
function mousePressed() {
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
}

function draw() {
  background(0, 20);
  
  // Create particles for all currently pressed notes
  pressedNotes.forEach(note => {
    createParticle(note, 100); // Use fixed velocity for held notes
  });
  
  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
  
  // Display connection status
  fill(255);
  textAlign(LEFT);
  textSize(16);
  if (midiInputs.length > 0) {
    text("MIDI Connected: " + midiInputs.length + " device(s)", 20, 30);
  } else {
    text("No MIDI devices connected", 20, 30);
  }
}

function onMIDISuccess(midi) {
  console.log("MIDI access granted");
  midiAccess = midi;
  
  // Get all MIDI inputs
  const inputs = midiAccess.inputs.values();
  
  for (let input of inputs) {
    console.log("MIDI Input found:", input.name, input.manufacturer);
    midiInputs.push(input);
    
    // Listen for MIDI messages
    input.onmidimessage = handleMIDIMessage;
  }
  
  // Listen for device connection/disconnection
  midiAccess.onstatechange = onMIDIStateChange;
}

function onMIDIFailure() {
  console.log("Could not access MIDI devices");
}

function handleMIDIMessage(message) {
  const [command, note, velocity] = message.data;
  
  // Decode message type
  const messageType = command & 0xF0;
  const channel = command & 0x0F;
  
  switch (messageType) {
    case 0x90: // Note On
      if (velocity > 0) {
        // Only start playing if note wasn't already pressed
        if (!pressedNotes.has(note)) {
          pressedNotes.add(note);
          playNote(note, velocity);
        }
      } else {
        // Note Off (velocity = 0)
        pressedNotes.delete(note);
        stopNote(note);
      }
      break;
    case 0x80: // Note Off
      pressedNotes.delete(note);
      stopNote(note);
      break;
    case 0xB0: // Control Change
      console.log(`Control Change: Controller ${note}, Value ${velocity}`);
      createControlParticle(note, velocity);
      break;
  }
}

function createParticle(note, velocity) {
  // Only process notes between 48 and 72
  if (note >= 48 && note <= 72) {
    // Map note to a vertical position
    const y = map(note, 48, 72, 50, height - 50); // Map notes to vertical position
    const x = 0; // Start from left edge
    const size = map(velocity, 0, 127, 20, 80); // Much bigger circles
    const hue = map(note, 48, 72, 0, 300); // Red (0) to Purple (300) for our range
    
    particles.push(new Particle(x, y, size, hue));
  }
}

function createControlParticle(controller, value) {
  const x = map(controller, 0, 127, 0, width);
  const y = map(value, 0, 127, 0, height);
  const size = map(value, 0, 127, 5, 20);
  
  particles.push(new ControlParticle(x, y, size));
}

function playNote(note, velocity) {
  if (!audioStarted) {
    userStartAudio();
    audioStarted = true;
  }
  
  // Convert MIDI note to frequency
  const freq = midiToFreq(note);
  // Map velocity (0-127) to amplitude (0-0.5)
  const amp = map(velocity, 0, 127, 0, 0.5);
  
  // Create new oscillator for this note
  const osc = new p5.Oscillator('square');
  osc.freq(freq);
  osc.amp(amp, 0.1); // Fade in over 0.1 seconds
  osc.start();
  
  // Store the oscillator
  oscillators[note] = osc;
}

function stopNote(note) {
  if (oscillators[note]) {
    oscillators[note].amp(0, 0.1); // Fade out over 0.1 seconds
    // Stop and remove the oscillator after fade out
    setTimeout(() => {
      if (oscillators[note]) {
        oscillators[note].stop();
        delete oscillators[note];
      }
    }, 100);
  }
}

class Particle {
  constructor(x, y, size, hue) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hue = hue;
    this.alpha = 255;
    this.growth = 0;
    this.maxSize = size * 2.5; // Even bigger maximum size
  }
  
  update() {
    this.x += 3; // Move right
    this.growth += 0.1;
    this.size = this.maxSize * (1 - this.growth / 50);
    // Fade out as it approaches the right edge
    this.alpha = map(this.x, 0, width, 255, 0);
  }
  
  display() {
    noStroke();
    colorMode(HSB);
    fill(this.hue, 100, 100, this.alpha);
    // Draw square instead of circle
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size);
  }
  
  isDead() {
    return this.alpha <= 0 || this.size <= 0 || this.x > width;
  }
}

class ControlParticle {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.alpha = 255;
  }
  
  update() {
    this.alpha -= 5;
  }
  
  display() {
    noStroke();
    fill(255, this.alpha);
    rect(this.x, this.y, this.size, this.size);
  }
  
  isDead() {
    return this.alpha <= 0;
  }
}

function onMIDIStateChange(event) {
  console.log("MIDI device state changed:", event.port.name, event.port.state);
  
  if (event.port.state === "connected" && event.port.type === "input") {
    console.log("New MIDI input connected:", event.port.name);
    event.port.onmidimessage = handleMIDIMessage;
    if (!midiInputs.includes(event.port)) {
      midiInputs.push(event.port);
    }
  } else if (event.port.state === "disconnected") {
    console.log("MIDI device disconnected:", event.port.name);
    midiInputs = midiInputs.filter(input => input !== event.port);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
