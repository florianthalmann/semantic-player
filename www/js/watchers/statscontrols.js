function StatsControls() {
	
	var randomControl = new Control();
	this.randomControl = randomControl;
	
	startUpdate();
	
	function startUpdate() {
		setInterval(function() {
			randomControl.updateMappings(Math.random());
			console.log("rando");
		}, 300);
	}
	
}