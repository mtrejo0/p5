
// var coreAudio = require("node-core-audio");

let arr = []

var timeDomainData = new Uint8Array(200);

let theta = 0

// let mic;
function setup() {
  createCanvas(windowWidth, windowHeight)

  arr = []
  arr.push(Math.random())

  // mic = new p5.AudioIn()
  // mic.start()

  // var speaker = new MediaStream;

  
//   if (!navigator.mediaDevices.selectAudioOutput) {
//   console.log("selectAudioOutput() not supported.");
//   return;}

//   //Display prompt and log selected device or error
// navigator.mediaDevices.selectAudioOutput()
// .then( (device) => {
//     console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
//   })
// .catch(function(err) {
//   console.log(err.name + ": " + err.message);
// });


  //   let context;
  // let request;
  // let source;

  // console.log("its lit")

  // try {
  //   context = new AudioContext();
  //   request = new XMLHttpRequest();
  //   request.open("GET","http://jplayer.org/audio/mp3/RioMez-01-Sleep_together.mp3",true);
  //   request.responseType = "arraybuffer";


  //   request.onload = function() {
  //     context.decodeAudioData(request.response, function(buffer) {
  //       source = context.createBufferSource();
  //       source.buffer = buffer;
  //       source.connect(context.destination);
  //       // auto play
  //       source.start(0); // start was previously noteOn

  //       console.log(buffer)

  //       console.log(buffer.getChannelData(0))

  //     });
  //   };

  //   request.send();

  // } catch(e) {
  //   alert('web audio api not supported');
  // }
  context = new AudioContext();
  analyser = context.createAnalyser();
  analyser.fftsize = 512;
  analyser.smoothingTimeConstant = 0.9;
  navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  navigator.getMedia({
      audio: true,
      video: false
  }, function (localMediaStream) {
      source = context.createMediaStreamSource(localMediaStream);
      console.log(source);
      source.connect(analyser);
  }, function (err) {
      console.log(err);
  });
  
}





let avgs = []




function draw() {
  
  background(0)
  let width = windowWidth/arr.length

  let m = Math.max(abs(Math.max(...arr)),abs(Math.min(...arr)))

  for (let i = 0; i < arr.length; i++) {

    rectMode(CORNER)

    let height = arr[i]/ m * windowHeight/2;
    rect(width * i,windowHeight,width,-height)    
  }

  arr.push(Math.random())

  analyser.getByteTimeDomainData(timeDomainData);

  console.log(timeDomainData)
  // arr = Array(array)


  // arr.push(Math.sin(theta))

  // theta += Math.PI/100

  // let vol = mic.getLevel();
  // arr.push(Math.random)

  while (arr.length > 300) {
    arr.shift()
  }

  
  

  // data = arr;
  // var max = Math.max(...data)
  // var min = Math.min(...data)
  // var threshold = min + (max - min) * .8//.98;
  // var peaks = getPeaksAtThreshold(data, threshold);
  // var intervalCounts = countIntervalsBetweenNearbyPeaks(peaks);
  // var tempoCounts = groupNeighborsByTempo(intervalCounts);

  // strokeWeight(5)
  // stroke("red")

  // let y = windowHeight - (threshold/ m * windowHeight/2);
  // line(0,y, windowWidth,y)
  // strokeWeight(0)

  // tempoCounts.sort(function(a, b) {
  //   return b.count - a.count;
  // });

  // if(tempoCounts.length) {

  //   let total_counts = tempoCounts.map(each => each.count).reduce((acc, c) => acc + c, 0)
  //   let bpm = tempoCounts.map(each => each.tempo * each.count).reduce((acc, c) => acc + c, 0)/total_counts
    

  //   if (avgs.length > 100){
  //     avgs.shift()
  //   }
  //   avgs.push(bpm)

  //   let running_avg = avgs.reduce((acc, c) => acc + c, 0)/avgs.length

  //   // console.log(bpm, running_avg)
  // }
}

function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for (var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
    }
    i++;
  }
  return peaksArray;
}

function countIntervalsBetweenNearbyPeaks(peaks) {
  var intervalCounts = [];
  peaks.forEach(function(peak, index) {
    for (var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval) return intervalCount.count++;
      });
      //Additional checks to avoid infinite loops in later processing
      if (!isNaN(interval) && interval !== 0 && !foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

function groupNeighborsByTempo(intervalCounts) {
  var tempoCounts = [];
  intervalCounts.forEach(function(intervalCount) {
    //Convert an interval to tempo
    var theoreticalTempo = 60 / (intervalCount.interval / 60);
    theoreticalTempo = Math.round(theoreticalTempo);
    if (theoreticalTempo === 0) {
      return;
    }
    // Adjust the tempo to fit within the 90-180 BPM range
    while (theoreticalTempo < 90) theoreticalTempo *= 2;
    while (theoreticalTempo > 180) theoreticalTempo /= 2;

    var foundTempo = tempoCounts.some(function(tempoCount) {
      if (tempoCount.tempo === theoreticalTempo) return tempoCount.count += intervalCount.count;
    });
    if (!foundTempo) {
      tempoCounts.push({
        tempo: theoreticalTempo,
        count: intervalCount.count
      });
    }
  });
  return tempoCounts;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
