/**
 * A control based on an accelerometer dimension
 * @constructor
 * @extends {SensorControl}
 */
function AccelerometerControl(dimension) {
	
	var self = this;
	
	SensorControl.call(this, dimension,
		"$cordovaDeviceMotion",
		"watchAcceleration",
		function(acceleration) {
			var newValue;
			if (dimension == ACCELEROMETER_X) {
				newValue = acceleration.x;
			} else if (dimension == ACCELEROMETER_Y) {
				newValue = acceleration.y;
			} else {
				newValue = acceleration.z;
			}
			self.update(normalizeAcceleration(newValue));
		}
	);
	
	// normalizes acceleration to interval [0,1]
	function normalizeAcceleration(acceleration) {
		return (acceleration / 9.81 + 1) / 2;
	}
	
}
inheritPrototype(AccelerometerControl, SensorControl);