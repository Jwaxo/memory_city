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
    var failedCoord = parseInt(this.coords.hash[this.coords.hash.length-1]);
    var failedCoordsArray = [];
    
    //If the failed coordinates are grouped because we added a bunch at once,
    //we'll loop through them, but otherwise we'll need to just put them into
    //a single-dimension array to make sure they loop correctly
    if (Object.prototype.toString.call(failedCoord) === '[object Array]') {
        failedCoordsArray = failedCoord;
    } else {
        failedCoordsArray.push(failedCoord);
    }
    
    //Now remove the failed coordinate(s)
    for (var i=0;i<failedCoordsArray.length;i++) {
        if (this.coords.grid.hasOwnProperty(failedCoordsArray[i].x)
          && this.coords.grid[failedCoordsArray[i].x].hasOwnProperty(failedCoordsArray[i].y)
          && (failedCoordsArray[i].x != 0 || (failedCoordsArray[i].x == 0 && failedCoordsArray[i].y != 0))) {
            //We need to keep 0,0 so that we always have a starting point
            if (!this.coords.failedGrid.hasOwnProperty(failedCoordsArray[i].x)) {
                this.coords.failedGrid[failedCoordsArray[i].x] = {};
            }
            this.coords.failedGrid[failedCoordsArray[i].x][failedCoordsArray[i].y] = true;
            delete this.coords.grid[failedCoordsArray[i].x][failedCoordsArray[i].y];
            if (Object.keys(this.coords.grid[failedCoordsArray[i].x]).length == 0 && failedCoordsArray[i].x != 0) {
                delete this.coords.grid[failedCoordsArray[i].x];
            }
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

//Expands in a rectangular direction. Rectangles are drawn with the origin point
//from the corner. So 0 is actually up-right, 1 is right-down, 2 is down-left,
//and 3 is left-up.
module.exports.rectangleExpand = function(direction, count, width) {
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
