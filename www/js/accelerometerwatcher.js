function AccelerometerWatcher() {
	
	var xController = new Controller();
	var yController = new Controller();
	this.xController = xController;
	this.yController = yController;
	
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
      xController.updateMappings(acceleration.x);
			yController.updateMappings(acceleration.y);
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