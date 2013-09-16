//A shape function to generate randomly-shaped node sequences.

module.exports = function() {

    this.coords = {};
    
    this.coords.hash = [0];
    this.coords.grid = {
        0 : {
            0 : this.coords.hash[0]
        }
    };
    this.coords.failedGrid = {};
    
    console.log("Random ready to be drawn.");
    
    return function(previousFailed) { //If the previous failed, we need to remove
    //it from the coordsArray.
    
        var coord = {
            x : 0,
            y : 0
        };
        var possibleDirections = [];
        var randomNode = {};
        var direction = {};
        var hashdirection = {};
        
        //Here we remove the previous one from the grid and the hash, on failure.
        if (previousFailed === true) {
            console.log('Removing previous coords.');
            var failedCoord = {};
            failedCoord.x = parseInt(this.coords.hash[this.coords.hash.length-1].x);
            failedCoord.y = parseInt(this.coords.hash[this.coords.hash.length-1].y);
                
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
        
        //Growth comes from a random node in the grid.
        randomNode.x = parseInt(pickRandomProperty(this.coords.grid));
        randomNode.y = parseInt(pickRandomProperty(this.coords.grid[randomNode.x]));
        
        //Decide what directions are possible. Direction attribute is obsolete,
        //but I'm keeping it in because future shape functions may use it.
        if (!this.coords.grid[randomNode.x].hasOwnProperty(randomNode.y+1)
            && (!this.coords.failedGrid.hasOwnProperty(randomNode.x)
                || !this.coords.failedGrid[randomNode.x].hasOwnProperty(randomNode.y)
                )
            ) {
            possibleDirections.push({
                x : randomNode.x,
                y : randomNode.y+1,
                direction: 0 //Up
            });
        }
        if (!this.coords.grid.hasOwnProperty(randomNode.x+1)
            || !this.coords.grid[randomNode.x+1].hasOwnProperty(randomNode.y)
            && (!this.coords.failedGrid.hasOwnProperty(randomNode.x+1)
                || !this.coords.failedGrid[randomNode.x+1].hasOwnProperty(randomNode.y)
                )
            ) {
            possibleDirections.push({
                x : randomNode.x+1,
                y : randomNode.y,
                direction: 1 //Right
            });
        } 
        if (!this.coords.grid[randomNode.x].hasOwnProperty(randomNode.y-1)
            && (!this.coords.failedGrid.hasOwnProperty(randomNode.x)
                || !this.coords.failedGrid[randomNode.x].hasOwnProperty(randomNode.y-1)
                )
            ) {
            possibleDirections.push({
                x : randomNode.x,
                y : randomNode.y-1,
                direction: 2 //Down
            });
        }
        if (!this.coords.grid.hasOwnProperty(randomNode.x-1)
          || this.coords.grid[randomNode.x-1].hasOwnProperty(randomNode.y)) {
            possibleDirections.push({
                x : randomNode.x-1,
                y : randomNode.y,
                direction: 3 //Left
            });
        }
        
        if (possibleDirections.length > 0) {

            direction = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
            if (direction.hasOwnProperty('x') && direction.hasOwnProperty('y')
                && (!this.coords.failedGrid.hasOwnProperty(randomNode.x-1)
                    || !this.coords.failedGrid[randomNode.x-1].hasOwnProperty(randomNode.y)
                    )
                ) {
                if (!this.coords.grid[direction.x]) {
                    this.coords.grid[direction.x] = {};
                }
                hashdirection.x = direction.x.valueOf();
                hashdirection.y = direction.y.valueOf();
                this.coords.hash.push(hashdirection);
                this.coords.grid[direction.x][direction.y] = hashdirection;
                console.log('Added coordinate '+ this.coords.grid[direction.x][direction.y].x +','+this.coords.grid[direction.x][direction.y].y);
                
            } else {
                direction = false;
            }
        } else {
            direction = false;
        }
            
        return direction;
    }
    
    //Simple function grabbed from StackOverflow; possibly will add to shape prototype.
    //TODO: make shape prototype.
    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
               result = prop;
        return result;
    }
}
    