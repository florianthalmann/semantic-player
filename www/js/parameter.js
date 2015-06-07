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
			if (isInteger) {
				value = Math.round(value);
			}
			this.value = value;
			changed = true;
			if (this.owner.update) {
				this.owner.update();
			}
			//update values of all other controllers connected to this parameter
			for (var i = 0; i < this.mappings.length; i++) {
				if (this.mappings[i] != mapping) {
					this.mappings[i].updateControl(value);
				}
			}
		}
	}
	
	//returns true if the value has changed since the last time this method was called
	this.hasChanged = function() {
		var previousChanged = changed;
		changed = false;
		return previousChanged;
	}
	
}