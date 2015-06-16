function LinearFunction() {
	
	this.getValue = function(argument) {
		return argument;
	}
	
}

function TriangleFunction(position, range) {
	
	this.getValue = function(argument) {
		var distance = Math.abs(position - argument);
		if (distance < range) {
			return 1-(distance/range);
		} else {
			return 0;
		}
	}
	
}

function RectangleFunction(position, range) {
	
	this.getValue = function(argument) {
		var distance = Math.abs(position - argument);
		if (distance < range) {
			return 1;
		} else {
			return 0;
		}
	}
	
}