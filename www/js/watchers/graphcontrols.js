function GraphControls(graph) {
	
	var CONTINUE_AFTER_LEAP = false; //if true the control continues after the part index leaped to
	//if false it stays on the general timeline and merely replaces parts according to the graph
	
	this.nextNodeControl = new Control(undefined, undefined, undefined, requestValue, reset, update);
	
	//graph = [[],[],[],[5],[8],[7],[5,6,7,8],[6],[],[5,6,7,8]];
	
	var currentNode = null;
	var leapProb = new Parameter(this, undefined, 0.5);
	this.leapProb = leapProb;
	
	this.setGraph = function(g) {
		graph = g;
	}
	
	function calculateNextNode() {
		if (currentNode == null) {
			currentNode = 0;
		} else {
			currentNode++;
			if (graph && graph[currentNode] && graph[currentNode].length > 0) {
				if (Math.random() < leapProb.value) {
					options = graph[currentNode];
					selectedOption = Math.floor(Math.random()*options.length);
					if (!CONTINUE_AFTER_LEAP) {
						return options[selectedOption];
					} else {
						currentNode = options[selectedOption];
					}
				}
			}
		}
		return currentNode;
	}
	
	function requestValue() {
		return calculateNextNode();
	}
	
	function reset() {
		currentNode = null;
	}
	
	function update(node) {
		currentNode = node;
	}
	
}