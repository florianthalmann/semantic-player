function Control(referenceAverageOf, $scope) {
	
	this.referenceValue;
	this.value;
	this.mappings = [];
	var currentNumAddends, currentSum;
	
	this.reset = function() {
		this.value = 0;
		currentNumAddends = 0;
		currentSum = 0;
	}
	
	if (referenceAverageOf) {
		this.reset();
	}
	
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
		//still measuring reference value
		if (referenceAverageOf && currentNumAddends < referenceAverageOf) {
			currentSum += value;
			currentNumAddends++;
			//done measuring values. calculate average
			if (currentNumAddends == referenceAverageOf) {
				currentSum /= referenceAverageOf;
				this.referenceValue = currentSum;
			}
		//done measuring. adjust value if initialvalue taken
		} else {
			if (value) {
				this.value = value;
			}
			if (this.referenceValue) {
				this.value -= this.referenceValue;
			}
			for (var i = 0; i < this.mappings.length; i++) {
				this.mappings[i].updateParameter(this.value);
			}
		}
	}
	
}