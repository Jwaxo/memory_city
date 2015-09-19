module.exports = function () {
  //TODO: Set up way to show by zone
  //TODO: Draw borders based on siblings? Would need bits from threecity
  var seedrandom = require('seed-random');

  //Nodes are any rendered occupant of a tile, ideally entourage, buildings,
  //or roads. They define what a given tile may be. They are read dynamically
  //from the /lib/nodes folder, which parses for any .json files.

  //Nodes are defined heirarchically, thus, if a node is a child node, it will
  //inherit any properties that are not defined specifically for the child,
  //but are defined by the parent.

  //Thus far, nodes may have the following properties:
  //    Note that any parent property can be overwritten with the value "!none"
  //    to be a non-specified value on a child.
  //type - the identifying name of the node, which matches the .json file name
  //parentType - the identifying name of the parent this node inherits from
  //color - a basic color this node is. Will be replaced later.
  //size - The maximum number of tiles a grouped number of nodes will take up.
  //    If blank, there is no maximum size.
  //    Create ranges with a single - between numbers
  //    Example: a house's size is "1-2", so after generating a house, 1 more
  //    tiles may be reserved adjacent to the initial node for creating a house
  //width - multi-use property that changes depending upon shape. For example,
  //    in conjunction with "rectangle" and "size" determines the dimensions,
  //    or with "line" determines how wide the line is, with "size" being length.
  //chance - the relative probability of a given node type being generated,
  //    relative to every other "chance" property, and also only relative to
  //    "sibling" node types. Example: a school is 30, a house is 90. A house
  //    is three times more likely to occur than a school.
  //    If there is no chance property, a default of "10" is used.
  //adjacent - the type of node this node must be next to in order to initially
  //    spawn.
  //    References node types.
  //    Can be composed of a comma-separated list.
  //    Node types with a preceding ! will be read as "not road time".
  //    WARNING: if a parentType has an adjacent requirement, all children will
  //    implicitly have this requirement, even if they add additional adjacents
  //    Note that if a node's size is greater than 1 and has an adjacent,
  //    once spawned it will be able to grow as much as it wants.
  //adjacentExpand - requirements to check for when filling out the rest of the
  //    size requirements of a node.
  //shape - one of the following possible shapes: "square", "line", "rectangle"
  //    Shapes will be the most important part of the algorithm, eventually.
  //root - a referenced node that they were expanded from.

  console.log('Map generator ready.');

  return function (config, nodeTree) {
    if (config.seed) {
      seedrandom(config.seed, true); //If a seed is set, replace Math.random()
      console.log('Generating map from seed "' + config.seed + '".');
    } else {
      seedrandom('', true); //If not, we still need a seed, so make one
      console.log('Generating map from random seed.');
    }

    var grid = new Grid(config.map.x, config.map.y); //We create the grid
    //separately because the nodes property of the map needs to reference it.

    var map = {
      'grid': grid.grid,
      'nodes': grid.createRoots(config, nodeTree),
      'threeGrid' : grid.threeGridify()
    };
    return map;

  };
}();

function Grid(x, y) {
  this.grid = []; // Tracks coordinates by notation "this.grid[x][y]"
  this.nodes = []; // A hash of all nodes, arranged by nodeID (I believe)
  this.grid_unused = []; // A list to track which grid points are used;
                         //necessary because its indexes are tracked by grids
                         //for quick removal
  this.grid_unused_adjacent = []; // A list of empty gridpoints adjacent to
                                  // used points
  this.grid_unused_hash = []; // A hash of the unused grid that gets regenerated for quick grabbing.
  this.grid_unused_adjacent_hash = [];
  this.grid_x = x;
  this.grid_y = y;
  var max_x = this.grid_x;
  var max_y = this.grid_y;

  //Since JS (and, presumably, most languages) can't deal with negative
  //integers for its array keys, we need to double+1 the x and y coords
  //for use in our loops.
  for (var i = 0; i < max_x; i++) {
    this.grid[i] = [];
    for (var j = 0; j < max_y; j++) {
      this.grid[i][j] = {
        x: i,
        y: j
      };
      this.grid[i][j].unused_index = this.grid_unused.push(this.grid[i][j]) - 1;
    }
  }

  this.regenerateUnused = function () {
    //We do this every time we modify grid_unused for quick counting or
    //for grabbing of unused points. It can't exist alone because grid points
    //need to know which indexes to remove when they get occupied.

    this.grid_unused_hash = [];
    this.grid_unused_adjacent_hash = [];
    for (var i = 0; i < this.grid_unused.length; i++) {
      if (this.grid_unused[i]) {
        this.grid_unused_hash.push(this.grid_unused[i]);
      }
    }
    for (var i = 0; i < this.grid_unused_adjacent.length; i++) {
      if (this.grid_unused_adjacent[i]) {
        this.grid_unused_adjacent_hash.push(this.grid_unused_adjacent[i]);
      }
    }
    //TODO: log a percentage left to generate
    //console.log('Unused hash regenerated, unused point count is ' + this.grid_unused_hash.length);
  };

  this.createRoots = function (config, nodeTree) {
    //Roots are what I call the "basic" building blocks, mostly just another
    //variable of influence one can have when creating a new map.
    //TODO: Make the roots "zoning" points, and make many types of buildings
    //require to be next to the same building or touching the root
    var roots = config.map.roots
    for (var i = 0; i < roots.length; i++) {
      var nodesRoot
        , nodesRoad
        , road = {}
        , new_coords = {}
        , possibleDirections;
      var new_type = nodeTree.walkTypes(nodeTree.tree.building, this.propertyCheckCallback('zone', roots[i]));
      console.log('Generating root ' + new_type.type);
      new_coords = this.generateCoords();
      nodesRoot = this.createNode(new_coords, new_type.type, null, nodeTree);
      possibleDirections = this.findEmptyAdjacents(new_coords);
      roadCoords = possibleDirections[Math.floor(Math.random() * (possibleDirections.length))];

      if (roadCoords) {
        console.log('Found no roads, so creating road.');
        nodesRoad = this.createNode(roadCoords, "road", null, nodeTree);
        this.expandNode(this.nodes[nodesRoad], nodesRoad, nodeTree, config.shapes[this.nodes[nodesRoad].info.shape]);
      }
      console.log('Creating root.');
      this.expandNode(this.nodes[nodesRoot], nodesRoot, nodeTree, config.shapes[this.nodes[nodesRoad].info.shape]);
    }
    console.log('Filling remaining tiles.');
    this.fillEmptyTiles(config, nodeTree);

    console.log('Done generating grid.');

    return this.nodes;
  };

  this.fillEmptyTiles = function (config, nodeTree) {
    //This function recursively calls itself until there are no more
    //empty grid points
    //console.log('\033[2J'); //This command clears out the console window
    var percentRemains = this.grid_unused_hash.length / (config.map.x * config.map.y) * 100;
    console.log('Of ' + (config.map.x * config.map.y) + ' about ' + Math.floor(percentRemains) + '% remains');

    var new_point = this.generateCoordsAdjacent();
    var new_type = nodeTree.walkTypes(nodeTree.tree, this.walkTypesCallback(new_point));
    var new_node = this.createNode(new_point, new_type.type, null, nodeTree);
    var shape_function = config.shapes[this.nodes[new_node].info.shape];

    this.expandNode(this.nodes[new_node], new_node, nodeTree, shape_function);

    if (this.grid_unused_hash.length > 0) {
      this.fillEmptyTiles(config, nodeTree);
    }

  };

  this.generateCoords = function () {
    //Generates random coordinates based off of a given max x and y pair.
    //Note that this will not return in a grid coordinate (with possible
    //negative numbers) but from origin 0,0 to maximum x, y. Should be
    //obvious, but I've messed this up too many times to not note.
    var possible_grid_point = {};

    this.regenerateUnused();

    //Since we delete points from the hash when grid points are taken up,
    //the array ends up all funky, and we have to regenerate it quickly
    //before picking an unused point.

    possible_grid_point = this.grid_unused_hash[Math.floor(Math.random() * (this.grid_unused_hash.length - 1))];

    coords = {
      x: possible_grid_point.x,
      y: possible_grid_point.y
    };

    return coords;
  };

  this.generateCoordsAdjacent = function () {
    //Generates random coordinates of a grid point next to an occupied point.
    //Note that this will not return in a grid coordinate (with possible
    //negative numbers) but from origin 0,0 to maximum x, y. Should be
    //obvious, but I've messed this up too many times to not note.
    var possible_grid_point = {};

    this.regenerateUnused();

    //Since we delete points from the hash when grid points are taken up,
    //the array ends up all funky, and we have to regenerate it quickly
    //before picking an unused point.

    possible_grid_point = this.grid_unused_adjacent_hash[Math.floor(Math.random() * (this.grid_unused_adjacent_hash.length - 1))];

    coords = {
      x: possible_grid_point.x,
      y: possible_grid_point.y
    };

    return coords;
  };

  this.findEmptyAdjacents = function (coords) {
    //Finds if there is an empty space around a node in all directions
    //Returns coordinates of the found adjacents, and the direction they are in
    //relative to the input coordinate, with 0 through 4, starting up and
    //going clockwise.
    var x = coords.x;
    var y = coords.y;
    var newCoords = {};
    var possibleDirections = [];
    var newDirection;

    newCoords.x = x + 0;
    newCoords.y = y + 0;

    for (var i = 0; i < 4; i++) {
      if (this.grid[x][y + 1] && !this.grid[x][y + 1].node) {
        possibleDirections.push({
          x: x,
          y: y + 1,
          direction: 0, //Up
          unused_index: this.grid[x][y + 1].unused_index
        });
      }
      if (this.grid[x + 1] && !this.grid[x + 1][y].node) {
        possibleDirections.push({
          x: x + 1,
          y: y,
          direction: 1, //Right
          unused_index: this.grid[x + 1][y].unused_index
        });
      }
      if (this.grid[x][y - 1] && !this.grid[x][y - 1].node) {
        possibleDirections.push({
          x: x,
          y: y - 1,
          direction: 2, //Down
          unused_index: this.grid[x][y - 1].unused_index
        });
      }
      if (this.grid[x - 1] && !this.grid[x - 1][y].node) {
        possibleDirections.push({
          x: x - 1,
          y: y,
          direction: 3, //Left
          unused_index: this.grid[x - 1][y].unused_index
        });
      }
    }

    return possibleDirections;
  };

  this.propertyCheckCallback = function (property, values) {
    var that = this;

    return function (nodeBranch) {
      var isLegal = false;
      var requirements = [];

      if (nodeBranch.hasOwnProperty(property)) {
        if (nodeBranch[property].indexOf(',')) {
          requirements = nodeBranch[property].split(',');
        } else {
          requirements.push(nodeBranch[property]);
        }
        for (var i = 0; i < requirements.length; i++) {
          if (requirements.indexOf(values) > -1) {
            isLegal = true;
          }
        }
      }
      return isLegal;
    }
  };

  this.walkTypesCallback = function (coords) {
    var grid = this.grid;
    var that = this;

    return function (nodeBranch) {
      var isLegal = false;

      if (that.checkAdjacentType(coords, grid, nodeBranch, 'adjacent', 'type', 0, 'all')
        && that.checkAdjacentType(coords, grid, nodeBranch, 'zone', 'zone', 0, 'one')
      ) {
        isLegal = true;
      }

      return isLegal;
    }
  };


  this.checkAdjacentType = function (coords, grid, nodeBranch, property, test, parentID, comparison) {
    //Finds if there is a node adjacent to the current coords whose test property
    //matches a given property of the submitted nodeBranch, or does not match
    //a given NOT property (signified with a preceding "!").

    //For example, we want to make sure that our given nodeBranch's "adjacent"
    //property matches with an adjacent "type" test property.

    //If a given property has commas, the test will only care if ANY value in
    //the list matches ANY value in the other list

    var requirements = [];
    var testValues = [];
    var isLegal = true;
    var adjacentDirections = [];
    var x = coords.x;
    var y = coords.y;
    var allForNaught = false;
    var potentialGridpoint = false;
    var potentialCoords = false;
    var reqsFulfilled = true;

    if (nodeBranch[property] && nodeBranch[property] != '!none') {

      //Split up the requirements if there are more than one
      if (nodeBranch[property].indexOf(',')) {
        requirements = nodeBranch[property].split(',');
      } else {
        requirements.push(nodeBranch[property]);
      }

      //If all requirements are ! requirements, set a flag for easy calc.
      for (var i = 0; i < requirements.length; i++) {
        if (requirements[i].indexOf('!') > -1) {
          allForNaught = true;
        } else {
          allForNaught = false;
          break;
        }
      }

      //We're keeping this all in an array for possible use in the future.

      for (var i = 0; i < 4; i++) {
        potentialGridpoint = false;
        potentialCoords = false;
        switch (i) {
          case 0:
            if (grid[x][y + 1]) {
              potentialGridpoint = grid[x][y + 1];
              potentialCoords = {
                x: x,
                y: y + 1,
                direction: 0 //Up
              }
            }
            break;
          case 1:
            if (grid[x + 1] && grid[x + 1][y]) {
              potentialGridpoint = grid[x + 1][y];
              potentialCoords = {
                x: x + 1,
                y: y,
                direction: 1 //Right
              }
            }
            break;
          case 2:
            if (grid[x][y - 1]) {
              potentialGridpoint = grid[x][y - 1];
              potentialCoords = {
                x: x,
                y: y - 1,
                direction: 2 //Down
              }
            }
            break;
          case 3:
            if (grid[x - 1] && grid[x - 1][y]) {
              potentialGridpoint = grid[x - 1][y];
              potentialCoords = {
                x: x - 1,
                y: y,
                direction: 3 //Left
              }
            }
            break;
        }

        if (potentialGridpoint
          && potentialGridpoint.hasOwnProperty('node')
          && isLegal === true
          && potentialGridpoint.node.parentID != parentID
          && potentialGridpoint.node.nodeID != parentID
        ) {
          testValues = [];
          if (potentialGridpoint.node.info[test]) {
            if (potentialGridpoint.node.info[test].indexOf(',')) {
              testValues = potentialGridpoint.node.info[test].split(',');
            } else {
              testValues.push(potentialGridpoint.node.info[test]);
            }
            //First we test for "not" (!) requirements
            for (var j = 0; j < testValues.length; j++) {
              if (
                requirements.indexOf("!" + testValues[j]) > -1
              ) {
                isLegal = false;
                break;
              }
            }
            if (isLegal) { //Now test for non-"!" requirements, which
              //is where our "comparison" var comes in
              reqsFulfilled = true;

              for (var j = 0; j < testValues.length; j++) {
                if (requirements.indexOf(testValues[j]) == -1) {
                  reqsFulfilled = false;
                  if (comparison == 'all') {
                    break;
                  }
                } else if (requirements.indexOf(testValues[j]) > -1
                  && comparison == 'one'
                ) {
                  reqsFulfilled = true;
                  break;
                }
              }
              if (reqsFulfilled === true) {
                adjacentDirections.push(potentialCoords);
              }
            }
          }
        } else if (allForNaught && !potentialGridpoint.hasOwnProperty('node')) {
          //If a node requires only that other tiles NOT match,
          //and there is no node to check, just push it immediately
          adjacentDirections.push(potentialCoords);
        }
      }
      if (adjacentDirections.length < 1) {
        isLegal = false;
      }
    }

    return isLegal;
  };


  this.createNode = function (coords, nodeType, parentID, nodeTree) {
    //Creates a new node at given coordinates. Requires coordinates, the plaintext
    //name of the node type, parentID, and the nodeTree object. If no parentID,
    //give 0.
    var node = {
      coords: coords,
      grid_ref: this.grid[coords.x][coords.y],
      info: nodeTree.getNode(nodeType)
    };
    var nodeAdjacents = this.findEmptyAdjacents(coords);

    node.nodeID = this.nodes.push(node) - 1; //Make our this.nodes reference complete

    if (parentID != null) {
      node.root = this.nodes[parentID];
      node.parentID = parentID;
    } else {
      node.parentID = null;
    }
    this.grid[coords.x][coords.y].node = this.nodes[node.nodeID];

    for (var i = 0; i < nodeAdjacents.length; i++) {
      if (
        this.grid_unused[nodeAdjacents[i].unused_index]
        && !this.grid_unused_adjacent[nodeAdjacents[i].unused_index]
      ) {
        this.grid_unused_adjacent[nodeAdjacents[i].unused_index] = this.grid_unused[nodeAdjacents[i].unused_index];
      }
    }

    //We need to remove that point from the unused hash to keep the list
    //accurate, of course.
    delete this.grid_unused[this.grid[coords.x][coords.y].unused_index];
    if (this.grid_unused_adjacent[this.grid[coords.x][coords.y].unused_index]) {
      //This should only not trigger when we're creating our first few nodes
      delete this.grid_unused_adjacent[this.grid[coords.x][coords.y].unused_index];
    }
    this.regenerateUnused();

    return node.nodeID;
  };

  this.getNodePropertyRange = function (nodeInfo, property) {

    var returnProperty = 0;
    var propertyOptions = [];
    var propertyList = [];

    if (nodeInfo.hasOwnProperty(property)) {
      if (nodeInfo[property].indexOf('-') !== -1) {
        propertyList = nodeInfo[property].split('-'); //If there's a size range...
        for (var i = propertyList[0]; i <= propertyList[1]; i++) {
          propertyOptions.push(i);
        }
        returnProperty = propertyOptions[Math.floor(Math.random() * (propertyOptions.length))];
      } else if (nodeInfo[property].indexOf(',') !== -1) {
        propertyList = nodeInfo[property].split(','); //If there's a size list...
        for (var i = propertyList[0]; i <= propertyList[1]; i++) {
          propertyOptions.push(i);
        }
        returnProperty = propertyOptions[Math.floor(Math.random() * (propertyOptions.length))];
      } else {
        returnProperty = nodeInfo[property]; //If the size is just stated
      }
    }

    return returnProperty;
  };

  this.expandNode = function (node, nodeID, nodeTree, shape_function) {
    //This function finds the nodeType information for a given node, and then
    //creates child nodes to fill out that type until a given "stop" command is
    //given.
    //TODO: make a less arbitrary "stop expanding" rule than "when you fail twice."
    var notCount = 0;
    var lastFailed = false;
    var count = 0;
    var coords = [];
    var size = this.getNodePropertyRange(node.info, "size");
    var width = this.getNodePropertyRange(node.info, "width");
    var shape = shape_function(width);
    var sizeList = []; //These latter two are for nodes with multiple possible sizes
    var sizeOptions = [];

    while ((notCount < 4 && size == 0) || (size > 0 && count < size - 1 && notCount < 4)) {
      //If a node's size is infinite, stop when two nodes in a row are off the
      //grid or collide with another node. Otherwise stop at four in a row.
      //TODO: add attribute to shapes to self-govern how many notCount to look
      //for, with 4 as the default.

      coords = shape(lastFailed);

      if (coords === false) {
        console.log('Found invalid direction, moving on.');
        notCount++;
        lastFailed = false; // We can't let this be true since technically this is more serious a problem than some other failure.
        continue;
      }
      for (var i = 0; i < coords.length; i++) {

        // If, for whatever reason, it tries to expand through the root, just
        // ignore that and pretend it succeeded. Might cause a bad loop
        // problem on poorly-coded shapes.
        if (coords[i].x === 0 && coords[i].y === 0) {
          console.log('Trying to expand into the root, failing.');
          lastFailed = false;
          notCount = 0;
          continue;
        }

        coords[i].x = coords[i].x + node.coords.x;
        coords[i].y = coords[i].y + node.coords.y;

        if (!this.grid[coords[i].x] || !this.grid[coords[i].x][coords[i].y]) {
          console.log('Tried to expand off of the grid.');
          notCount++;
          lastFailed = true;
        }
        else if (this.grid[coords[i].x]
          && this.grid[coords[i].x][coords[i].y]
          && !this.grid[coords[i].x][coords[i].y].node
          && (!node.info.hasOwnProperty('adjacentExpand') || this.checkAdjacentType(coords[i], this.grid, node.info, 'adjacentExpand', 'type', nodeID, 'all'))
        ) {
          console.log('Successfully found place to expand.');
          nodesRoad = this.createNode(coords[i], node.info.type, nodeID, nodeTree);
          notCount = 0;
          count++;
          lastFailed = false;
        } else {
          console.log('Something failed, not adding a node.');
          notCount++;
          lastFailed = true;
        }
      }
    }

  };
  this.threeGridify = function () {
    var threeGrid = [];
    var current_node = {};

    for (var i = 0; i < this.grid.length; i++) {
      threeGrid[i] = [];
      for (var j = 0; j < this.grid[i].length; j++) {
        current_node = this.grid[i][j].node;
        threeGrid[i][j] = {
          'type': current_node.info.type,
          'color': Number('0x' + current_node.info.color),
          'id': current_node.nodeID
        };
        if (current_node.parentID !== null) {
          threeGrid[i][j].parentid = current_node.parentID;
        }
      }
    }
    console.log(threeGrid);
    return threeGrid;
  };

}
