
// Run as 'node test.js' first to generate this tree.
// Then run with 'beefy test.js' to use the tree.

var config = require('./config').values,
  fs = require('fs'),
	threeGridConfig = {
    "size" : "0", //height/size multiplier if greater than 0
    "type" : "type", //what property we're calling the "grouper"
    "asset_location" : "./examples/shapes", //not used yet
    "render_width" : "1200", //view grid width in pixels
    "render_height" : "800" //view grid height in pixels
  };

console.log("Config loaded with seed '" + config.seed + "'.");

var JSONAutoTree = require('jsonautotree');
var nodetree = new JSONAutoTree('./../../' + config.asset_location + '/nodes/');
// NOTE: THIS IS NOT WRITING THE FILE PROPERLY.
// ANYTHING CURRENTLY IN nodes_autotree.json IS JUST PASTED BY ME.
if (!nodetree) {
  nodetree.automateBranches();
  var autotree = JSON.stringify(nodetree);
  fs.writeFile('./lib/nodes_autotree.json', autotree, function (error) {
    if (error) {
      console.log('error is ' + error);
      throw error;
    }
    else {
      console.log('Autotree saved.');
    }
  });
}

// Require the module "factories" we'll be using.
var GridGenerator = require('./index'),
	ThreeGrid = require('threegrid');

var nodeTree = require('jsonautotree')('./lib/nodes');

var nodeTreeJSON = require('./lib/nodes_autotree.json');
console.log('Loaded tree from file.');
nodeTree.branchesFromCache(nodeTreeJSON);

// Put our config into GridGenerator, which creates our city as a massive ThreeGrid-able object.
var grid = GridGenerator(config, nodeTree);
// Then push that grid through ThreeGrid to generate the information for the city visuals.

var map = new ThreeGrid(grid.threeGrid);
//console.log(map);
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
