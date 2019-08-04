let song;
let osc;
let loops;
let maxAmp;
let minAmp;

function setup() {
  // song = loadSound('sounds/247445__mtg__overall-quality-of-single-note-violin-a-5.wav');  // doesnt fit, too high (880 Hz)
  song = loadSound('sounds/247464__mtg__overall-quality-of-single-note-violin-g6.wav');   // fits nice (1567.98 Hz)
  // song = loadSound('sounds/247399__mtg__overall-quality-of-single-note-violin-g3.wav');   // doesnt fit, too high, (196.00 Hz)

  // osc = new p5.SinOsc(2000); // set frequency and type
  // osc.amp(0.5);

  createCanvas(1400, 600);
  background(255, 0, 0);
  fft = new p5.FFT();
  fft.setInput(song);
  loops = 0;
  maxAmp = -1.0;
  minAmp = 100000.0;
}

function mousePressed() {
  if (song.isPlaying()) {
    // .isPlaying() returns a boolean
    song.stop();
    // osc.stop();
    background(255, 0, 0);
  } else {
    song.play();
    // osc.start();
    background(0, 255, 0);
  }
}

var logSamples = false;

function draw() {
  background(222);
  var waveform = fft.waveform();
  if (song.isPlaying()) {
    logSamples = true;
    let spectrum = fft.analyze();
    beginShape();
    for (i = 0; i < spectrum.length; i++) {
      vertex(i, map(spectrum[i], 0, 255, height, 0));
    }
    endShape();

    //Draw the waveform
    noFill();
    beginShape();
    stroke(255,0,0); // waveform is red
    strokeWeight(2);
    //times of crossing zero-level
    var t0_1, t0_2 = -1;
    var frequency = -1.0;
    var crossPos;   // Determines wheter the first crossing is from positve or negative
    var amplPos;    // Flag wether last amplitude was positive or negative
    if (waveform[0] < 0) {
      crossPos = true;
      amplPos = false;
    }
    else {
      crossPos = false;
      amplPos = true;
    }
    for (var i = 0; i< waveform.length; i++){
      var ampl = waveform[i];
      var x = map(i, 0, waveform.length, 0, width);
      var y = map(ampl, -1, 1, 0, height);
      vertex(x,y);
      if (crossPos) {   // search for crossing from neg to pos
        if(ampl>0 & amplPos==false) {
          t0_1 = t0_2;
          t0_2 = i;
          if(t0_1 > 0) {    // signal already crossed: frequency can be calculated!
            var iterationsPeriod = t0_2 - t0_1;
            frequency = 1/(iterationsPeriod*0.0000208);  //überschlagen: 0.000016
            console.log(iterationsPeriod);
            console.log(frequency + " Hz");
          }
        }
      }
      //set new polarity of ampl for nxt iteration
      if (ampl > 0) {
        amplPos = true;
      }
      else {
        amplPos = false;
      }
      //get min max of waveform
      if (ampl < minAmp) {
        minAmp = ampl;
      }
      if(ampl > maxAmp) {
        maxAmp = ampl;
      }
    }
    endShape();
    loops++;
    // console.log(waveform)
  }
  else {
    if (logSamples) {
      // the sample rate should be 62,5kHz, so one iteration should be 16 micro seconds
      console.log("loops: " + loops);
      console.log("waveform length: " + waveform.length);
      console.log("samples: " + loops*waveform.length);
      console.log("kSamples/s: " + loops*waveform.length/5200);
      console.log("Min: ", minAmp, "Max: ", maxAmp)
      loops = 0;
      logSamples = false;
      maxAmp = -1.0;
      minAmp = 100000.0;
    }
  }
}