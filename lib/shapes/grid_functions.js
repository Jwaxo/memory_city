//A NON-SHAPE, HELPER FUNCTION. This provides several default functions used
//across all/most shapes

module.exports.coords = {};

module.exports.coords.hash = [0];
module.exports.coords.grid = {
    0 : {
        0 : module.exports.coords.hash[0]
    }
};
module.exports.coords.failedGrid = {};

module.exports.processFailedCoord = function() {
//This function removes failed coordinates from a coordinate hash
    var failedCoord = {};
    failedCoord.x = parseInt(this.coords.hash[this.coords.hash.length-1].x);
    failedCoord.y = parseInt(this.coords.hash[this.coords.hash.length-1].y);
    //Now remove the failed coordinate.               
    if (this.coords.grid.hasOwnProperty(failedCoord.x)
      && this.coords.grid[failedCoord.x].hasOwnProperty(failedCoord.y)
      && (failedCoord.x != 0 || (failedCoord.x == 0 && failedCoord.y != 0))) {
        //We need to keep 0,0 so that we always have a starting point
        if (!this.coords.failedGrid.hasOwnProperty(failedCoord.x)) {
            this.coords.failedGrid[failedCoord.x] = {};
        }
        this.coords.failedGrid[failedCoord.x][failedCoord.y] = true;
        delete this.coords.grid[failedCoord.x][failedCoord.y];
        if (Object.keys(this.coords.grid[failedCoord.x]).length == 0 && failedCoord.x != 0) {
            delete this.coords.grid[failedCoord.x];
        }
    }
    this.coords.hash.splice(this.coords.hash.length-1, 1);
}

module.exports.findAvailableAdjacents = function(coord) {
//This function figures out if a given coordinate has coordinates not taken by
//this shape
    var possibleDirections = [];

    if (!this.coords.grid[coord.x].hasOwnProperty(coord.y+1)
        && (!this.coords.failedGrid.hasOwnProperty(coord.x)
            || !this.coords.failedGrid[coord.x].hasOwnProperty(coord.y+1)
            )
        ) {
        possibleDirections.push({
            x : coord.x,
            y : coord.y+1,
            direction: 0 //Up
        });
    }
    if (!this.coords.grid.hasOwnProperty(coord.x+1)
        || !this.coords.grid[coord.x+1].hasOwnProperty(coord.y)
        && (!this.coords.failedGrid.hasOwnProperty(coord.x+1)
            || !this.coords.failedGrid[coord.x+1].hasOwnProperty(coord.y)
            )
        ) {
        possibleDirections.push({
            x : coord.x+1,
            y : coord.y,
            direction: 1 //Right
        });
    }
    if (!this.coords.grid[coord.x].hasOwnProperty(coord.y-1)
        && (!this.coords.failedGrid.hasOwnProperty(coord.x)
            || !this.coords.failedGrid[coord.x].hasOwnProperty(coord.y-1)
            )
        ) {
        possibleDirections.push({
            x : coord.x,
            y : coord.y-1,
            direction: 2 //Down
        });
    }
    if (!this.coords.grid.hasOwnProperty(coord.x-1)
        || !this.coords.grid[coord.x-1].hasOwnProperty(coord.y)
        && (!this.coords.failedGrid.hasOwnProperty(coord.x-1)
            || !this.coords.failedGrid[coord.x-1].hasOwnProperty(coord.y)
            )
        ) {
        possibleDirections.push({
            x : coord.x-1,
            y : coord.y,
            direction: 3 //Left
        });
    }
    return possibleDirections;
}

    //Simple function grabbed from StackOverflow; possibly will add to shape prototype.
    //TODO: make shape prototype.
 module.exports.pickRandomProperty = function(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
           result = prop;
    return result;
}
