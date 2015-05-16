function Rendering(fileNames) {
	
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioCtx = new AudioContext();
	
	this.tracks = [];
	var readyCount = 0;
	
	for (var i = 0; i < fileNames.length; i++) {
		this.tracks.push(new Track(fileNames[i], audioCtx, this));
	}
	
	this.tellReady = function() {
		readyCount++;
		if (readyCount == this.tracks.length) {
			for (var i = 0; i < this.tracks.length; i++) {
				this.tracks[i].play();
			}
		}
	}
	
}