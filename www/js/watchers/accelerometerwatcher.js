function AccelerometerWatcher() {
	
	var $scope;
	
	var TILT_SENSITIVITY = 0.1;
	
	var xControl = new Control(ACCELEROMETER_X, ACCELEROMETER_X);
	var yControl = new Control(ACCELEROMETER_Y, ACCELEROMETER_Y);
	var zControl = new Control(ACCELEROMETER_Z, ACCELEROMETER_Z);
	var tiltXControl = new Control(TILT_X, TILT_X);
	var tiltYControl = new Control(TILT_Y, TILT_Y);
	this.xControl = xControl;
	this.yControl = yControl;
	this.zControl = zControl;
	this.tiltXControl = tiltXControl;
	this.tiltYControl = tiltYControl;
	
	var currentTiltX = 0;
	var currentTiltY = 0;
	
	// The watch id references the current `watchAcceleration`
	var watchID = null;
	
	this.setScopeAndStart = function(scope, $ionicPlatform) {
		$scope = scope;
		// Wait for device API libraries to load
		//document.addEventListener("deviceready", startWatch, false);
		$ionicPlatform.ready(startWatch);
	}
	
	// Start watching the acceleration
	function startWatch() {
		console.log("start")
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