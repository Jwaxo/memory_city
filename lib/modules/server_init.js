var createServer = function() {
	var express = require('express');
	
	var server = express();
	
	server.configure(function() {
		//Begin setting up the server
		server.set('title', 'Memory City');
		server.set('views', __dirname + '/views');
		server.set('view engine', 'ejs');
		server.engine('.html', require('ejs').renderFile);
		server.use(express.bodyParser());
	});
	
	server.configure('development', function() {
		console.log('Server running in development mode.');
	});
	server.configure('production', function() {
		console.log('Server running in production mode.');
	});
	
	return server;
};

exports.createServer = createServer;