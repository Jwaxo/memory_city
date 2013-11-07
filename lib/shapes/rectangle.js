//A shape function to generate boxy shapes.

module.exports = function(width) {

    //Pull in the default shape functions
    var default_functions = require('./grid_functions.js');
    for (var func in default_functions) {
        this[func] = default_functions[func];
    }

    //The following are pulled in from grid_functions:
    
    //this.coords = {};
    
    //this.coords.hash = [0];
    //this.coords.grid = {
    //    0 : {
    //        0 : this.coords.hash[0]
    //    }
    //};
    //this.coords.failedGrid = {};
    //this.processFailedCoord(); //removes the most recent coord from the hash
    //this.findAvailableAdjacents(coord); //returns array of open coordinates
    
    this.direction = Math.floor(Math.random()*4); //TODO: add shape prototype
    //that includes function for randomly choosing an open adjacent.
    
    return function(previousFailed) { //Lines stop in a specific direction when
    //that direction fails, designated by a "1" for previousFailed.
        
        var coord = {
            x : 0,
            y : 0
        };
            
        return coord;
    }
}