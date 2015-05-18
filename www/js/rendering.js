function Rendering(name, filePaths) {
	
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = new AudioContext();
	
	var name = name;
	this.tracks = [];
	var pathToTrackIndex = {};
	var readyCount = 0;
	
	for (var i = 0; i < filePaths.length; i++) {
		pathToTrackIndex[filePaths[i]] = i;
		this.tracks.push(new Track(filePaths[i], audioCtx, this));
	}
	
	this.tellReady = function() {
		readyCount++;
		if (readyCount == this.tracks.length) {
			for (var i = 0; i < this.tracks.length; i++) {
				this.tracks[i].play();
			}
		}
	}
	
	this.getTrackForPath = function(filePath) {
		return this.tracks[pathToTrackIndex[filePath]];
	}
	
}