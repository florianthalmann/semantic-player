/**
 * Sensor controls that read their values from sensors.
 * @constructor
 * @extends {Control}
 * @param {Function=} resetFunction (optional)
 */
function SensorControl(controlName, sensorName, watchFunctionName, updateFunction, resetFunction, options) {
	
	var self = this;
	
	var $scope, $ngSensor;
	
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