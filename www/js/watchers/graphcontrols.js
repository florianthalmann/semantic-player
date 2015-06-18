function GraphControls(graph) {
	
	var nextNodeControl = new Control(undefined, undefined, undefined, requestValue, reset);
	this.nextNodeControl = nextNodeControl;
	
	//graph = [[],[],[],[],[],[],[],[],[],[5,6,7,8]];
	
	var currentNode = null;
	
	function calculateNextNode() {
		if (currentNode == null) {
			currentNode = 0;
		} else if (graph && graph[currentNode] && graph[currentNode].length > 0) {
			options = graph[currentNode];
			selectedOption = Math.floor(Math.random()*options.length);
			currentNode = options[selectedOption];
		} else {
			currentNode++;
		}
		return currentNode;
	}
	
	function requestValue() {
		return calculateNextNode();
	}
	
	function reset() {
		currentNode = null;
	}
	
}