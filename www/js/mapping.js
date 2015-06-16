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

/*function Mapping(control, parameter, multiplier, addend, modulus) {
	
	//TODO HERE WE'LL REALIZE VARIOUS KINDS OF MAPPINGS (LINEAR, EXP, ETC)
	
	this.updateParameter = function(value) {
		if (multiplier) {
			value *= multiplier;
		}
		if (modulus) {
			value = moduloAsItShouldBe(value, modulus);
		}
		if (addend) {
			value += addend;
		}
		parameter.update(this, value);
	}
	
	this.updateControl = function(value) {
		if (addend) {
			value -= addend;
		}
		if (modulus) {
			value = moduloAsItShouldBe(value, modulus);
		}
		if (multiplier) {
			value /= multiplier;
		}
		control.updateValue(value);
	}
	
	control.addMapping(this);
	parameter.addMapping(this);
	
	//javascript modulo sucks
	function moduloAsItShouldBe(m, n) {
		return ((m % n) + n) % n;
	}
	
}*/


function LocationMapping(controls, locations, ranges, parameter, minimum, maximum) {
	
	if (!maximum) {
		maximum = 1;
	}
	if (!minimum) {
		minimum = 0;
	}
	
	var currentDistances = [];
	this.currentDistances = currentDistances;
	
	this.updateParameter = function(value, control) {
		var i = controls.indexOf(control);
		var distance = Math.abs(locations[i] - value);
		
		if (distance < ranges[i]) {
			currentDistances[i] = 1-(distance/ranges[i]);
		} else {
			currentDistances[i] = 0;
		}
		internalUpdate();
	}
	
	function internalUpdate() {
		var parameterValue = 1;
		for (var i = 0; i < currentDistances.length; i++) {
			parameterValue *= currentDistances[i];
		}
		parameterValue = minimum+(parameterValue*(maximum-minimum));
		parameter.update(this, parameterValue);
	}
	
	this.updateControl = function(value) {
		//TODO SLIGHTLY MORE TRICKY... MAY HAVE VARIOUS SOLUTIONS
		//control.updateValue(value);
	}
	
	for (var i = 0; i < controls.length; i++) {
		controls[i].addMapping(this);
	}
	parameter.addMapping(this);
	
}