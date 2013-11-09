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
    
    this.direction = Math.floor(Math.random()*4); //For rectangles, our shape is
    //drawn with the origin point from the corner. So 0 is actually up-right, 1
    //is right-down, 2 is down-left, and 3 is left-up.
    
    return function(previousFailed) { //Lines stop in a specific direction when
    //that direction fails, designated by a "1" for previousFailed.
        
        var count = 0;
        this.stepCoords = [];
        
        //Here we remove the previous one from the grid and the hash, on failure.
        if (previousFailed === true) {
            this.processFailedCoord();
        }
        
        for (var i=0;i<width;i++) {
            coord = rectangleExpand(direction, count, i);
            stepCoords.push(coord);
            if (!this.coords.grid.hasOwnProperty(coord.x)) {
                this.coords.grid[coord.x] = {};
            }
            this.coords.grid[coord.x][coord.y] = coord;
        }
        
        this.coords.hash.push(stepCoords);
        
        count++;
            
        return stepCoords;
    }
    this.rectangleExpand = function(direction, count, width) {
        var coord = {
            x : 0,
            y : 0
        };
        switch (this.direction) {
            case 0:
                coord.y = 1 * count;
                coord.x = this.count * width;
                break;
            case 1:
                coord.x = 1 * count;
                coord.y = this.count * width * -1;
                break;
            case 2:
                coord.y = -1 * count;
                coord.x = this.count * width * -1;
                break;
            case 3:
                coord.x = -1 * count;
                coord.y = this.count * width;
                break;
        }

        return coord;
    }
}