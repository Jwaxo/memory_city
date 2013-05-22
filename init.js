//Basic Hello World to get at least SOMETHING in the repo that isn't a Readme.

var http = require('http');
var server = require('./lib/modules/server_init').createServer();

var seedrandom_module = require('./lib/modules/seedrandom/seedrandom.js');

Math.seedrandom('seed');
var string = Math.random().toString();

server.get('/', function (request, response) {
	response.send(string);
});

server.listen(8000);

console.log("Server running at http://127.0.0.1:8000/");