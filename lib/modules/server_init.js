var createServer = function() {
	var express = require('express');
	
	var server = express();
	
	return server;
};

exports.createServer = createServer;