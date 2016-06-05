/**
 * A control based on true compass heading
 * @constructor
 * @extends {SensorControl}
 */
function CompassControl() {
	
	var self = this;
	
	SensorControl.call(this, COMPASS_HEADING,
		"compass",
		"watchHeading",
		function(heading) {
			self.update(heading.trueHeading);
		},
		function() {
			this.resetReferenceValue();
		}
	);
	this.setReferenceAverageCount(3);
	
}
inheritPrototype(CompassControl, SensorControl);