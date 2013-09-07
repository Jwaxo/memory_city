module.exports = function() {

    var seedrandom = require('seed-random');
    var fs = require('fs');
    
    var nodeTree = new NodeTree();

    var nodes = fs.readdirSync('./lib/nodes');
    
    for (var i=0;i<nodes.length;i++) {
        nodeTree.buildBranch(nodes[i]);
    }
    
    console.log('Map generator ready.');
    
    return function(config) {
        console.log('Config received');
        if(config.seed) {
            seedrandom(config.seed, true); //If a seed is set, replace Math.random()
            console.log('Generating map from seed "' + config.seed + '".');
        } else {
            seedrandom('', true); //If not, we still need a seed, so make one
            console.log('Generating map from random seed.');
        }
        
        var grid = new Grid(config.map.x, config.map.y); //We create the grid
        //separately because the nodes property of the map needs to reference it.
        
        var map = {
            'grid' : grid.grid,
            'nodes' : grid.createRoots(config, nodeTree)
        };
        return map;
                
    };
}();

function NodeTree() {

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
    //chance - the relative probability of a given node type being generated,
    //    relative to every other "chance" property, and also only relative to
    //    "sibling" node types. Example: a school is 30, a house is 90. A house
    //    is three times more likely to occur than a school.
    //adjacent - the type of node this node must be next to in order to initially
    //    spawn.
    //    May reference a node type or "!side".
    //    Note that if a node's size is greater than 1 and has an adjacent,
    //    once spawned it will be able to grow as much as it wants.
    //shape - one of the following possible shapes: "square", "line", "rectangle"
    //    Shapes will be the most important part of the algorithm, eventually.

    this.tree = []; //We keep our complete, exclusive heirarchy here
    this.branches = []; //Which references our recursive, unsorted node types
        
    this.buildBranch = function(node) {
    //This function finds a node type, looks to see if it has a prototype,
    //and calls the parents recursively to build a "branch"
        var parsedNode = require('./lib/nodes/' + node );
        
        var type = parsedNode.type;
        
        console.log("Creating new branch '" + type + "'.");
        
        if (parsedNode.hasOwnProperty("parentType")) {
            //If the parent is undefined, we need to build that branch,
            //from the top to the bottom. If that branch exists, we just glom on
            //automatically
            if (this.branches[parsedNode.parentType] == undefined) {
                this.buildBranch(parsedNode.parentType + ".json");
            }
            //Now that we have the parent, inherit all of the properties that
            //aren't overridden
            for (property in this.branches[parsedNode.parentType]) {
                if (property === "children"
                    || this.branches[parsedNode.parentType][property] === '!none'
                    ) continue;
                if (!parsedNode.hasOwnProperty(property)) {
                    parsedNode[property] = this.branches[parsedNode.parentType][property];
                }
            }
            this.branches[type] = parsedNode;
            if(!this.branches[parsedNode.parentType].hasOwnProperty("children")) {
                this.branches[parsedNode.parentType].children = {};
            }
            //Then assign this branch to the hash for quick reference
            this.branches[parsedNode.parentType].children[type] = this.branches[type];
            console.log("Built branch '" + this.branches[type].type + "' with parent '" + this.branches[parsedNode.parentType].type + "'.");
        } else {
            //Since this node has no parent, it belongs in the root of the tree,
            //which references the branch in the hash.
            this.branches[type] = parsedNode;
            this.tree[type] = this.branches[type];
            console.log("Built trunk with '" + this.tree[type].type + "'.");
        }

    }
    this.createNode = function(type) {
    //This function finds a node type, looks it up, and returns it.
        var parsedNode = this.branches[type];
        
        return parsedNode;
    }
}

function Grid(x, y) {
    this.grid = [];
    this.nodes = [];
    var max_x = x*2+1;
    var max_y = y*2+1;
    //Since JS (and, presumably, most languages) can't deal with negative
    //integers for its array keys, we need to double+1 the x and y coords
    //for use in our loops.
    
    for(var i = 0; i < max_x; i++) {
        this.grid[i] = [];
        for(var j = 0; j < max_y; j++) {
            this.grid[i][j] = {
                x : (i-x),
                y : (j-y)
                //Then when we assign the "real" coords, we can use the negative
                //values, calculated here.
            };
        }
    }
    
    this.createRoots = function(config, nodeTree) {
        //Roots are what I call the "basic" building blocks, mostly just another
        //variable of influence one can have when creating a new map. 
        var x = config.map.x
          , y = config.map.y
          , roots = config.map.roots
          , root_type = config.map.root_type;
        for(var i = 0; i < roots; i++) {
            var nodesRoot
              , nodesRoad
              , road = {}
              , new_coords = {};
            console.log('Generating root.');
            new_coords = this.generateCoords(x, y);
            nodesRoot = this.createNode(new_coords, "school", 0, nodeTree);
            roadCoords = this.findAdjacent(new_coords);
            if(roadCoords) {
                nodesRoad = this.createNode(roadCoords, "road", 0, nodeTree);
                this.expandNode(this.nodes[nodesRoad], nodesRoad, nodeTree);
            }
            this.expandNode(this.nodes[nodesRoot], nodesRoot, nodeTree);
            //TODO: expand the roots to meet their size property, and build roads
            //along them
        }
    }
    
    this.generateCoords = function(x, y) {
        //Generates random coordinates based off of a given max x and y pair.
        //Note that this will not return in a grid coordinate (with possible
        //negative numbers) but from origin 0,0 to maximum x, y. Should be
        //obvious, but I've messed this up too many times to not note.
        var possible_x = Math.floor(Math.random()*(x*2));
        var possible_y = Math.floor(Math.random()*(y*2));
        if(this.grid[possible_x][possible_y].node) {
            console.log('Coordinate location occupied, re-generating.');
            this.generateCoords(x, y);
        } else {
            console.log('Generated coordinate: ' + (possible_x-x).toString() + ',' + (possible_y-y).toString());
            coords = {
                x: (possible_x),
                y: (possible_y)
            };
        }
        
        return coords;
    }
    
    this.findAdjacent = function(coords) {
        //Finds if there is an empty space around a node in a random direction
        //Returns coordinates of the found adjacent, and the direction it is in
        //relative to the input coordinate, with 0 through 4, starting up and
        //going clockwise.
        var x = coords.x;
        var y = coords.y;
        var newCoords = {};
        var possibleDirections = [];
        var newDirection;
          
        newCoords.x = x+0;
        newCoords.y = y+0;
        
        for (var i = 0;i < 4;i++) {
            if (this.grid[x][y+1] && !this.grid[x][y+1].node) {
                possibleDirections.push({
                    x : x,
                    y : y+1,
                    direction: 0 //Up
                });
            }
            if (this.grid[x+1] && !this.grid[x+1][y].node) {
                possibleDirections.push({
                    x : x+1,
                    y : y,
                    direction: 1 //Right
                });
            }
            if (this.grid[x][y-1] && !this.grid[x][y-1].node) {
                possibleDirections.push({
                    x : x,
                    y : y-1,
                    direction: 2 //Down
                });
            }
            if (this.grid[x-1] && !this.grid[x-1][y].node) {
                possibleDirections.push({
                    x : x-1,
                    y : y,
                    direction: 3 //Left
                    });
            }
        }
        
        //All possible coordinates are in the array, so we just pick a random
        //array element, and those are our coordinates and direction.
        newCoords = possibleDirections[Math.floor(Math.random()*(possibleDirections.length))];
            
        if (newCoords.x == coords.x && newCoords.y == coords.y) {
            newCoords = false;
        } else {
            console.log("Found adjacent: " + newCoords.x + "," + newCoords.y);
        }
        return newCoords;
    }
    
    this.createNode = function(coords, nodeType, parent, nodeTree) {
        node = {
            coords: coords,
            grid_ref: this.grid[coords.x][coords.y],
            info: nodeTree.createNode(nodeType)
        }
        if (parent > 0) {
            node.root = parent;
        }
        nodeID = this.nodes.push(node) - 1;
        this.grid[coords.x][coords.y].node = this.nodes[nodeID];
        
        return nodeID;
    }
    
    this.expandNode = function(node, nodeID, nodeTree) {
    
        console.log("Finding shape for nodetype '" + node.info.type + "' to expand to " + node.info.size + " at " + node.coords.x + "," + node.coords.y + ".");
        
        var shape = require('./lib/shapes/' + node.info.shape + '.js')();
        var notCount = 0;
        var count = 0;
        var coord = {};

        while ((notCount < 2 && !node.info.hasOwnProperty("size")) || (node.info.hasOwnProperty("size") && count < node.info.size-1 && notCount < 4)) {
            //If a node's size is infinite, stop when two nodes in a row are off the
            //grid or collide with another node. Otherwise stop at four in a row.
            //TODO: add attribute to shapes to self-govern how many notCount to look
            //for, with 4 as the default.
            coord = shape(notCount);
            if (coord === false) {
                console.log("Returned 'Do Not Create'.");
                notCount++;
                continue;
            }
            coord.x = coord.x + node.coords.x;
            coord.y = coord.y + node.coords.y;
            
            if (!this.grid[coord.x] || !this.grid[coord.x][coord.y]) {
                console.log("Failing to exist at coordinate " + coord.x + "," + coord.y + ". notCount is " + (notCount + 1));
                notCount++;
                continue;
            } else if (this.grid[coord.x]
              && this.grid[coord.x][coord.y]
              && !this.grid[coord.x][coord.y].node) {
                console.log("Succeeding at coordinate " + coord.x + "," + coord.y + ". count is " + (count + 1));
                nodesRoad = this.createNode(coord, node.info.type, this.nodes[nodeID], nodeTree);
                notCount = 0;
                count++;
                continue;
            } else {
                console.log("Failing at coordinate " + coord.x + "," + coord.y + ". notCount is " + (notCount + 1));
                notCount++;
                continue;
            }
        }
        
    }
    
}