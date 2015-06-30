function Scheduler($scope) {
	
	var buffers = {};
	var sources = {};
	var convolutionBuffer;
	
	var numCurrentlyLoading = 0;
	
	//load reverb impulse response
	numCurrentlyLoading++;
	var audioLoader2 = new AudioSampleLoader();
	loadAudio("audio/impulse_rev.wav", audioLoader2, function() {
		convolutionBuffer = audioLoader2.response;
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
		sourcePath = dmo.getSourcePath();
		if (sourcePath) {
			if (!sources[dmo.getUri()]) {
				//currently reverb works only for one channel on android!?!
				//TODO make a send channel for reverb for everything
				reverbAllowed = sources.length < 1;
				dmoBuffer = buffers[sourcePath];
				sources[dmo.getUri()] = new Source($scope.audioContext, dmo, dmoBuffer, reverbAllowed);
			}
			sources[dmo.getUri()].play();
		}
	}
	
	this.pause = function(dmo) {
		if (sources[dmo.getUri()]) {
			sources[dmo.getUri()].pause();
		}
	}
	
	this.stop = function(dmo) {
		if (sources[dmo.getUri()]) {
			sources[dmo.getUri()].stop();
		}
	}
	
	this.updateAmplitude = function(dmo, change) {
		if (sources[dmo.getUri()]) {
			sources[dmo.getUri()].changeAmplitude(change);
		}
	}
	
	this.updatePan = function(dmo, change) {
		if (sources[dmo.getUri()]) {
			sources[dmo.getUri()].changePosition(change, 0, 0);
		}
	}
	
	this.updateDistance = function(dmo, change) {
		if (sources[dmo.getUri()]) {
			sources[dmo.getUri()].changePosition(0, 0, change);
		}
	}
	
	this.updateReverb = function(dmo, change) {
		if (sources[dmo.getUri()]) {
			sources[dmo.getUri()].changeReverb(change);
		}
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