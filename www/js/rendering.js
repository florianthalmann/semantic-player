function Rendering(name, filePaths, $scope) {
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();
	
	var name = name;
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
	
}