//A shape function to generate randomly-shaped node sequences.

module.exports = function() {

    //First we have to get the default shape functions from our prototype
    //There has to be a better way to do this, but this works and is efficient.
    var default_functions = require('./grid_functions.js');
    for (var func in default_functions) {
        this[func] = default_functions[func];
    }

    //The following are pulled in from grid_functions:
    /*
    this.coords = {};
    
    this.coords.hash = [0];
    this.coords.grid = {
        0 : {
            0 : this.coords.hash[0]
        }
    };
    this.coords.failedGrid = {};
    */
    //this.processFailedCoord(); //removes the most recent coord from the hash
    //this.findAvailableAdjacents(coord); //returns array of open coordinates
    
    return function(previousFailed) { //If the previous failed, we need to remove
    //it from the coordsArray.
        var coord = {
            x : 0,
            y : 0
        };
        var stepCoords = [];
        
        var possibleDirections = [];
        var randomNode = {};
        var direction = {};
        var hashdirection = {};
        
        //Here we remove the previous one from the grid and the hash, on failure.
        if (previousFailed === true) {
            this.processFailedCoord();
        }
        
        //Growth comes from a random node in the grid.
        randomNode.x = parseInt(this.pickRandomProperty(this.coords.grid));
        randomNode.y = parseInt(this.pickRandomProperty(this.coords.grid[randomNode.x]));
        
        //Decide what directions are possible. Direction attribute is obsolete,
        //but I'm keeping it in because future shape functions may use it.
        possibleDirections = this.findAvailableAdjacents(randomNode);
        
        if (possibleDirections.length > 0) {
            direction = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
            if (direction.hasOwnProperty('x') && direction.hasOwnProperty('y')
                && (!this.coords.failedGrid.hasOwnProperty(direction.x)
                    || !this.coords.failedGrid[direction.x].hasOwnProperty(direction.y)
                    )
                ) {
                if (!this.coords.grid[direction.x]) {
                    this.coords.grid[direction.x] = {};
                }
                stepCoords.push(direction);
                hashdirection.x = direction.x.valueOf();
                hashdirection.y = direction.y.valueOf();
                this.coords.hash.push(hashdirection);
                this.coords.grid[direction.x][direction.y] = hashdirection;
                
            } else {
                stepCoords = false;
            }
        } else {
            //No possible directions to expand in.
            stepCoords = false;
        }
        return stepCoords;
    }
   
}
    