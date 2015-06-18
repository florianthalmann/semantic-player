function Parameter(owner, initialValue, isInteger) {
	
	this.owner = owner;
	this.value = initialValue;
	this.mappings = [];
	var changed = false;
	
	this.addMapping = function(mapping) {
		this.mappings.push(mapping);
	}
	
	this.update = function(mapping, value) {
		if (value || value == 0) {
			this.setValueAndUpdateOtherMappings(mapping, value)
			if (this.owner.update) {
				this.owner.update();
			}
		}
	}
	
	this.setValueAndUpdateOtherMappings = function(mapping, value) {
		if (isInteger) {
			value = Math.round(value);
		}
		this.value = value;
		changed = true;
		//update values of all other controllers connected to this parameter
		for (var i = 0; i < this.mappings.length; i++) {
			if (this.mappings[i] != mapping) {
				this.mappings[i].updateControl(value);
			}
		}
	}
	
	//returns true if the value has changed since the last time this method was called
	this.hasChanged = function() {
		var previousChanged = changed;
		changed = false;
		return previousChanged;
	}
	
	//returns the first value that it manages to request from one of the mappings
	this.requestValue = function() {
		for (var i = 0; i < this.mappings.length; i++) {
			var value = this.mappings[i].requestValue();
			if (value || value == 0) {
				this.setValueAndUpdateOtherMappings(this.mappings[i], value);
				return value;
			}
		}
	}
	
	//resets all the mappings
	this.reset = function() {
		for (var i = 0; i < this.mappings.length; i++) {
			this.mappings[i].reset();
		}
	}
	
}