function DynamicMusicObject(uri, scheduler) {
	
	var parentDMO = null;
	var children = [];
	var sourcePath;
	var segmentation = [];
	var graph = null;
	var segmentsPlayed = 0;
	var skipProportionAdjustment = false;
	var previousIndex = null;
	
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
	
	this.setGraph = function(g) {
		graph = g;
	}
	
	this.getGraph = function() {
		return graph;
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
	this.updatePlaybackRate = function(change) {
		scheduler.updatePlaybackRate(this, change);
		if (!sourcePath) {
			for (var i = 0; i < children.length; i++) {
				children[i].playbackRate.relativeUpdate(change);
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
	this.updateSegmentIndex = function(value) {
		var start = segmentation[value];
		var end = segmentation[value+1];
		//scheduler.updateSegment(this, segmentStart, segmentEnd);
		for (var i = 0; i < children.length; i++) {
			children[i].jumpToSegment(start);
		}
	}
	
	this.jumpToSegment = function(time) {
		if (segmentation.length == 0) {
			return true;
		} else {
			var index = segmentation.indexOf(time);
			if (index >= 0) {
				this.segmentIndex.update(undefined, index);
				//ADJUST CHILDREN!!!!!
				return true;
			}
		}
		return false;
	}
	
	this.getNextSegment = function() {
		
		//TODO ONLY REQUEST IF NOT CHANGED RECENTLY (SOLVES PROBLEM )
		var index = this.segmentIndex.value;
		if (index == previousIndex || previousIndex == null) {
			index = this.segmentIndex.requestValue();
		}
		previousIndex = index;
		
		var start = segmentation[index];
		var duration = segmentation[index+1]-start;
		
		//try to adjust parent segmentation
		if (parentDMO.jumpToSegment(start)) {
			segmentsPlayed = 0;
		}
		//console.log(sourcePath, index, segmentation.length);
		if (segmentsPlayed < this.segmentCount.value) {
			duration *= this.segmentDurationRatio.value;
			if (!skipProportionAdjustment) {
				duration *= this.segmentProportion.value;
			}
			skipProportionAdjustment = !skipProportionAdjustment;
			if (start >= 0) {
				segmentsPlayed++;
				if (duration > 0) {
					//console.log(segmentsPlayed, this.segmentCount.value, [start, duration]);
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
	
	this.play = new Parameter(this, this.updatePlay, 0, true);
	this.amplitude = new Parameter(this, this.updateAmplitude, 1);
	this.playbackRate = new Parameter(this, this.updatePlaybackRate, 1);
	this.pan = new Parameter(this, this.updatePan, 0);
	this.distance = new Parameter(this, this.updateDistance, 0);
	this.reverb = new Parameter(this, this.updateReverb, 0);
	this.segmentIndex = new Parameter(this, this.updateSegmentIndex, 0, true, true);
	this.segmentDurationRatio = new Parameter(this, undefined, 1, false, true);
	this.segmentProportion = new Parameter(this, undefined, 1, false, true);
	this.segmentCount = new Parameter(this, undefined, 4, true, true);
	
}