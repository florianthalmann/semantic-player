function GraphControls(graph) {
	
	this.nextNodeControl = new Control(undefined, undefined, undefined, undefined, requestValue, reset, update);
	
	//graph = [[],[],[],[5],[8],[7],[5,6,7,8],[6],[],[5,6,7,8]];
	
	var currentNode = null;
	var leapingProbability = new Parameter(this, undefined, 0.5);
	this.leapingProbability = leapingProbability;
	//if true the control continues after the part index leaped to
	//if false it stays on the general timeline and merely replaces parts according to the graph
	var continueAfterLeaping = new Parameter(this, undefined, 0, true);
	this.continueAfterLeaping = continueAfterLeaping;
	
	this.setGraph = function(g) {
		graph = g;
	}
	
	function calculateNextNode() {
		if (currentNode == null) {
			currentNode = 0;
		} else {
			currentNode++;
			if (graph && graph[currentNode] && graph[currentNode].length > 0) {
				if (Math.random() < leapingProbability.value) {
					options = graph[currentNode];
					selectedOption = Math.floor(Math.random()*options.length);
					if (!continueAfterLeaping.value) {
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