function DynamicMusicObject(uri, scheduler) {
	
	var parentDMO = null;
	var children = [];
	var sourcePath;
	var segmentation = [];
	var segmentsPlayed = 0;
	var skip = false;
	
	this.getUri = function() {
		return uri;
	}
	
	this.setParent = function(dmo) {
		parentDMO = dmo;
	}
	
	this.addChild = function(dmo) {
		dmo.setParent(this);
		children.push(dmo);
	}
	
	this.setSourcePath = function(path) {
		sourcePath = path;
	}
	
	this.setSegmentation = function(segments) {
		segmentation = segments;
	}
	
	this.getSegmentation = function() {
		return segmentation;
	}
	
	this.getSourcePath = function() {
		if (parentDMO && !sourcePath) {
			return parentDMO.getSourcePath();
		}
		return sourcePath;
	}
	
	//positive change in play affects children
	this.updatePlay = function(change) {
		//for now only play objects that don't have children
		if (children.length > 0) {
			for (var i = 0; i < children.length; i++) {
				children[i].updatePlay(change);
			}
		} else {
			if (change > 0) {
				scheduler.play(this);
			} else {
				scheduler.stop(this);
			}
		}
	}
	
	//change in amplitude does not affect children
	this.updateAmplitude = function(change) {
		scheduler.updateAmplitude(this, change);
		if (!sourcePath) {
			for (var i = 0; i < children.length; i++) {
				children[i].amplitude.relativeUpdate(change);
			}
		}
	}
	
	//change in amplitude does not affect children
	this.updateRate = function(change) {
		scheduler.updateRate(this, change);
		if (!sourcePath) {
			for (var i = 0; i < children.length; i++) {
				children[i].rate.relativeUpdate(change);
			}
		}
	}
	
	//change in pan affects pan of children
	this.updatePan = function(change) {
		scheduler.updatePan(this, change);
		for (var i = 0; i < children.length; i++) {
			children[i].pan.relativeUpdate(change);
		}
	}
	
	//change in distance affects distance of children
	this.updateDistance = function(change) {
		scheduler.updateDistance(this, change);
		for (var i = 0; i < children.length; i++) {
			children[i].distance.relativeUpdate(change);
		}
	}
	
	//change in reverb affects reverb of children
	this.updateReverb = function(change) {
		scheduler.updateReverb(this, change);
		for (var i = 0; i < children.length; i++) {
			children[i].reverb.relativeUpdate(change);
		}
	}
	
	//change in segment affects only segment of children if any
	function updateSegmentIndex(value) {
		segmentStart = segmentation[value];
		segmentEnd = segmentation[value+1];
		//scheduler.updateSegment(this, segmentStart, segmentEnd);
		for (var i = 0; i < children.length; i++) {
			children[i].updateSegmentIndex(value);
		}
	}
	
	function jumpToClosestSegment(time) {
		
	}
	
	this.getNextSegment = function() {
		i = this.segmentIndex.requestValue();
		start = segmentation[i];
		duration = segmentation[i+1]-start;
		
		//check parent segmentation
		if (parentDMO.getSegmentation().indexOf(start) >= 0) {
			segmentsPlayed = 0;
		}
		
		if (segmentsPlayed < this.segmentCount.value) {
			//if (!skip) {
				duration *= this.segmentDurationRatio.value;
				//}
			skip = !skip;
			if (start >= 0) {
				segmentsPlayed++;
				if (duration > 0) {
					console.log(segmentsPlayed, this.segmentCount.value, [start, duration]);
					return [start, duration];
				} else {
					return this.getNextSegment();
				}
			} else {
				return [0, undefined];
			}
		} else {
			return this.getNextSegment();
		}
	}
	
	this.play = new Parameter(this, this.updatePlay, 0);
	this.amplitude = new Parameter(this, this.updateAmplitude, 1);
	this.rate = new Parameter(this, this.updateRate, 1);
	this.pan = new Parameter(this, this.updatePan, 0);
	this.distance = new Parameter(this, this.updateDistance, 0);
	this.reverb = new Parameter(this, this.updateReverb, 0);
	this.segmentIndex = new Parameter(this, this.updateSegmentIndex, 0, true, true);
	this.segmentDurationRatio = new Parameter(this, undefined, 1, false, true);
	this.segmentCount = new Parameter(this, undefined, 4, true, true);
	
}