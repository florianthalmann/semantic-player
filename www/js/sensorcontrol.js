/**
 * Sensor controls that read their values from sensors.
 * @constructor
 * @extends {AutoControl}
 * @param {Function=} resetFunction (optional)
 * @param {Object=} options (optional)
 */
function SensorControl(uri, sensorName, watchFunctionName, updateFunction, resetFunction, options) {

	var self = this;

	var $scope, $ngSensor;
	var referenceValue;
	var referenceAverageOf;
	var averageOf;
	var previousValues;
	var previousUpdateTime;
	var ramp;
	var message = "not available";

	AutoControl.call(this, uri, sensorName);

	var watch;

	this.getValue = function() {
		var value = Control.prototype.getValue.call(this);
		if (isNaN(value)) {
			return message;
		}
		return value;
	}

	this.setReferenceAverageOf = function(count) {
		referenceAverageOf = count;
		this.resetReferenceValueAndAverage();
	}

	this.setAverageOf = function(count) {
		averageOf = count;
		this.resetReferenceValueAndAverage();
	}

	this.setSmooth = function(smooth) {
		if (smooth) {
			ramp = new Ramp();
		} else {
			ramp = undefined;
		}
	}

	this.resetReferenceValueAndAverage = function() {
		referenceValue = undefined;
		previousValues = [];
	}

	this.startUpdate = function() {
		if (!options) {
			options = { frequency: DYMO_STORE.findParameterValue(uri, AUTO_CONTROL_FREQUENCY) };
		}
		if ($ngSensor) {
			watch = $ngSensor[watchFunctionName](options);
			watch.then(null, onError, function(result) {
				updateFunction(result);
				if ($scope) {
					//scope apply here whenever something changes
					setTimeout(function() {
						$scope.$apply();
					}, 10);
				}
			});
		} else {
			console.log(uri + " not available");
		}
	}

	this.update = function(newValue) {
		message = "calibrating";
		//still measuring reference value
		if (referenceAverageOf && previousValues.length < referenceAverageOf) {
			previousValues.push(newValue);
			//done collecting values. calculate average and adjust previous values
			if (previousValues.length == referenceAverageOf) {
				referenceValue = getAverage(previousValues);
				previousValues = previousValues.map(function(a) { return a - referenceValue; });
			}
		//done measuring. adjust value if initialvalue taken
		} else {
			//take value relative to referenceValue (optional)
			if (referenceValue) {
				newValue -= referenceValue;
			}
			//take average of last averageOf values (optional)
			if (averageOf) {
				previousValues.push(newValue);
				//remove oldest unneeded values
				while (previousValues.length > averageOf) {
					previousValues.shift();
				}
				//calculate average
				if (previousValues.length == averageOf) {
					newValue = getAverage(previousValues);
				}
			}
			//update via smoothening ramp (optional)
			if (ramp) {
				var now = Date.now();
				var duration;
				if (!previousUpdateTime) {
					duration = 1000; //one second initially
				} else {
					duration = now-previousUpdateTime;
				}
				startUpdateRamp(newValue, duration);
				previousUpdateTime = now;
			} else {
				//call regular super method
				Control.prototype.update.call(this, newValue);
			}
		}
	}

	function getAverage(list) {
		var sum = list.reduce(function(a, b) { return a + b; });
		return sum / list.length;
	}

	function startUpdateRamp(targetValue, duration) {
		var frequency = DYMO_STORE.findParameterValue(uri, AUTO_CONTROL_FREQUENCY);
		ramp.startOrUpdate(targetValue, duration, frequency, function(value) {
			//call regular super method
			Control.prototype.update.call(self, value);
		});
	}

	this.getSensorName = function() {
		return sensorName;
	}

	this.getSensor = function() {
		return $ngSensor;
	}

	this.getScope = function() {
		return $scope;
	}

	this.setScopeNgSensorAndStart = function(scope, ngSensor) {
		$scope = scope;
		$ngSensor = ngSensor;
		// Wait for device API libraries to load (Cordova needs this)
		document.addEventListener("deviceready", this.startUpdate, false);
	}

	this.reset = function() {
		if (watch) {
			$ngSensor.clearWatch(watch);
			watch = null;
			if (resetFunction) {
				resetFunction();
			}
		}
	}

	function onError() {
		console.log(uri + ' control error!');
	}

}
inheritPrototype(SensorControl, AutoControl);
