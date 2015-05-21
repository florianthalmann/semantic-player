function Mapping(control, parameter, multiplier) {
	
	//TODO HERE WE'LL REALIZE VARIOUS KINDS OF MAPPINGS (LINEAR, EXP, ETC)
	
	this.updateParameter = function(value) {
		if (multiplier) {
			value *= multiplier;
		}
		parameter.update(this, value);
	}
	
	this.updateControl = function(value) {
		if (multiplier) {
			value /= multiplier;
		}
		control.updateValue(value);
	}
	
	control.addMapping(this);
	parameter.addMapping(this);
	
}