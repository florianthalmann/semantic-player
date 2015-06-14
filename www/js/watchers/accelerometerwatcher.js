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
	//
	document.addEventListener("deviceready", onDeviceReady, false);

	// device APIs are available
	//
	function onDeviceReady() {
		startWatch();
	}

	// Start watching the acceleration
	//
	function startWatch() {

		// Update acceleration every 50 milliseconds
		var options = { frequency: 50 };

		watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
	}
	
	// onSuccess: Get a snapshot of the current acceleration
	//
	function onSuccess(acceleration) {
		xControl.updateMappings(acceleration.x);
		yControl.updateMappings(acceleration.y);
		zControl.updateMappings(acceleration.z);
		if ($scope) {
			//scope apply here whenever something changes
			setTimeout(function() {
				$scope.$apply();
			}, 10);
		}
	}

	// Stop watching the acceleration
	//
	function stopWatch() {
		if (watchID) {
			navigator.accelerometer.clearWatch(watchID);
			watchID = null;
		}
	}

	// onError: Failed to get the acceleration
	//
	function onError() {
		alert('onError!');
	}
	
}