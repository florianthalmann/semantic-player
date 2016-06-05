/**
 * A tilt control based on an accelerometer dimension
 * @constructor
 * @extends {SensorControl}
 */
function TiltControl(dimension) {
	
	var self = this;
	
	var TILT_SENSITIVITY = 0.1;
	
	SensorControl.call(this, dimension,
		"accelerometer",
		"watchAcceleration",
		function(acceleration) {
			var delta;
			if (dimension == TILT_X) {
				delta = acceleration.x;
			} else if (dimension == TILT_Y) {
				delta = acceleration.y;
			}
			delta = normalizeAcceleration(delta);
			newValue = self.getValue() + TILT_SENSITIVITY*(2*delta-1);//counteract normalization
			self.update(newValue);
		}
	);
	
	// normalizes acceleration to interval [0,1]
	function normalizeAcceleration(acceleration) {
		return (acceleration / 9.81 + 1) / 2;
	}
	
}
inheritPrototype(TiltControl, SensorControl);