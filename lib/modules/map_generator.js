var config = require('../../config').values;
var seedrandom_module = require('./seedrandom/seedrandom.js');

function createGrid(x, y) {
	var grid = new Array();
	for(i = 0-x; i < x + 1; i++) {
		grid[i] = new Array();
		for(j = 0-y; j < y + 1; j++) {
			grid[i][j] = Math.random;
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