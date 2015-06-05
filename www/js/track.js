function Track(filePath, audioContext, rendering) {
	
	var SCHEDULE_AHEAD_TIME = 0.1; //seconds
	var SWITCH_BUFFER_IMMEDIATELY = false;
	var LOOP = true;
	
	var pan = new Parameter(this, 0);
	var distance = new Parameter(this, 1);
	var amplitude = new Parameter(this, 0.5);
	var reverb = new Parameter(this, 0);
	var onset = new Parameter(this, 0, true);
	this.pan = pan;
	this.distance = distance;
	this.amplitude = amplitude;
	this.onset = onset;
	this.reverb = reverb;
	
	var startTime, endTime, currentPausePosition = 0;
	var isPlaying, isPaused;
	var onsets;
	var timeoutID;
	
	this.setOnsets = function(newOnsets) {
		onsets = newOnsets;
	};
	
	var dryGain = audioContext.createGain();
	dryGain.connect(audioContext.destination);
	var reverbGain = audioContext.createGain();
	reverbGain.connect(audioContext.destination);
	reverbGain.gain.value = 0;
	var convolver = audioContext.createConvolver();
	convolver.connect(reverbGain);
	var panner = audioContext.createPanner();
	panner.connect(dryGain);
	panner.connect(convolver);
	var audioBuffer, currentAudioSubBuffer;
	var currentSourceDuration;
	var audioSource, nextAudioSource;
	
	var audioLoader = new AudioSampleLoader();
	loadAudio(filePath, audioLoader, function() {
		audioBuffer = audioLoader.response;
		rendering.tellReady();
	});
	
	var audioLoader2 = new AudioSampleLoader();
	loadAudio("audio/impulse_rev.wav", audioLoader2, function() {
		convolver.buffer = audioLoader2.response;
		rendering.tellReady();
	});
	
	this.play = function() {
		if (!isPlaying) {
			internalPlay();
		}
		isPlaying = true;
	}
	
	function internalPlay() {
		if (!audioSource || !nextAudioSource) {
			//initially create sources
			audioSource = createNewAudioSource();
			nextAudioSource = createNewAudioSource();
		} else {
			//switch source
			audioSource = nextAudioSource;
			nextAudioSource = createNewAudioSource();
		}
		if (!endTime) {
			delay = SCHEDULE_AHEAD_TIME;
		} else {
			delay = endTime-audioContext.currentTime;
		}
		startTime = audioContext.currentTime+delay;
		audioSource.start(startTime, currentPausePosition); //% audioSource.loopEnd-audioSource.loopStart);
		endTime = startTime+currentSourceDuration;
		//console.log(delay + " " + endTime + " " + currentSourceDuration + " " + ((endTime-audioContext.currentTime-SCHEDULE_AHEAD_TIME)*1000));
		//currentPausePosition = 0;
		if (endTime) {
			timeoutID = window.setTimeout(internalPlay, (endTime-audioContext.currentTime-SCHEDULE_AHEAD_TIME)*1000);
		}
	}
	
	this.pause = function() {
		if (isPlaying) {
			stopAndRemoveAudioSources();
			currentPausePosition += audioContext.currentTime - startTime;
			console.log(currentPausePosition);
			isPaused = true;
		} else if (isPaused) {
			isPaused = false;
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
		window.clearTimeout(timeoutID);
		isPlaying = false;
		audioSource.stop(0);
		audioSource = null;
		nextAudioSource = null;
		endTime = null;
	}
	
	function createNewAudioSource(hasChanged) {
		if (!currentAudioSubBuffer || hasChanged) {
			if (onsets) {
				var currentOnset = onsets[onset.value];
				currentSourceDuration = onsets[onset.value+1]-currentOnset;
				currentAudioSubBuffer = getAudioBufferCopy(toSamples(currentOnset), toSamples(currentSourceDuration));
			} else {
				currentAudioSubBuffer = audioBuffer;
			}
		}
		var newSource = audioContext.createBufferSource();
		newSource.connect(panner);
		newSource.buffer = currentAudioSubBuffer;
		return newSource;
	}
	
	function toSamples(seconds) {
		if (seconds) {
			return Math.round(seconds*audioBuffer.sampleRate);
		}
	}
	
	function getAudioBufferCopy(fromSample, durationInSamples) {
		//console.log(fromSample + " "+ durationInSamples);
		var subBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, durationInSamples, audioBuffer.sampleRate);
		for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
			var currentCopyChannel = subBuffer.getChannelData(i);
			var currentOriginalChannel = audioBuffer.getChannelData(i);
			for (var j = 0; j < durationInSamples; j++) {
				currentCopyChannel[j] = currentOriginalChannel[fromSample+j];
			}
		}
		return subBuffer;
	}
	
	this.update = function() {
		panner.setPosition(this.pan.value, -0.5, this.distance.value);
		dryGain.gain.value = this.amplitude.value;
		reverbGain.gain.value = this.reverb.value;
		if (this.onset.hasChanged() && onsets && isPlaying) {
			nextAudioSource = createNewAudioSource(true);
		}
	}
	
	function loadAudio(path, audioLoader, onload) {
		audioLoader.src = path;
		audioLoader.ctx = audioContext;
		audioLoader.onload = onload;
		audioLoader.onerror = function() {
			console.log("Error loading audio");
		};
		audioLoader.send();
	}
	
}