function Parameter(owner, updateFunction, initialValue, isInteger, isUpdateAbsolute) {
	
	this.value = initialValue;
	this.change = 0; //records amout of last change
	this.mappings = [];
	
	this.addMapping = function(mapping) {
		this.mappings.push(mapping);
		mapping.updateControl(this.value);
	}
	
	this.update = function(mapping, value) {
		if (value || value == 0) {
			this.setValueAndUpdateOtherMappings(mapping, value);
			//only update if value changed
			if (this.change && updateFunction) {
				if (isUpdateAbsolute) { //send absolute value rather than change
					updateFunction.call(owner, this.value);
				} else {
					updateFunction.call(owner, this.change);
				}
			}
		}
	}
	
	this.relativeUpdate = function(change) {
		this.update(undefined, this.value+change);
	}
	
	this.setValueAndUpdateOtherMappings = function(mapping, value) {
		if (isInteger) {
			value = Math.round(value);
		}
		this.change = value - this.value;
		this.value = value;
		//update values of all other controllers connected to this parameter
		for (var i = 0; i < this.mappings.length; i++) {
			if (this.mappings[i] != mapping) {
				this.mappings[i].updateControl(value);
			}
		}
	}
	
	//returns the first value that it manages to request that is different from this.value
	//returns this.value if none are different
	this.requestValue = function() {
		for (var i = 0; i < this.mappings.length; i++) {
			var value = this.mappings[i].requestValue();
			if (value && value != this.value) {
				this.setValueAndUpdateOtherMappings(this.mappings[i], value);
				return this.value;
			}
		}
		return this.value;
	}
	
	//resets all the mappings
	this.reset = function() {
		for (var i = 0; i < this.mappings.length; i++) {
			this.mappings[i].reset();
		}
	}
	
}