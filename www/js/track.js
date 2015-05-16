function Track(fileName, audioCtx, rendering) {
	
	this.pan = new Parameter(this, 0);
	this.distance = new Parameter(this, 1);
	this.amplitude = new Parameter(this, 0.5);
	
	var gain = audioCtx.createGain();
	gain.connect(audioCtx.destination);
	var panner = audioCtx.createPanner();
	panner.connect(gain);
	var audioSource = audioCtx.createBufferSource();
	audioSource.connect(panner);
	//audioSource.loop = true;
	
	console.log(fileName);
  var audioLoader = new AudioSampleLoader();
  audioLoader.src = fileName;
  audioLoader.ctx = audioCtx;
  audioLoader.onload = function() {
    audioSource.buffer = audioLoader.response;
		rendering.tellReady();
  };
  audioLoader.onerror = function() {
    console.log("Error loading Audio");
  };
  audioLoader.send();
	
	this.play = function() {
		audioSource.start(0);
	}
	
	this.update = function() {
		panner.setPosition(this.pan.value, -0.5, this.distance.value);
		gain.gain.value = this.amplitude.value;
	}
	
}