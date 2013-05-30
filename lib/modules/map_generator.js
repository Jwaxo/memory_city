var config = require('../../config').values;
var seedrandom_module = require('./seedrandom/seedrandom.js');

function createGrid(x, y) {
	var grid = new Array();
	var max_x = x*2+1;
	var max_y = y*2+1;
	//Since JS (and, presumably, most languages) can't deal with negative
	//integers for its array keys, we need to double+1 the x and y coords
	//for use in our loops.
	
	for(var i = 0; i < max_x; i++) {
		grid[i] = new Array();
		for(var j = 0; j < max_y; j++) {
			grid[i][j] = {
				x : (i-x),
				y : (j-y),
				//Then when we assign the "real" coords, we can use the negative
				//values, calculated here.
				value : Math.random()
			};
		}
	}
	return grid;
}

var createMap = function () {
	var seed = new String();
	if(config.seed) {
		seed = config.seed;
		console.log('Generating map from seed "' + seed + '"');

	} else {
		seed = Math.random;
		console.log('Generating map from random seed.');
	}
	Math.seedrandom(seed);
	
	var map = {
		grid : createGrid(config.map.x, config.map.y)
		//objects : createRoots(config.roots)
	};
			
	return map;
};

exports.createMap = createMap;