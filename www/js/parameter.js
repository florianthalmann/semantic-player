function Parameter(owner, initialValue) {
	
	this.owner = owner;
	this.value = initialValue;
	this.mappings = [];
	
	this.addMapping = function(mapping) {
		this.mappings.push(mapping);
	}
	
	this.update = function(mapping, value) {
		this.value = value;
		this.owner.update();
		//update values of all other controllers connected to this parameter
		for (var i = 0; i < this.mappings.length; i++) {
			if (this.mappings[i] != mapping) {
				this.mappings[i].updateControl(value);
			}
		}
	}
	
}