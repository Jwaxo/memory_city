//Basic Hello World to get at least SOMETHING in the repo that isn't a Readme.

var http = require('http');
var seedrandom_module = require('seedrandom');

Math.seedrandom('seed');

var server = http.createServer(function (request, response) {
	response.writeHead(200);
	response.write(Math.random());
	response.end();
});

server.listen(8000);

console.log("Server running at http://127.0.0.1:8000/");