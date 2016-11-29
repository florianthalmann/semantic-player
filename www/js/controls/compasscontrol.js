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
			self.updateValue(heading.trueHeading);
		},
		function() {
			self.resetReferenceValueAndAverage();
		}
	);
	this.setReferenceAverageOf(3);

}
inheritPrototype(CompassControl, SensorControl);
