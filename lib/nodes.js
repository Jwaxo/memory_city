exports.createNode = function(nodeType) {
	
	var node = new Node(nodeType);
	
	return node;
	
}

function Node(type) {
	
	var node = {};
	
	function findType(type) {
		//This function finds an object type, looks to see if it has a prototype,
		//and calls the parents recursively
		
		var parsedNode = require('./lib/nodes/' + type + '.json');
		
		for (var nodeProperty in parsedNode) {
			if (!node.hasOwnProperty[nodeProperty]) {
				node[nodeProperty] = parsedNode[nodeProperty];
			}
		}
		
		if (parsedNode.hasOwnProperty[parentType]) {
			findType(parsedNode.parentType);
		}
	}
	
	return node;
}