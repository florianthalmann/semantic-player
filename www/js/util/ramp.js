/**
 * A ramp utility that calls a given function repeatedly until interrupted.
 * @constructor
 * @extends {Control}
 * @param {Function=} resetFunction (optional)
 */
function Ramp() {
	
	var intervalID;
	var delta;
	var currentValue = 0;
	
	this.setValue = function(value) {
		currentValue = value;
	}
	
	this.startOrUpdate = function(targetValue, duration, frequency, callback) {
		if (duration > frequency) {
			if (intervalID) {
				clearInterval(intervalID);
			}
			delta = (targetValue-currentValue)/(duration/frequency);
			intervalID = setInterval(function() {
				currentValue += delta;
				callback(currentValue);
			}, frequency);
		}/* else {
			currentValue = targetValue;
			callback(currentValue);
		}*/
	}
	
}