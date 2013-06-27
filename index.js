module.exports = function() {

	var seedrandom_module = require('./lib/modules/seedrandom/seedrandom.js');

	console.log('Map generator ready.');
	
	return function(config) {
		console.log('Config received');
		var seed = "";
		if(config.seed) {
			seed = config.seed;
			console.log('Generating map from seed "' + seed + '".');

		} else {
			seed = Math.random;
			console.log('Generating map from random seed.');
		}
		Math.seedrandom(seed); //Set our seed using seedrandom.js
		
		var grid = new Grid(config.map.x, config.map.y); //We create the grid
		//separately because the objects property of the map needs to reference it.
		
		var map = {
			'grid' : grid.grid,
			'objects' : grid.createRoots(config.map.x, config.map.y, config.map.roots, config.map.root_type)
		};
				
		return map;
	};
}();

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
	
	this.createRoots = function(roots, root_type) {
		var objects = [];
		for(var i = 0; i < roots; i++) {
			console.log('Generating root.');
			new_coords = this.generateCoords(x, y);
			objects[i] = {
				coords: new_coords,
				grid_ref: this.grid[(new_coords.x)][(new_coords.y)],
				type: root_type
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