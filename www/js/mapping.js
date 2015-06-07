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