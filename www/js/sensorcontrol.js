/**
 * Sensor controls that read their values from sensors.
 * @constructor
 * @extends {Control}
 * @param {Function=} resetFunction (optional)
 * @param {Boolean=} ramp if true then the values will be smoothly updated at AUTO_CONTROL_FREQUENCY (optional)
 */
function SensorControl(controlName, sensorName, watchFunctionName, updateFunction, resetFunction, options) {
	
	var self = this;
	
	var $scope, $ngSensor;
	var referenceValue;
	var referenceAverageOf;
	var averageOf;
	var previousValues;
	var previousUpdateTime;
	var ramp;
	var message = "not available";
	
	var parameters = {};
	addParameter(new Parameter(AUTO_CONTROL_FREQUENCY, 100));
	addParameter(new Parameter(AUTO_CONTROL_TRIGGER, 0));
	Control.call(this, controlName, controlName, parameters);
	
	var watch;
	
	function addParameter(param) {
		var paramName = param.getName();
		parameters[paramName] = param;
		parameters[paramName].addObserver(self);
	}
	this.addParameter = addParameter;
	
	this.getParameter = function(paramName) {
		return parameters[paramName];
	}
	
	this.getValue = function() {
		var value = Control.prototype.getValue.call(this);
		if (isNaN(value)) {
			return message;
		}
		return value;
	}
	
	this.setReferenceAverageOf = function(count) {
		referenceAverageOf = count;
		resetReferenceValueAndAverage();
	}
	
	this.setAverageOf = function(count) {
		averageOf = count;
		resetReferenceValueAndAverage();
	}
	
	this.setSmooth = function(smooth) {
		if (smooth) {
			ramp = new Ramp();
		} else {
			ramp = undefined;
		}
	}
	
	function resetReferenceValueAndAverage() {
		value = undefined;
		referenceValue = undefined;
		previousValues = [];
	}
	
	this.startUpdate = function() {
		if (!options) {
			options = { frequency: parameters[AUTO_CONTROL_FREQUENCY].getValue() };
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
			console.log(controlName + " not available");
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
		frequency = parameters[AUTO_CONTROL_FREQUENCY].getValue();
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
		console.log(controlName + ' control error!');
	}
	
	this.observedParameterChanged = function(param) {
		if (param == parameters[AUTO_CONTROL_FREQUENCY]) {
			if (watchID) {
				this.reset();
				this.startUpdate();
			}
		} else if (param == parameters[AUTO_CONTROL_TRIGGER]) {
			if (!watchID) {
				this.startUpdate();
			} else {
				this.reset();
			}
		}
	}
	
}
inheritPrototype(SensorControl, Control);