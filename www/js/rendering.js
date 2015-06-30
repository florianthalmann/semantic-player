function Rendering(label, $scope) {
	
	this.label = label;
	
	//horizontal listener orientation in degrees
	this.listenerOrientation = new Parameter(this, 0);
	
	this.dmo = null;
	
	this.play = function() {
		this.dmo.play.update(undefined, 1);
	}
	
	this.stop = function() {
		this.dmo.play.update(undefined, 0);
	}
	
	this.update = function() {
		var angleInRadians = this.listenerOrientation.value * (Math.PI/180);
		$scope.audioContext.listener.setOrientation(Math.sin(angleInRadians), 0, -Math.cos(angleInRadians), 0, 1, 0);
	}
	
}