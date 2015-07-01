function AccelerometerWatcher($scope) {
	
	var TILT_SENSITIVITY = 0.1;
	
	var xControl = new Control();
	var yControl = new Control();
	var zControl = new Control();
	var tiltXControl = new Control();
	var tiltYControl = new Control();
	this.xControl = xControl;
	this.yControl = yControl;
	this.zControl = zControl;
	this.tiltXControl = tiltXControl;
	this.tiltYControl = tiltYControl;
	
	var currentTiltX = 0;
	var currentTiltY = 0;
	
	// The watch id references the current `watchAcceleration`
	var watchID = null;

	// Wait for device API libraries to load
	document.addEventListener("deviceready", onDeviceReady, false);

	// device APIs are available
	function onDeviceReady() {
		startWatch();
	}

	// Start watching the acceleration
	function startWatch() {
		// Update acceleration every 50 milliseconds
		var options = { frequency: 50 };
		watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
	}
	
	// onSuccess: Get a snapshot of the current acceleration
	function onSuccess(acceleration) {
		var x = normalizeAcceleration(acceleration.x);
		var y = normalizeAcceleration(acceleration.y);
		var z = normalizeAcceleration(acceleration.z);
		xControl.updateMappings(x);
		yControl.updateMappings(y);
		zControl.updateMappings(z);
		currentTiltX += TILT_SENSITIVITY*(2*x-1);//counteract normalization
		currentTiltY += TILT_SENSITIVITY*(2*y-1);
		tiltXControl.updateMappings(currentTiltX);
		tiltYControl.updateMappings(currentTiltY);
		console.log(x, y, currentTiltX, currentTiltY);
		if ($scope) {
			//scope apply here whenever something changes
			setTimeout(function() {
				$scope.$apply();
			}, 10);
		}
	}
	
	// normalizes acceleration to interval [0,1]
	function normalizeAcceleration(acceleration) {
		return (acceleration / 9.81 + 1) / 2;
	}

	// Stop watching the acceleration
	function stopWatch() {
		if (watchID) {
			navigator.accelerometer.clearWatch(watchID);
			watchID = null;
		}
	}

	// onError: Failed to get the acceleration
	function onError() {
		alert('onError!');
	}
	
}