function StatsControls($interval) {
	
	var frequency = new Parameter(this, undefined, 300);
	this.frequency = frequency;
	
	var randomControl = new Control();
	this.randomControl = randomControl;
	
	var currentPromise;
	
	startUpdate();
	
	function startUpdate() {
		currentPromise = $interval(function() {
			randomControl.updateMappings(Math.random());
		}, frequency.value);
	}
	
	this.update = function() {
		$interval.cancel(currentPromise);
		startUpdate();
	}
	
}