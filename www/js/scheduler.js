function Scheduler($scope) {
	
	var buffers = {};
	var sources = {};
	
	var convolverSend = $scope.audioContext.createConvolver();
	convolverSend.connect($scope.audioContext.destination);
	
	var numCurrentlyLoading = 0;
	
	//load reverb impulse response
	numCurrentlyLoading++;
	var audioLoader2 = new AudioSampleLoader();
	loadAudio("audio/impulse_rev.wav", audioLoader2, function() {
		convolverSend.buffer = audioLoader2.response;
		sourceReady();
	});
	
	this.addSourceFile = function(filePath) {
		numCurrentlyLoading++;
		var audioLoader = new AudioSampleLoader();
		loadAudio(filePath, audioLoader, function() {
			buffers[filePath] = audioLoader.response;
			sourceReady();
		});
	}
	
	function sourceReady() {
		numCurrentlyLoading--;
		if (numCurrentlyLoading == 0) {
			$scope.sourcesReady = true;
			$scope.$apply();
		}
	}
	
	this.play = function(dmo) {
		source = getSource(dmo);
		if (source) {
			if (!source.hasAudioBuffer()) {
				source.setAudioBuffer(buffers[dmo.getSourcePath()]);
			}
			source.play();
		}
	}
	
	this.pause = function(dmo) {
		source = getSource(dmo);
		if (source) {
			source.pause();
		}
	}
	
	this.stop = function(dmo) {
		source = getSource(dmo);
		if (source) {
			source.stop();
		}
	}
	
	this.updateAmplitude = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changeAmplitude(change);
		}
	}
	
	this.updatePlaybackRate = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changePlaybackRate(change);
		}
	}
	
	this.updatePan = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changePosition(change, 0, 0);
		}
	}
	
	this.updateDistance = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changePosition(0, 0, change);
		}
	}
	
	this.updateReverb = function(dmo, change) {
		source = getSource(dmo);
		if (source) {
			source.changeReverb(change);
		}
	}
	
	function getSource(dmo) {
		if (!sources[dmo.getUri()] && dmo.getSourcePath()) {
			//currently reverb works only for one channel on android!?!
			//TODO make a send channel for reverb for everything
			reverbAllowed = sources.length < 1;
			sources[dmo.getUri()] = new Source($scope.audioContext, dmo, convolverSend);
		}
		return sources[dmo.getUri()];
	}
	
	function loadAudio(path, audioLoader, onload) {
		audioLoader.src = path;
		audioLoader.ctx = $scope.audioContext;
		audioLoader.onload = onload;
		audioLoader.onerror = function() {
			console.log("Error loading audio");
		};
		audioLoader.send();
	}
	
}