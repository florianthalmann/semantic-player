function Mapping(type, controls, functions, multipliers, addends, moduli, parameter) {
	
	var currentFunctionValues = [];
	
	this.updateParameter = function(value, control) {
		var controlIndex = controls.indexOf(control);
		currentFunctionValues[controlIndex] = getFunctionValue(value, controlIndex);
		parameter.update(this, calculateParameter());
	}
	
	function calculateParameter() {
		if (type == Constants.PRODUCT_MAPPING) {
			var product = 1;
			for (var i = 0; i < controls.length; i++) {
				product *= currentFunctionValues[i];
			}
			return product;
		} else {
			var sum = 0;
			for (var i = 0; i < controls.length; i++) {
				sum += currentFunctionValues[i];
			}
			return sum;
		}
	}
	
	function getFunctionValue(value, i) {
		value = functions[i].getValue(value);
		if (multipliers[i]) {
			value *= multipliers[i];
		}
		if (moduli[i]) {
			value = moduloAsItShouldBe(value, moduli[i]);
		}
		if (addends[i]) {
			value += addends[i];
		}
		return value;
	}
	
	this.updateControl = function(value) {
		//TODO MAPPING NOT POSSIBLE IF SEVERAL DIMENSIONS
		if (controls.length <= 1) {
			for (var i = 0; i < controls.length; i++) {
				if (addends[i]) {
					value -= addends[i];
				}
				if (moduli[i]) {
					value = moduloAsItShouldBe(value, moduli[i]);
				}
				if (multipliers[i]) {
					value /= multipliers[i];
				}
				controls[i].updateValue(value);
			}
		}
	}
	
	this.requestValue = function() {
		for (var i = 0; i < controls.length; i++) {
			if (controls[i].requestValue) {
				var value = controls[i].requestValue();
				if (value || value == 0) {
					currentFunctionValues[i] = getFunctionValue(value, i);
				}
			}
		}
		return calculateParameter();
	}
	
	this.reset = function() {
		for (var i = 0; i < controls.length; i++) {
			if (controls[i].reset) {
				controls[i].reset();
			}
		}
	}
	
	for (var i = 0; i < controls.length; i++) {
		controls[i].addMapping(this);
	}
	parameter.addMapping(this);
	
	//javascript modulo sucks
	function moduloAsItShouldBe(m, n) {
		return ((m % n) + n) % n;
	}
	
}