/**
 * A wrapper for dymo-core controls to be used as Angular UI controls
 */
function UIControl(control, $scope) {
	
	this.value = control.getValue();
	control.setUpdateFunction(updateFunction);
	var count = 0;
	
	this.getName = function() {
		return control.getName();
	}
	
	this.getType = function() {
		return control.getType();
	}
	
	this.update = function() {
		if (count % 10 == 0) {
			control.update(this.value);
		}
		count++;
	}
	
	function updateFunction(newValue) {
		this.value = newValue;
		//$scope.$apply();
	}
	
}