function Mapping(controller, parameter, multiplier) {
	
	//TODO HERE WE'LL REALIZE VARIOUS KINDS OF MAPPINGS (LINEAR, EXP, ETC)
	
	this.updateParameter = function(value) {
		if (multiplier) {
			value *= multiplier;
		}
		parameter.update(this, value);
	}
	
	this.updateController = function(value) {
		if (multiplier) {
			value /= multiplier;
		}
		controller.updateValue(value);
	}
	
	controller.addMapping(this);
	parameter.addMapping(this);
	
}