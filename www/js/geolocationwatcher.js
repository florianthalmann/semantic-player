function GeolocationWatcher() {
	
	var latitudeControl = new Control();
	var longitudeControl = new Control();
	var accuracyControl = new Control();
	var distanceControl = new Control();
	this.latitudeControl = latitudeControl;
	this.longitudeControl = longitudeControl;
	this.accuracyControl = accuracyControl;
	this.distanceControl = distanceControl;
	
	var initialLatitude, initialLongitude;
	
	var watchID = null;
	startWatch();

	function startWatch() {
		var options = {
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 300
		};
		watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
	}
	
	function onSuccess(position) {
		if (!initialLatitude || !initialLongitude) {
			initialLatitude = position.coords.latitude;
			initialLongitude = position.coords.longitude;
		} else {
			latitudeControl.updateMappings(position.coords.latitude-initialLatitude);
			longitudeControl.updateMappings(position.coords.longitude-initialLongitude);
			accuracyControl.updateMappings(position.coords.accuracy);
			currentDistance = latLonToMeters(initialLatitude, initialLongitude, position.coords.latitude, position.coords.longitude);
			distanceControl.updateMappings(currentDistance);
			//console.log('success in geolocation watcher');
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