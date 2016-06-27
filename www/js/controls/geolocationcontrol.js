/**
 * A control based on geolocation sensors (controlName is either GEOLOCATION_LATITUDE or GEOLOCATION_LONGITUDE)
 * @constructor
 * @extends {SensorControl}
 */
function GeolocationControl(controlName) {
	
	var self = this;
	
	SensorControl.call(this, controlName,
		"$cordovaGeolocation",
		"watchPosition",
		function(position) {
			var newValue;
			if (controlName == GEOLOCATION_LATITUDE) {
				newValue = position.coords.latitude;
			} else {
				newValue = position.coords.longitude;
			}
			self.update(newValue);
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
	//this.setReferenceAverageOf(10);
	//this.setAverageOf(10);
	
}
inheritPrototype(GeolocationControl, SensorControl);