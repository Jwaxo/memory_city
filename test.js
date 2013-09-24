var config = require('./config').values;

console.log("Config loaded with seed '" + config.seed + "'.");

var http = require('http');
var express = require('express');
var server = express();

var map_generator = require('./index');

server.configure(function() {
    //Begin setting up the server
    server.set('title', 'Memory City');
    server.set('views', __dirname + '/views');
    server.set('view engine', 'ejs');
    server.engine('.html', require('ejs').renderFile);
    server.use(express.static(__dirname + '/public'));
    server.use(express.bodyParser());
});

server.configure('development', function() {
    console.log('Server running in development mode.');
});
server.configure('production', function() {
    console.log('Server running in production mode.');
});

var map = map_generator(config);

var body = {
    'map' : map
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
