function Track(filePath, audioCtx, rendering) {
	
	var SWITCH_BUFFER_IMMEDIATELY = false;
	var LOOP = true;
	
	var pan = new Parameter(this, 0);
	var distance = new Parameter(this, 1);
	var amplitude = new Parameter(this, 0.5);
	var onset = new Parameter(this, 0, true);
	
	this.pan = pan;
	this.distance = distance;
	this.amplitude = amplitude;
	this.onset = onset;
	
	var startTime, currentPausePosition = 0;
	var isPlaying;
	var onsets;
	
	this.setOnsets = function(newOnsets) {
		onsets = newOnsets;
	};
	
	var gain = audioCtx.createGain();
	gain.connect(audioCtx.destination);
	var panner = audioCtx.createPanner();
	panner.connect(gain);
	var audioBuffer, audioSource, nextAudioSource;
	
	var audioLoader = new AudioSampleLoader();
	audioLoader.src = filePath;
	audioLoader.ctx = audioCtx;
	audioLoader.onload = function() {
		audioBuffer = audioLoader.response;
		rendering.tellReady();
	};
	audioLoader.onerror = function() {
		console.log("Error loading Audio");
	};
	audioLoader.send();
	
	this.play = function() {
		if (!isPlaying) {
			internalPlay();
		}
		isPlaying = true;
	}
	
	function internalPlay() {
		if (!audioSource) {
			initAudioSource();
		}
		startTime = audioCtx.currentTime;
		audioSource.start(0, currentPausePosition); //% audioSource.loopEnd-audioSource.loopStart);
		currentPausePosition = 0;
	}
	
	this.pause = function() {
		if (isPlaying) {
			stopAndRemoveAudioSources();
			currentPausePosition += audioCtx.currentTime - startTime;
		} else {
			this.play();
		}
	}
	
	this.stop = function() {
		if (isPlaying) {
			stopAndRemoveAudioSources();
		}
		//even in case it is paused
		currentPausePosition = 0;
	}
	
	function stopAndRemoveAudioSources() {
		isPlaying = false;
		audioSource.stop(0);
		audioSource = null;
		nextAudioSource = null;
	}
	
	function initAudioSource() {
		audioSource = createNewAudioSource();
	}
	
	function createNewAudioSource() {
		var newSource = audioCtx.createBufferSource();
		newSource.connect(panner);
		newSource.buffer = getSubBuffer(toSamples(onsets[onset.value]), toSamples(onsets[onset.value+1]));
		newSource.onended = startNextAudioSource;
		return newSource;
	}
	
	function prepareNextAudioSource () {
		nextAudioSource = createNewAudioSource();
		if (SWITCH_BUFFER_IMMEDIATELY) {
			switchToNextAudioSource();
		}
	}
	
	function startNextAudioSource() {
		if (isPlaying && LOOP) {
			if (nextAudioSource) {
				switchToNextAudioSource();
			} else {
				audioSource = null;
				internalPlay();
			}
		}
	}
	
	function switchToNextAudioSource() {
		oldAudioSource = audioSource;
		audioSource = nextAudioSource;
		internalPlay();
		oldAudioSource.stop(0);
		nextAudioSource = null;
	}
	
	function toSamples(seconds) {
		if (seconds) {
			return Math.round(seconds*audioBuffer.sampleRate);
		}
	}
	
	function getSubBuffer(startSample, endSample) {
		if (startSample) {
			return getAudioBufferCopy(startSample, endSample);
		} else {
			return audioBuffer;
		}
	}
	
	function getAudioBufferCopy(fromSample, toSample) {
		var subBuffer = audioCtx.createBuffer(audioBuffer.numberOfChannels, toSample-fromSample, audioBuffer.sampleRate);
		for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
			var currentCopyChannel = subBuffer.getChannelData(i);
			var currentOriginalChannel = audioBuffer.getChannelData(i);
			for (var j = 0; j < toSample-fromSample; j++) {
				currentCopyChannel[j] = currentOriginalChannel[fromSample+j];
			}
		}
		return subBuffer;
	}
	
	this.update = function() {
		panner.setPosition(this.pan.value, -0.5, this.distance.value);
		gain.gain.value = this.amplitude.value;
		if (this.onset.hasChanged() && onsets) {
			prepareNextAudioSource();
		}
	}
	
}