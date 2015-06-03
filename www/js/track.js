function Track(filePath, audioCtx, rendering) {
	
	var SCHEDULE_AHEAD_TIME = 0.1; //seconds
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
	
	var startTime, endTime, currentPausePosition = 0;
	var isPlaying, isPaused;
	var onsets;
	var timeoutID;
	
	this.setOnsets = function(newOnsets) {
		onsets = newOnsets;
	};
	
	var gain = audioCtx.createGain();
	gain.connect(audioCtx.destination);
	var panner = audioCtx.createPanner();
	panner.connect(gain);
	var audioBuffer, currentAudioSubBuffer;
	var currentSourceDuration;
	var audioSource, nextAudioSource;
	
	var audioLoader = new AudioSampleLoader();
	audioLoader.src = filePath;
	audioLoader.ctx = audioCtx;
	audioLoader.onload = function() {
		audioBuffer = audioLoader.response;
		rendering.tellReady();
	};
	audioLoader.onerror = function() {
		console.log("Error loading audio");
	};
	audioLoader.send();
	
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
			delay = endTime-audioCtx.currentTime;
		}
		startTime = audioCtx.currentTime+delay;
		audioSource.start(startTime, currentPausePosition); //% audioSource.loopEnd-audioSource.loopStart);
		endTime = startTime+currentSourceDuration;
		//console.log(delay + " " + endTime + " " + currentSourceDuration + " " + ((endTime-audioCtx.currentTime-SCHEDULE_AHEAD_TIME)*1000));
		currentPausePosition = 0;
		if (endTime) {
			timeoutID = window.setTimeout(internalPlay, (endTime-audioCtx.currentTime-SCHEDULE_AHEAD_TIME)*1000);
		}
	}
	
	this.pause = function() {
		if (isPlaying) {
			stopAndRemoveAudioSources();
			currentPausePosition += audioCtx.currentTime - startTime;
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
		var newSource = audioCtx.createBufferSource();
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
		var subBuffer = audioCtx.createBuffer(audioBuffer.numberOfChannels, durationInSamples, audioBuffer.sampleRate);
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
		gain.gain.value = this.amplitude.value;
		if (this.onset.hasChanged() && onsets && isPlaying) {
			nextAudioSource = createNewAudioSource(true);
		}
	}
	
}