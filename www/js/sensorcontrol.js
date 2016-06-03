/**
 * Sensor controls that read their values from sensors.
 * @constructor
 * @extends {Control}
 * @param {Function=} resetFunction (optional)
 */
function SensorControl(controlName, sensorName, watchFunctionName, updateFunction, resetFunction, options) {
	
	var self = this;
	
	var $scope;
	
	var parameters = {};
	addParameter(new Parameter(AUTO_CONTROL_FREQUENCY, 100));
	addParameter(new Parameter(AUTO_CONTROL_TRIGGER, 0));
	Control.call(this, controlName, controlName, parameters);
	
	var watchID;
	
	function addParameter(param) {
		var paramName = param.getName();
		parameters[paramName] = param;
		parameters[paramName].addObserver(self);
	}
	this.addParameter = addParameter;
	
	this.getParameter = function(paramName) {
		return parameters[paramName];
	}
	
	this.startUpdate = function() {
		if (!options) {
			options = { frequency: parameters[AUTO_CONTROL_FREQUENCY].getValue() };
		}
		console.log(window["navigator"][sensorName])
		console.log(navigator.accelerometer)
		if (window["navigator"][sensorName]) {
			watchID = window["navigator"][sensorName][watchFunctionName](function(data) {
				updateFunction(data);
				if ($scope) {
					//scope apply here whenever something changes
					setTimeout(function() {
						$scope.$apply();
					}, 10);
				}
			}, onError, options);
		} else {
			console.log(controlName + " not available");
		}
	}
	
	this.setScopeAndStart = function(scope) {
		$scope = scope;
		// Wait for device API libraries to load
		document.addEventListener("deviceready", this.startUpdate, false);
	}
	
	this.reset = function() {
		if (watchID) {
			window["navigator"][sensorName].clearWatch(watchID);
			watchID = null;
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