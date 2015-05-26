function Track(filePath, audioCtx, rendering) {
	
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
	var audioBuffer, audioSource;
	
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
			if (!audioSource) {
				initAudioSource();
			}
			startTime = audioCtx.currentTime;
			audioSource.start(0, currentPausePosition % audioSource.buffer.duration);
			isPlaying = true;
		}
	}
	
	this.pause = function() {
		if (isPlaying) {
			stopAndReInitAudioSource();
			currentPausePosition += audioCtx.currentTime - startTime;
		} else {
			this.play();
		}
	}
	
	this.stop = function() {
		if (isPlaying) {
			stopAndReInitAudioSource();
		}
		//even in case it is paused
		currentPausePosition = 0;
	}
	
	function stopAndReInitAudioSource() {
		audioSource.stop(0);
		isPlaying = false;
		initAudioSource();
	}
	
	function initAudioSource() {
		audioSource = audioCtx.createBufferSource();
		audioSource.connect(panner);
		audioSource.loop = true;
		updateAudioBuffer();
	}
	
	//position/duration in milliseconds optional
	function updateAudioBuffer() {
		var position = onsets[onset.value];
		var duration = onsets[onset.value+1]-position;
		audioSource.buffer = getSubBuffer(toSamples(position), toSamples(duration));
	}
	
	function toSamples(milliseconds) {
		if (milliseconds) {
			return Math.round(milliseconds*audioBuffer.sampleRate/1000);
		}
	}
	
	function getSubBuffer(samplePosition, sampleDuration) {
		if (samplePosition) {
			return getAudioBufferCopy(samplePosition, samplePosition+sampleDuration);
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
			updateAudioBuffer();
		}
	}
	
}