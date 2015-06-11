function Mapping(control, parameter, multiplier, addend, modulus) {
	
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
	
}


function LocationMapping(controls, locations, ranges, parameter, minimum, maximum, $scope) {
	
	if (!maximum) {
		maximum = 1;
	}
	if (!minimum) {
		minimum = 0;
	}
	
	var currentDistances = [];
	
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
		$scope.parameter = currentDistances + " " ;
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