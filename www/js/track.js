function Track(filePath, audioContext, rendering, reverbAllowed) {
	
	var SCHEDULE_AHEAD_TIME = 0.1; //seconds
	var SWITCH_BUFFER_IMMEDIATELY = false;
	var LOOP = true;
	
	var pan = new Parameter(this, 0);
	var distance = new Parameter(this, 0);
	var amplitude = new Parameter(this, 1);
	var reverb = new Parameter(this, 0);
	var segmentationUris = [];
	var segmentationParams = {};
	var segmentations = {};
	this.pan = pan;
	this.distance = distance;
	this.amplitude = amplitude;
	this.segmentationParams = segmentationParams;
	this.reverb = reverb;
	
	var startTime, endTime, currentPausePosition = 0, currentSegmentIndex = 0;
	var isPlaying, isPaused;
	var timeoutID;
	this.isPlaying = isPlaying;
	
	this.setSegmentation = function(uri, times) {
		segmentations[uri] = times;
	};
	
	this.getSegmentationParam = function(uri) {
		if (!this.segmentationParams[uri]) {
			segmentationUris.push(uri);
			this.segmentationParams[uri] = new Parameter(this, 0, true);
		}
		return this.segmentationParams[uri];
	}
	
	var dryGain = audioContext.createGain();
	dryGain.connect(audioContext.destination);
	var reverbGain = audioContext.createGain();
	if (reverbAllowed) {
		reverbGain.connect(audioContext.destination);
		reverbGain.gain = reverb.value;
	}
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
		console.log(segmentations, segmentationParams, segmentations.length);
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
		if (segmentations.length > 0) { //TODO FIND OTHER WAY TO MAKE PAUSE WORK WITH SEGMENTED TRACKS
			currentPausePosition = 0;
		}
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
		for (var i = 0; i < this.segmentationParams.length; i++) {
			this.segmentationParams[i].reset();
		}
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
		if (segmentationUris.length > 0) {
			//TODO CONSIDER MORE THAN THE FIRST SEGMENTATION!!!!!
			var segmentationUri = segmentationUris[0];
			if (currentPausePosition == 0) { //only update segment if wasn't paused
				currentSegmentIndex = segmentationParams[segmentationUri].requestValue();
			}
			console.log(currentSegmentIndex);
			var currentSegment = segmentations[segmentationUri][currentSegmentIndex];
			currentSourceDuration = segmentations[segmentationUri][currentSegmentIndex+1]-currentSegment;
			currentAudioSubBuffer = getAudioBufferCopy(toSamples(currentSegment), toSamples(currentSourceDuration));
		} else {
			currentAudioSubBuffer = audioBuffer;
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
	
	function update() {
		//console.log(this.pan.value, 0, this.distance.value);
		panner.setPosition(this.pan.value, 0, this.distance.value);
		dryGain.gain.value = this.amplitude.value;
		reverbGain.gain.value = this.reverb.value;
		if (this.segmentationParams[0].hasChanged() && segmentations[0] && isPlaying) {
			nextAudioSource = createNewAudioSource(true);
		}
	}
	this.update = update;
	
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