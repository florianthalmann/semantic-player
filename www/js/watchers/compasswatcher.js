function CompassWatcher($scope) {
	
	var headingControl = new Control(3);
	var trueHeadingControl = new Control(3);
	var accuracyControl = new Control();
	this.headingControl = headingControl;
	this.trueHeadingControl = trueHeadingControl;
	this.accuracyControl = accuracyControl;
	
	this.reset = function() {
		headingControl.reset();
		trueHeadingControl.reset();
	}
	
	var watchID = null;
	startWatch();

	function startWatch() {
		var options = { frequency: 100 };
		if (navigator.compass) {
			watchID = navigator.compass.watchHeading(onSuccess, onError, options);
		} else {
			console.log("compass not available");
		}
	}
	
	function onSuccess(heading) {
		headingControl.updateMappings(heading.magneticHeading);
		trueHeadingControl.updateMappings(heading.trueHeading);
		accuracyControl.updateMappings(heading.headingAccuracy);
		if ($scope) {
			//scope apply here whenever something changes
			setTimeout(function() {
				$scope.$apply();
			}, 10);
			//$scope.$apply(); //LEADS TO Error: [$rootScope:inprog] $digest already in progress
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