//Basic Hello World to get at least SOMETHING in the repo that isn't a Readme.

var http = require('http');
var server = require('./lib/modules/server_init').createServer();
var express = require('express');

server.configure(function() {
	//Begin setting up the server
	server.set('title', 'Memory City');
	server.set('views', __dirname + '/views');
	server.set('view engine', 'ejs');
	server.engine('.html', require('ejs').renderFile);
	server.use(express.bodyParser());
});

var body = {
	map : require('./lib/modules/map_generator').createMap()
};
var views_var = server.get('views');

server.get('/', function (request, response) {
	console.log("Rendering view index.html at " + views_var);
	response.render('index.html', {
		'title': 'Memory City',
		'body': body
	});
});

server.listen(8000);

console.log("Server running at http://127.0.0.1:8000/");