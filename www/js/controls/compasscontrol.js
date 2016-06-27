/**
 * A control based on true compass heading
 * @constructor
 * @extends {SensorControl}
 */
function CompassControl() {
	
	var self = this;
	
	SensorControl.call(this, COMPASS_HEADING,
		"$cordovaDeviceOrientation",
		"watchHeading",
		function(heading) {
			self.update(heading.trueHeading);
		},
		function() {
			this.resetReferenceValue();
		}
	);
	
}
inheritPrototype(CompassControl, SensorControl);