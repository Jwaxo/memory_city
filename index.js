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
    //    If there is no chance property, a default of "10" is used.
    //adjacent - the type of node this node must be next to in order to initially
    //    spawn.
    //    May reference a node type or "!side".
    //    WARNING: if a parentType has an adjacent requirement, all children will
    //    implicitly have this requirement, even if they add additional adjacents
    //    Note that if a node's size is greater than 1 and has an adjacent,
    //    once spawned it will be able to grow as much as it wants.
    //shape - one of the following possible shapes: "square", "line", "rectangle"
    //    Shapes will be the most important part of the algorithm, eventually.
    //root - a referenced node that they were expanded from.

    this.tree = {}; //We keep our complete, exclusive heirarchy here
    this.branches = {}; //Which references our recursive, unsorted node types
        
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
    this.walkTypes = function(branch) {
    //This function walks through the given branch of the NodeTree, constructs
    //an array consisting of children's chance property, randomly picks one,
    //and runs itself on that branch. When it finds no children, it returns.
    
        var currBranch = {};
        var chanceArray = [];
        var returnType = {};
    
        //The "parent" branch treats its children, the basic branches, a bit
        //differently than most branches do, so we have to start with a tiny
        //bit of trickery.
        if (this.tree == branch) {
            console.log('Branch is tree trunk, creating children out of all root branches.');
            currBranch.children = this.tree;
        } else {
            console.log('Branch is actual branch.');
            currBranch = branch;
        }
         
        //Now we build an array with slots in it to correspond to the chance
        //given to a nodeType.
        if (currBranch.hasOwnProperty("children")) {
            for (childBranch in currBranch.children) {

                if (currBranch.children[childBranch].hasOwnProperty("chance")) {
                    for (var i=0; i < currBranch.children[childBranch].chance; i++) {
                        chanceArray.push(childBranch);
                    }
                } else {
                    for (var i=0; i < 10; i++) {
                        chanceArray.push(childBranch);
                    }
                }
            }
            //...and then we pick from that array, and walk if it is found.
            if (chanceArray.length > 0) {
                findType = chanceArray[Math.floor(Math.random()*(chanceArray.length))];
                if (this.branches[findType]) {
                    console.log('childType ' + findType + ' picked, walking.');
                    returnType = this.walkTypes(this.branches[findType]);
                } else {
                    console.log('returnType in walkTypes not found for ' + findType);
                }
            } else {
                console.log('No possible chance for nodeType children of ' + branch.type);
                returnType = branch;
            }
        } else {
            console.log('No possible children for nodeType ' + branch.type);
            findType = branch;
        }
        return findType;
    }
}

function Grid(x, y) {
    this.grid = []; // Tracks coordinates by notation "this.grid[x][y]"
    this.nodes = []; // A hash of all nodes, arranged by nodeID (I believe)
    this.grid_unused = []; // A list to track which grid points are used;
                           //necessary because its indexes are tracked by grids
                           //for quick removal
    this.grid_unused_hash = []; // A hash of the unused grid that gets regenerated for quick grabbing.
    this.grid_x = x;
    this.grid_y = y;
    var max_x = this.grid_x;
    var max_y = this.grid_y;
    
    this.dontagain = 0;
    //Since JS (and, presumably, most languages) can't deal with negative
    //integers for its array keys, we need to double+1 the x and y coords
    //for use in our loops.
    
    for(var i = 0; i < max_x; i++) {
        this.grid[i] = [];
        for(var j = 0; j < max_y; j++) {
            this.grid[i][j] = {
                x : i,
                y : j
            };
            this.grid[i][j].unused_index = this.grid_unused.push(this.grid[i][j]) - 1;
        }
    }
    
    this.regenerateUnused = function() {
        //We do this every time we modify grid_unused for quick counting or
        //for grabbing of unused points. It can't exist alone because grid points
        //need to know which indexes to remove when they get occupied.

        this.grid_unused_hash = [];
        for(var i=0;i<this.grid_unused.length;i++) {
            if(this.grid_unused[i]) {
                this.grid_unused_hash.push(this.grid_unused[i]);
            }
        }
        console.log('Unused hash regenerated, unused point count is ' + this.grid_unused_hash.length);
    }
    
    this.createRoots = function(config, nodeTree) {
        //Roots are what I call the "basic" building blocks, mostly just another
        //variable of influence one can have when creating a new map. 
         var roots = config.map.roots
          , root_type = config.map.root_type;
        for(var i = 0; i < roots; i++) {
            var nodesRoot
              , nodesRoad
              , road = {}
              , new_coords = {};
            console.log('Generating root.');
            new_coords = this.generateCoords();
            nodesRoot = this.createNode(new_coords, "school", null, nodeTree);
            roadCoords = this.findAdjacent(new_coords);
            if(roadCoords) {
                nodesRoad = this.createNode(roadCoords, "road", null, nodeTree);
                this.expandNode(this.nodes[nodesRoad], nodesRoad, nodeTree);
            }
            this.expandNode(this.nodes[nodesRoot], nodesRoot, nodeTree);
            //TODO: expand the roots to meet their size property, and build roads
            //along them
        }
        this.fillEmptyTiles(nodeTree);
        
        return this.nodes;
    }
    
    this.fillEmptyTiles = function(nodeTree) {
        //This function recursively calls itself until there are no more
        //empty grid points
        var new_point = this.generateCoords();
        var new_type = nodeTree.walkTypes(nodeTree.tree); //TODO: check for adjacents
        var new_node = this.createNode(new_point, new_type.type, 0, nodeTree);
        
        this.expandNode(this.nodes[new_node], new_node, nodeTree);
        
        if (this.grid_unused_hash.length > 0) {
            this.fillEmptyTiles(nodeTree);
        } else {
            console.log('unused is ' + this.grid_unused_hash);
        }
        
    }
    
    this.generateCoords = function() {
        //Generates random coordinates based off of a given max x and y pair.
        //Note that this will not return in a grid coordinate (with possible
        //negative numbers) but from origin 0,0 to maximum x, y. Should be
        //obvious, but I've messed this up too many times to not note.
        var possible_grid_point = {};
        
        this.regenerateUnused();
        
        //Since we delete points from the hash when grid points are taken up,
        //the array ends up all funky, and we have to regenerate it quickly
        //before picking an unused point.
        
        possible_grid_point = this.grid_unused_hash[Math.floor(Math.random()*(this.grid_unused_hash.length-1))];
        
        console.log('Generated coordinate: ' + (possible_grid_point.x).toString() + ',' + (possible_grid_point.y).toString());
        coords = {
            x: possible_grid_point.x,
            y: possible_grid_point.y
        };
        
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
        } 
        return newCoords;
    }
    
    this.createNode = function(coords, nodeType, parentID, nodeTree) {
        console.log('Creating new node of type ' + nodeType + ' at coords ' + coords.x + ',' + coords.y);
        var node = {
            coords: coords,
            grid_ref: this.grid[coords.x][coords.y],
            info: nodeTree.createNode(nodeType)
        }
        node.nodeID = this.nodes.push(node) - 1;
        
        if (parentID != null) {
            node.root = this.nodes[parentID];
            node.parentID = parentID;
        }
        this.grid[coords.x][coords.y].node = this.nodes[node.nodeID];
        console.log('Removing ' + coords.x + ',' + coords.y + ' from hash with index ' + this.grid[coords.x][coords.y].unused_index);
        console.log('Currently, ' + this.grid_unused[this.grid[coords.x][coords.y].unused_index].x + ',' + this.grid_unused[this.grid[coords.x][coords.y].unused_index].y + ' exists at index ' + this.grid[coords.x][coords.y].unused_index);
        delete this.grid_unused[this.grid[coords.x][coords.y].unused_index];
        this.regenerateUnused();
        
        return node.nodeID;
    }
    
    this.expandNode = function(node, nodeID, nodeTree) {
        //This function reads from the nodeTree to find out how to make a node
        //"grow" according to its node rules, outlined in the .json file, and
        //according to the shape file, specified by the "shape" parameter.
    
        console.log("Finding shape for nodetype '" + node.info.type + "' to expand to " + node.info.size + " at " + node.coords.x + "," + node.coords.y + ".");
        
        var shape = {};
        var notCount = 0;
        var lastFailed = false;
        var count = 0;
        var coord = {};
        var size = 0;
        var sizeList = []; //These latter two are for nodes with multiple possible sizes
        var sizeOptions = [];
        
        
        if (node.info.hasOwnProperty('shape') {
            shape = require('./lib/shapes/' + node.info.shape + '.js')();
        } else { // If no shape is assigned to that nodeType, just use random
            shape = require('./lib/shapes/random.js')(); 
        }
            
        
        if (node.info.hasOwnProperty("size")) {
            if (node.info.size.indexOf('-') !== -1) {
                sizeList = node.info.size.split('-'); //If there's a size range...
                for (var i=sizeList[0];i<=sizeList[1];i++) {
                    sizeOptions.push(i);
                }
                size = sizeOptions[Math.floor(Math.random()*(sizeOptions.length))];
            } else if (node.info.size.indexOf(',') !== -1) {
                sizeList = node.info.size.split(','); //If there's a size list...
                for (var i=sizeList[0];i<=sizeList[1];i++) {
                    sizeOptions.push(i);
                }
                size = sizeOptions[Math.floor(Math.random()*(sizeOptions.length))];
            } else {
                size = node.info.size; //If the size is just stated
            }
        } else { //If size isn't set, only make a single node
            size = 1;
        }

        while ((notCount < 2 && size == 0) || (size > 0 && count < size-1 && notCount < 4)) {
            //If a node's size is infinite, stop when two nodes in a row are off the
            //grid or collide with another node. Otherwise stop at four in a row.
            //TODO: add attribute to shapes to self-govern how many notCount to look
            //for, with 4 as the default.
            coord = shape(lastFailed);
            if (coord === false) {
                notCount++;
                lastFailed = false; //We can't let this be true since "false" indicates it was not added to the success list.
                continue;
            }
            coord.x = coord.x + node.coords.x;
            coord.y = coord.y + node.coords.y;
            
            if (!this.grid[coord.x] || !this.grid[coord.x][coord.y]) {
                notCount++;
                lastFailed = true;
                continue;
            } else if (this.grid[coord.x]
              && this.grid[coord.x][coord.y]
              && !this.grid[coord.x][coord.y].node) {
                nodesRoad = this.createNode(coord, node.info.type, nodeID, nodeTree);
                notCount = 0;
                count++;
                lastFailed = false;
                continue;
            } else {
                notCount++;
                lastFailed = true;
                continue;
            }
        }
        
    }
    
}