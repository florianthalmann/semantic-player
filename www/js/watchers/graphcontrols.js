function GraphControls(graph) {
	
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
					currentNode = options[selectedOption];
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