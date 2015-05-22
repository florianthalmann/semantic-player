function Control($scope) {
	
	this.value = 0;
	this.mappings = [];
	
	this.addMapping = function(mapping) {
		this.mappings.push(mapping);
		mapping.updateParameter(this.value);
	}
	
	this.updateValue = function(value) {
		this.value = value;
		if ($scope) {
			$scope.$apply();
		}
	}
	
	this.updateMappings = function(value) {
		if (value) {
			this.value = value;
		}
		for (var i = 0; i < this.mappings.length; i++) {
			this.mappings[i].updateParameter(this.value);
		}
	}
	
}