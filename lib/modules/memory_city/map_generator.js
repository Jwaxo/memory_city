var config = require('../../../config').values;
var seedrandom_module = require('../seedrandom/seedrandom.js');

function createGrid(x, y) {
	var grid = [];
	var max_x = x*2+1;
	var max_y = y*2+1;
	//Since JS (and, presumably, most languages) can't deal with negative
	//integers for its array keys, we need to double+1 the x and y coords
	//for use in our loops.
	
	for(var i = 0; i < max_x; i++) {
		grid[i] = [];
		for(var j = 0; j < max_y; j++) {
			grid[i][j] = {
				x : (i-x),
				y : (j-y)
				//Then when we assign the "real" coords, we can use the negative
				//values, calculated here.
			};
		}
	}
	return grid;
}

function createRoots(x, y, roots, root_type, grid) {
	var objects = [];
	for(var i = 0; i < roots; i++) {
		console.log('Generating root.');
		new_coords = generateCoords(x, y, grid);
		objects[i] = {
			coords: new_coords,
			grid_ref: grid[(new_coords.x)][(new_coords.y)],
			type: root_type
		};
		grid[new_coords.x][new_coords.y].object = objects[i];
	}
}

function generateCoords(x, y, grid) {
	var possible_x = Math.floor(Math.random()*(x*2));
	var possible_y = Math.floor(Math.random()*(y*2));
	if(grid[possible_x][possible_y].object) {
		console.log('Coordinate location occupied, re-generating.');
		generateCoords(x, y, grid);
	} else {
		console.log('Generated coordinate: ' + (possible_x-x).toString() + ',' + (possible_y-y).toString());
		coords = {
			x: (possible_x),
			y: (possible_y)
		};
	}
	
	return coords;
}
			
var createMap = function () {
	var seed = "";
	if(config.seed) {
		seed = config.seed;
		console.log('Generating map from seed "' + seed + '".');

	} else {
		seed = Math.random;
		console.log('Generating map from random seed.');
	}
	Math.seedrandom(seed); //Set our seed using seedrandom.js
	
	var grid = createGrid(config.map.x, config.map.y); //We create the grid
	//separately because the objects property of the map needs to reference it.
	
	var map = {
		grid : grid,
		objects : createRoots(config.map.x, config.map.y, config.map.roots, config.map.root_type, grid)
	};
			
	return map;
};

exports.createMap = createMap;