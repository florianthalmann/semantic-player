function Track(filePath, audioCtx, rendering) {
	
	this.pan = new Parameter(this, 0);
	this.distance = new Parameter(this, 1);
	this.amplitude = new Parameter(this, 0.5);
	
	var startTime, currentPosition = 0;
	var isPlaying;
	
	var gain = audioCtx.createGain();
	gain.connect(audioCtx.destination);
	var panner = audioCtx.createPanner();
	panner.connect(gain);
	var audioSource;
	
	var audioLoader = new AudioSampleLoader();
	audioLoader.src = filePath;
	audioLoader.ctx = audioCtx;
	audioLoader.onload = function() {
		initAudioSource(audioLoader.response);
		rendering.tellReady();
	};
	audioLoader.onerror = function() {
		console.log("Error loading Audio");
	};
	audioLoader.send();
	
	this.play = function() {
		if (!isPlaying) {
			startTime = audioCtx.currentTime;
			audioSource.start(0, currentPosition);
			isPlaying = true;
		}
	}
	
	this.pause = function() {
		if (isPlaying) {
			stopAndReInitAudioSource();
			currentPosition += audioCtx.currentTime - startTime;
		} else {
			this.play();
		}
	}
	
	this.stop = function() {
		if (isPlaying) {
			stopAndReInitAudioSource();
		}
		//even in case it is paused
		currentPosition = 0;
	}
	
	function stopAndReInitAudioSource() {
		audioSource.stop(0);
		isPlaying = false;
		initAudioSource(audioSource.buffer);
	}
	
	function initAudioSource(buffer) {
		audioSource = audioCtx.createBufferSource();
		audioSource.connect(panner);
		audioSource.buffer = buffer;
	}
	
	this.update = function() {
		panner.setPosition(this.pan.value, -0.5, this.distance.value);
		gain.gain.value = this.amplitude.value;
		//audioSource.loop = true;
	}
	
}