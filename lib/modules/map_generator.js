var config = require('../../config').values;
var seedrandom_module = require('./lib/modules/seedrandom/seedrandom.js');

var createMap = function () {
	if(config.seed) {
		seed = config.seed;
		console.log('Generating map from seed "' + seed + '"');

	} else {
		seed = Math.random;
		console.log('Generating map from random seed.');
	}
	Math.seedrandom(seed);
	
	var map = Math.random();
	
	return map.toString();
};

exports.createMap = createMap;