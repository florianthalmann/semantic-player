function Watcher(waitForDeviceReady, watchedObject, watchFunction, clearWatchFunction, onSuccess, onError, options) {
	
	var initialAverageOf = 3;
	var currentAddends;
	
	var watchID = null;
	
	if (waitForDeviceReady) {
		document.addEventListener("deviceready", init, false);
	} else {
		init();
	}
	
	function init() {
		reset();
		startWatch();
	}
	
	function reset() {
		initialLatitude = 0;
		initialLongitude = 0;
		var currentAddends = 0;
	}

	function startWatch() {
		console.log(watchedObject);
		watchID = watchFunction.call(watchedObject, onSuccess, onError, options);
	}
	
	function stopWatch() {
		if (watchID) {
			clearWatchFunction.call(watchedObject, watchID);
			watchID = null;
		}
	}
	
}