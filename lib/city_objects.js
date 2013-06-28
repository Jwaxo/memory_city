exports.createNode(nodeType) {
	
	var node = new Node(nodeType);
	
	return node;
	
}

function Node(type) {
	
	var parsedNode = require('./lib/nodes/' + type + '.json');
	
	return parsedNode;
	
}