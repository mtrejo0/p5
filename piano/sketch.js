// The midi notes of a scale
var notesMap = {
    'x': 60,
    'c': 62,
    'v': 64,
    'b': 65,
    'n': 66,
    'm': 69,
    ',': 71,
}
var notes = Object.values(notesMap)



var osc;

function setup() {
  createCanvas(windowWidth, windowHeight);


  // A triangle oscillator
  osc = new p5.TriOsc();
  // Start silent
  osc.start();
  osc.amp(0);
}

// A function to play a note
function playNote(note, duration) {
  osc.freq(midiToFreq(note));
  // Fade it in
  osc.fade(0.5,0.2);

  // If we sest a duration, fade it out
  if (duration) {
    setTimeout(function() {
      osc.fade(0,0.2);
    }, duration-50);
  }
}

function draw() {

  // Draw a keyboard

  // The width for each key
  var w = width / notes.length;
  for (var i = 0; i < notes.length; i++) {
    var x = i * w;
    // If the mouse is over the key
    if (mouseX > x && mouseX < x + w && mouseY < height) {
      // If we're clicking
      if (mouseIsPressed) {
        fill(100,255,200);
      // Or just rolling over
      } else {
        fill(127);
      }
    } else {
      fill(200);
    }


    // Draw the key
    rect(x, 0, w-1, height-1);
  }

}

// When we click
function mousePressed() {
  // Map mouse to the key index
  var key = floor(map(mouseX, 0, width, 0, notes.length));
  print(notes[key])
  playNote(notes[key]);
}

// Fade it out when we release
function mouseReleased() {
  osc.fade(0,0.5);
}

function keyPressed() {
    // Map key code to a note index, assuming keys 'A' to 'G' map to the notes array
    var keyIndex = keyCode - 65; // 'A' keyCode is 65
    console.log(keyIndex)
    // if (keyIndex >= 0 && keyIndex < notes.length) {
    //   playNote(notes[keyIndex], 500); // Play the note with a duration of 500 ms
    //   console.log(notes[keyIndex])
    // }

    if (Object.keys(notesMap).includes(key)) {
        playNote(notesMap[key], 500);
    }
  }
