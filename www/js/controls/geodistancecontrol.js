/**
 * A control based on geolocation distance
 * @constructor
 * @extends {SensorControl}
 */
function DistanceControl() {
	
	var self = this;
	
	var reference;
	
	SensorControl.call(this, GEOLOCATION_DISTANCE,
		"$cordovaGeolocation",
		"watchPosition",
		function(position) {
			if (!reference) {
				reference = [position.coords.latitude, position.coords.longitude];
			} else {
				currentDistance = latLonToMeters(reference[0], reference[1], position.coords.latitude, position.coords.longitude);
				self.update(currentDistance);
			}
		},
		function() {
			this.resetReferenceValue();
		},
		{
			enableHighAccuracy: true,
			timeout: 30000,
			maximumAge: 3000
		}
	);
	this.setReferenceAverageOf(5);
	//this.setAverageOf(5);
	
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
	
}
inheritPrototype(DistanceControl, SensorControl);