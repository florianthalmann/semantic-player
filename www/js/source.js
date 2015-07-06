function Source(audioContext, dmo, reverbSend) {
	
	var SCHEDULE_AHEAD_TIME = 0.1; //seconds
	var SWITCH_BUFFER_IMMEDIATELY = false;
	var FADE_LENGTH = 0.05; //seconds
	
	var startTime, endTime, currentPausePosition = 0;
	var isPlaying, isPaused;
	var timeoutID;
	
	var dryGain = audioContext.createGain();
	dryGain.connect(audioContext.destination);
	var reverbGain = audioContext.createGain();
	reverbGain.connect(reverbSend);
	reverbGain.gain.value = 0;
	var panner = audioContext.createPanner();
	panner.connect(dryGain);
	panner.connect(reverbGain);
	var currentAmplitude = 1;
	var currentPlaybackRate = 1;
	var currentPannerPosition = [0,0,0];
	var currentReverb = 0;
	var currentAudioSubBuffer;
	var currentSourceDuration;
	var audioSource, nextAudioSource;
	
	var audioBuffer = null;
	
	this.hasAudioBuffer = function() {
		return audioBuffer;
	};
	
	this.setAudioBuffer = function(buffer) {
		audioBuffer = buffer;
	};
	
	this.play = function() {
		if (!isPlaying) {
			internalPlay();
		}
		isPlaying = true;
	}
	
	function internalPlay() {
		if (!audioSource) {
			//initially create sources
			audioSource = createNewAudioSource();
		} else {
			//switch source
			audioSource = nextAudioSource;
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
		/*if (segmentations.length > 0) { //TODO FIND OTHER WAY TO MAKE PAUSE WORK WITH SEGMENTED TRACKS
			currentPausePosition = 0;
		}*/
		nextAudioSource = createNewAudioSource();
		if (endTime) {
			timeoutID = window.setTimeout(internalPlay, (endTime-audioContext.currentTime-SCHEDULE_AHEAD_TIME)*1000);
		}
	}
	
	this.pause = function() {
		if (isPlaying) {
			stopAndRemoveAudioSources();
			currentPausePosition += audioContext.currentTime - startTime;
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
		/*for (var i = 0; i < this.segmentationParams.length; i++) {
			this.segmentationParams[i].reset();
		}*/
	}
	
	function stopAndRemoveAudioSources() {
		window.clearTimeout(timeoutID);
		isPlaying = false;
		audioSource.stop(0);
		audioSource = null;
		nextAudioSource = null;
		endTime = null;
	}
	
	function setPosition(x, y, z) {
		currentPannerPosition = [x, y, z];
		panner.setPosition(x, y, z);
	}
	
	this.changePosition = function(deltaX, deltaY, deltaZ) {
		currentPannerPosition[0] += deltaX;
		currentPannerPosition[1] += deltaY;
		currentPannerPosition[2] += deltaZ;
		panner.setPosition(currentPannerPosition[0], currentPannerPosition[1], currentPannerPosition[2]);
	}
	
	this.changeAmplitude = function(deltaAmplitude) {
		currentAmplitude += deltaAmplitude;
		if (currentAmplitude > 0) {
			dryGain.gain.value += deltaAmplitude;
		} else {
			dryGain.gain.value = 0;
		}
	}
	
	this.changePlaybackRate = function(deltaRate) {
		currentPlaybackRate += deltaRate;
		if (audioSource) {
			audioSource.playbackRate.value = currentPlaybackRate;
		}
		if (nextAudioSource) {
			nextAudioSource.playbackRate.value = currentPlaybackRate;
		}
	}
	
	this.changeReverb = function(deltaReverb) {
		currentReverb += deltaReverb;
		if (currentReverb > 0) {
			reverbGain.gain.value += deltaReverb;
		} else {
			reverbGain.gain.value = 0;
		}
	}
	
	function createNewAudioSource() {
		var segment = dmo.getNextSegment();
		if (!segment[1]) {
			segment[1] = audioBuffer.duration-segment[0];
		}
		currentSourceDuration = segment[1];
		if (segment[0] == 0 && segment[1] == audioBuffer.duration) {
			currentAudioSubBuffer = audioBuffer;
		} else {
			//add time for fade after source officially done
			currentAudioSubBuffer = getAudioBufferCopy(toSamples(segment[0]), toSamples(currentSourceDuration+FADE_LENGTH));
		}
		var newSource = audioContext.createBufferSource();
		newSource.connect(panner);
		newSource.buffer = currentAudioSubBuffer;
		newSource.playbackRate.value = currentPlaybackRate;
		return newSource;
	}
	
	function toSamples(seconds) {
		if (seconds || seconds == 0) {
			return Math.round(seconds*audioBuffer.sampleRate);
		}
	}
	
	/*function getAudioBufferCopy(fromSample, durationInSamples) {
		var subBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, durationInSamples, audioBuffer.sampleRate);
		for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
			//audioBuffer.copyFromChannel(subBuffer.getChannelData(i), i);
			var currentChannelCopy = subBuffer.getChannelData(i);
			var currentChannelOriginal = audioBuffer.getChannelData(i);
			console.log(i, audioBuffer, currentChannelOriginal, fromSample, durationInSamples);
			for (var j = 0; j < durationInSamples; j++) {
				currentChannelCopy[j] = currentChannelOriginal[j];
			}
			//currentCopyChannel = currentOriginalChannel.slice(fromSample, fromSample+durationInSamples);
		}
		return subBuffer;
	}*/
	
	function getAudioBufferCopy(fromSample, durationInSamples) {
		var subBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, durationInSamples, audioBuffer.sampleRate);
		for (var i = 0; i < audioBuffer.numberOfChannels; i++) {
			var currentCopyChannel = subBuffer.getChannelData(i);
			var currentOriginalChannel = audioBuffer.getChannelData(i);
			for (var j = 0; j < durationInSamples; j++) {
				currentCopyChannel[j] = currentOriginalChannel[fromSample+j];
			}
			var fadeSamples = audioBuffer.sampleRate*FADE_LENGTH;
			for (var j = 0.0; j < fadeSamples; j++) {
				currentCopyChannel[j] *= j/fadeSamples;
				currentCopyChannel[durationInSamples-j-1] *= j/fadeSamples;
			}
		}
		return subBuffer;
	}
	
}