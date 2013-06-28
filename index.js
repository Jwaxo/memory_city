module.exports = function() {

	var seedrandom = require('seed-random');
	var fs = require('fs');
	
	var nodeTree = new NodeTree();
	var nodes = fs.readdirSync('./lib/nodes');
	
	for (var i=0;i<nodes.length;i++) {
		nodeTree.buildBranch(nodes[i]);
	}

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
		//separately because the objects property of the map needs to reference it.
		
		var map = {
			'grid' : grid.grid,
			'objects' : grid.createRoots(config.map.x, config.map.y, config.map.roots, config.map.root_type)
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
		
		this.branches[type] = parsedNode;
		this.branches[type].children = {};
		
		if (parsedNode.hasOwnProperty("parentType")) {
			if (this.branches[parsedNode.parentType] == undefined) {
				this.buildBranch(parsedNode.parentType + ".json");
			}
			this.branches[parsedNode.parentType].children[type] = parsedNode;
			console.log("Built branch '" + this.branches[type].type + "' with parent '" + this.branches[parsedNode.parentType].type + "'.");
		} else {
			this.tree[type] = this.branches[type];
			console.log("Built trunk with '" + this.tree[type].type + "'.");
		}

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
	
	this.createRoots = function(x, y, roots, root_type) {
		//Roots are what I call the "basic" building blocks, mostly just another
		//variable of influence one can have when creating a new map. 
		var objects = [];
		for(var i = 0; i < roots; i++) {
			console.log('Generating root.');
			new_coords = this.generateCoords(x, y);
			objects[i] = {
				coords: new_coords,
				grid_ref: this.grid[(new_coords.x)][(new_coords.y)],
				node: require('./lib/nodes.js').createNode(root_type)
			};
			this.grid[new_coords.x][new_coords.y].object = objects[i];
			
		}
	}
	
	this.generateCoords = function(x, y) {
		var possible_x = Math.floor(Math.random()*(x*2));
		var possible_y = Math.floor(Math.random()*(y*2));
		if(this.grid[possible_x][possible_y].object) {
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