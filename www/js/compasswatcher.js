function CompassWatcher() {
	
	var headingControl = new Control();
	var trueHeadingControl = new Control();
	var accuracyControl = new Control();
	this.headingControl = headingControl;
	this.trueHeadingControl = trueHeadingControl;
	this.accuracyControl = accuracyControl;
	
	var initialHeading, initialTrueHeading;
	
	var watchID = null;

	console.log("start compass");
	startWatch();

	function startWatch() {
		var options = { frequency: 100 };
		watchID = navigator.compass.watchHeading(onSuccess, onError, options);
	}
	
	function onSuccess(heading) {
		if (!initialHeading) {
			initialHeading = heading.magneticHeading;
			initialTrueHeading = heading.trueHeading;
		} else {
			headingControl.updateMappings(heading.magneticHeading-initialHeading);
			trueHeadingControl.updateMappings(heading.trueHeading-initialTrueHeading);
			accuracyControl.updateMappings(heading.headingAccuracy);
		}
	}
	
	function stopWatch() {
		if (watchID) {
			navigator.compass.clearWatch(watchID);
			watchID = null;
		}
	}
	
	function onError() {
		console.log('no update in compass watcher');
	}
	
}