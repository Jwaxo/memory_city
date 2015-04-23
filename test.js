var config = require('./config').values,
	threeGridConfig = {
    "size" : "0", //height/size multiplier if greater than 0
    "type" : "type", //what property we're calling the "grouper"
    "asset_location" : "./examples/shapes", //not used yet
    "render_width" : "1200", //view grid width in pixels
    "render_height" : "800" //view grid height in pixels
  }

console.log("Config loaded with seed '" + config.seed + "'.");

// Require the module "factories" we'll be using.
var GridGenerator = require('./index'),
	ThreeGrid = require('threegrid');

// Put our config into GridGenerator, which creates our city as a massive ThreeGrid-able object.
var grid = GridGenerator(config);
// Then push that grid through ThreeGrid to generate the information for the city visuals.
var map = new ThreeGrid(grid);
// ...and render it all with three.js (in threegrid.js).
map.renderGrid(threeGridConfig);

//The following will be used once we switch back to rendering without a test
//function. For now we're using beefy, just as threegrid.js would for tests.

//The end goal is to run the server and respond with a JSON file of information,
//which the browserified code will interpret and display in three.js

/*
var http = require('http');
var express = require('express');
var server = express();

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
*/
