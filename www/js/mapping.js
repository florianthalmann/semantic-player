function Mapping(controls, functions, multipliers, addends, moduli, parameter) {
	
	var currentFunctionValues = [];
	
	this.updateParameter = function(value, control) {
		var controlIndex = controls.indexOf(control);
		currentFunctionValues[controlIndex] = getFunctionValue(value, controlIndex);
		var product = 1;
		for (var i = 0; i < controls.length; i++) {
			product *= currentFunctionValues[i];
		}
		parameter.update(this, product);
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
				if (addends) {
					value -= addends[i];
				}
				if (moduli) {
					value = moduloAsItShouldBe(value, moduli[i]);
				}
				if (multipliers) {
					value /= multipliers[i];
				}
				controls[i].updateValue(value);
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