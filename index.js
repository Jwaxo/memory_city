module.exports = function() {

	var seedrandom = require('seed-random');
	var fs = require('fs');
	
	var nodeTree = new NodeTree();
	//Nodes are any rendered occupant of a tile, ideally entourage, buildings,
	//or roads. They define what a given tile may be. They are read dynamically
	//from the /lib/nodes folder, which parses for any .json files.
	
	//Nodes are defined heirarchically, thus, if a node is a child node, it will
	//inherit any properties that are not defined specifically for the child,
	//but are defined by the parent.
	
	//Thus far, nodes may have the following properties:
	//	Note that any parent property can be overwritten with the value "!none"
	//	to be a non-specified value on a child.
	//type - the identifying name of the node, which matches the .json file name
	//parentType - the identifying name of the parent this node inherits from
	//color - a basic color this node is. Will be replaced later.
	//size - The maximum number of tiles a grouped number of nodes will take up.
	//	If blank, there is no maximum size.
	//	Example: a school's size is "3", so after generating a school, 2 more
	//	tiles may be reserved adjacent to the initial node for creating a school
	//chance - the relative probability of a given node type being generated,
	//	relative to every other "chance" property, and also only relative to
	//	"sibling" node types. Example: a school is 30, a house is 90. A house
	//	is three times more likely to occur than a school.
	//adjacent - the type of node this node must be next to in order to initially
	//	spawn.
	//	May reference a node type or "!side".
	//	Note that if a node's size is greater than 1 and has an adjacent,
	//	once spawned it will be able to grow as much as it wants.
	//shape - one of the following possible shapes: "square", "line", "rectangle"
	//	Shapes will be the most important part of the algorithm, eventually.
	var nodes = fs.readdirSync('./lib/nodes');
	
	for (var i=0;i<nodes.length;i++) {
		nodeTree.buildBranch(nodes[i]);
	}
	console.log("Node tree built as " + nodeTree.branches["school"].size);
	console.log('Map generator ready.');
	
	return function(config) {
		console.log('Config received');
		if(config.seed) {
			seedrandom(config.seed, true); //If a seed is set, replace Math.random()
			console.log('Generating map from seed "' + config.seed + '".');
		} else {
			seedrandom('', true); //If not, we still need a seed, so make one
			console.log('Generating map from random seed.');
		}
		
		var grid = new Grid(config.map.x, config.map.y); //We create the grid
		//separately because the nodes property of the map needs to reference it.
		
		var map = {
			'grid' : grid.grid,
			'nodes' : grid.createRoots(config, nodeTree)
		};
				
		return map;
	};
}();

function NodeTree() {

	this.tree = []; //We keep our complete, exclusive heirarchy here
	this.branches = []; //Which references our recursive, unsorted node types
		
	this.buildBranch = function(node) {
	//This function finds a node type, looks to see if it has a prototype,
	//and calls the parents recursively to build a "branch"
		var parsedNode = require('./lib/nodes/' + node );
		
		var type = parsedNode.type;
		
		console.log("Creating new branch '" + type + "'.");
		
		if (parsedNode.hasOwnProperty("parentType")) {

		}
		
		parsedNode.children = {};
		
		if (parsedNode.hasOwnProperty("parentType")) {
			if (this.branches[parsedNode.parentType] == undefined) {
				this.buildBranch(parsedNode.parentType + ".json");
			}
			for (property in this.branches[parsedNode.parentType]) {
				if (property === "children") continue;
				if (!parsedNode.hasOwnProperty(property)) {
					parsedNode[property] = this.branches[parsedNode.parentType];
				}
			}
			this.branches[type] = parsedNode;
			this.branches[parsedNode.parentType].children[type] = this.branches[type];
			console.log("Built branch '" + this.branches[type].type + "' with parent '" + this.branches[parsedNode.parentType].type + "'.");
		} else {
			this.tree[type] = this.branches[type];
			console.log("Built trunk with '" + this.tree[type].type + "'.");
		}

	}
    this.createNode = function(type) {
	//This function finds a node type, looks to see if it has a prototype,
	//and calls the parents recursively
	
		var parsedNode = this.branches[type];
		
		return parsedNode;
    }
}

function Grid(x, y) {
	this.grid = [];
	var max_x = x*2+1;
	var max_y = y*2+1;
	//Since JS (and, presumably, most languages) can't deal with negative
	//integers for its array keys, we need to double+1 the x and y coords
	//for use in our loops.
	
	for(var i = 0; i < max_x; i++) {
		this.grid[i] = [];
		for(var j = 0; j < max_y; j++) {
			this.grid[i][j] = {
				x : (i-x),
				y : (j-y)
				//Then when we assign the "real" coords, we can use the negative
				//values, calculated here.
			};
		}
	}
	
	this.createRoots = function(config, nodeTree) {
		//Roots are what I call the "basic" building blocks, mostly just another
		//variable of influence one can have when creating a new map. 
		var x = config.map.x
		  , y = config.map.y
		  , roots = config.map.roots
		  , root_type = config.map.root_type
		var nodes = [];
		for(var i = 0; i < roots; i++) {
			console.log('Generating root.');
			new_coords = this.generateCoords(x, y);
			nodes[i] = {
				coords: new_coords,
				grid_ref: this.grid[(new_coords.x)][(new_coords.y)],
				node: nodeTree.createNode('school')
			};
			this.grid[new_coords.x][new_coords.y].node = nodes[i];
			
		}
	}
	
	this.generateCoords = function(x, y) {
		var possible_x = Math.floor(Math.random()*(x*2));
		var possible_y = Math.floor(Math.random()*(y*2));
		if(this.grid[possible_x][possible_y].node) {
			console.log('Coordinate location occupied, re-generating.');
			generateCoords(x, y);
		} else {
			console.log('Generated coordinate: ' + (possible_x-x).toString() + ',' + (possible_y-y).toString());
			coords = {
				x: (possible_x),
				y: (possible_y)
			};
		}
		
		return coords;
	}
	
}