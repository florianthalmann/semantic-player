function Rendering(name, filePaths, $scope) {
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();
	
	//horizontal listener orientation in degrees
	this.listenerOrientation = new Parameter(this, 0);
	
	this.tracks = [];
	var pathToTrackIndex = {};
	var readyCount = 0;
	this.tracksLoaded = false;
	
	for (var i = 0; i < filePaths.length; i++) {
		pathToTrackIndex[filePaths[i]] = i;
		this.tracks.push(new Track(filePaths[i], audioCtx, this));
	}
	
	this.tellReady = function() {
		readyCount++;
		if (readyCount == this.tracks.length) {
			this.tracksLoaded = true;
			$scope.$apply();
		}
	}
	
	this.play = function() {
		if (this.tracksLoaded) {
			for (var i = 0; i < this.tracks.length; i++) {
				this.tracks[i].play();
			}
		}
	}
	
	this.pause = function() {
		if (this.tracksLoaded) {
			for (var i = 0; i < this.tracks.length; i++) {
				this.tracks[i].pause();
			}
		}
	}
	
	this.stop = function() {
		if (this.tracksLoaded) {
			for (var i = 0; i < this.tracks.length; i++) {
				this.tracks[i].stop();
			}
		}
	}
	
	this.getTrackForPath = function(filePath) {
		return this.tracks[pathToTrackIndex[filePath]];
	}
	
	this.update = function() {
		var angleInRadians = this.listenerOrientation.value * (Math.PI/180);
		audioCtx.listener.setOrientation(Math.sin(angleInRadians), 0, -Math.cos(angleInRadians), 0, 1, 0);
	}
	
}