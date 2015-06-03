function StatsControls($interval) {
	
	var randomControl = new Control();
	this.randomControl = randomControl;
	
	startUpdate();
	
	function startUpdate() {
		$interval(function() {
			randomControl.updateMappings(Math.random());
		}, 300);
	}
	
}