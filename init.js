//Basic Hello World to get at least SOMETHING in the repo that isn't a Readme.

var http = require('http');

var server = http.createServer(function (request, response) {
	response.writeHead(200);
	response.end("Hello World\n");
});

server.listen(8000);

console.log("Server running at http://127.0.0.1:8000/");