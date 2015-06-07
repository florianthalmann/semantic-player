function GeolocationWatcher() {
	
	var latitudeControl = new Control(5);
	var longitudeControl = new Control(5);
	var accuracyControl = new Control();
	var distanceControl = new Control();
	this.latitudeControl = latitudeControl;
	this.longitudeControl = longitudeControl;
	this.accuracyControl = accuracyControl;
	this.distanceControl = distanceControl;
	
	this.reset = function() {
		latitudeControl.reset();
		longitudeControl.reset();
		distanceControl.reset();
	}
	
	var watchID = null;
	this.reset();
	startWatch();
	
	function startWatch() {
		var options = {
			enableHighAccuracy: true,
			timeout: 30000,
			maximumAge: 3000
		};
		watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
	}
	
	function onSuccess(position) {
		latitudeControl.updateMappings(position.coords.latitude);
		longitudeControl.updateMappings(position.coords.longitude);
		accuracyControl.updateMappings(position.coords.accuracy);
		if (latitudeControl.referenceValue && longitudeControl.referenceValue) {
			currentDistance = latLonToMeters(latitudeControl.referenceValue, longitudeControl.referenceValue, position.coords.latitude, position.coords.longitude);
			distanceControl.updateMappings(currentDistance);
		}
	}
	
	function latLonToMeters(lat1, lon1, lat2, lon2){  // generally used geo measurement function :)
		var R = 6378.137; // Radius of earth in KM
		var dLat = (lat2 - lat1) * Math.PI / 180;
		var dLon = (lon2 - lon1) * Math.PI / 180;
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		return d * 1000; // meters
	}
	
	function stopWatch() {
		if (watchID) {
			navigator.geolocation.clearWatch(watchID);
			watchID = null;
		}
	}
	
	function onError() {
		console.log('no update in geolocation watcher');
	}
	
}