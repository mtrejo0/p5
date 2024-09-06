let env, wave;
let audioContext;
let handPose;
let video;
let hands = [];

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

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);

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

  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function startAudio() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw all the tracked hand points
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }

    // Use the position of the index finger to control the theremin
    if (hand.keypoints[8]) {
      let x = hand.keypoints[8].x;
      let y = hand.keypoints[8].y;
      
      // Map x position to frequency
      let freq = map(x, 0, width, 100, 1000);
      wave.freq(freq);
      
      // Map y position to amplitude
      let amp = map(y, 0, height, 0.5, 0);
      wave.amp(amp);
      
      // Display frequency and amplitude
      fill(255);
      textSize(16);
      text(`Frequency: ${freq.toFixed(2)} Hz`, 10, height - 40);
      text(`Amplitude: ${amp.toFixed(2)}`, 10, height - 20);
    }
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
}
