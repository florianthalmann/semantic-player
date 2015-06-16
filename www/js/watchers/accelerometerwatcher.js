function AccelerometerWatcher($scope) {
	
	var xControl = new Control();
	var yControl = new Control();
	var zControl = new Control();
	this.xControl = xControl;
	this.yControl = yControl;
	this.zControl = zControl;
	
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
		xControl.updateMappings(normalizeAcceleration(acceleration.x));
		yControl.updateMappings(normalizeAcceleration(acceleration.y));
		zControl.updateMappings(normalizeAcceleration(acceleration.z));
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