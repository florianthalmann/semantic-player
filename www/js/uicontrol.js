/**
 * A wrapper for dymo-core controls to be used as Angular UI controls
 */
function UIControl(control, $scope) {
	
	var self = this;
	
	this.value = control.getValue();
	control.setUpdateFunction(updateFunction);
	
	this.getName = function() {
		return control.getName();
	}
	
	this.getType = function() {
		return control.getType();
	}
	
	this.update = function() {
		control.update(this.value);
	}
	
	function updateFunction(newValue) {
		self.value = newValue;
		setTimeout(function() {
			$scope.$apply();
		}, 10);
	}
	
}