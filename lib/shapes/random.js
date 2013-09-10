//A shape function to generate randomly-shaped node sequences.

module.exports = function() {

    this.coords = {};
    
    this.coords.hash = [0];
    this.coords.grid = {
        0 : {
            0 : this.coords.hash[0]
        }
    };
    
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
        
        //Growth comes from a random node in the grid.
        randomNode.x = parseInt(pickRandomProperty(this.coords.grid));
        randomNode.y = parseInt(pickRandomProperty(this.coords.grid[randomNode.x]));
        
        //Here we remove the previous one from the grid and the hash, on failure.
        if (previousFailed > 0) {
            console.log('Removing previous coords.');
            var failedCoord = {};
            failedCoord.x = parseInt(this.coords.hash[this.coords.hash.length-1].x);
            failedCoord.y = parseInt(this.coords.hash[this.coords.hash.length-1].y);
                
            if (this.coords.grid.hasOwnProperty(failedCoord.x)) {
                console.log('Offending coord ' + failedCoord.x + ' found.');
            }
            if (this.coords.grid.hasOwnProperty(failedCoord.x)
              && this.coords.grid[failedCoord.x].hasOwnProperty(failedCoord.y)) {
                this.coords.grid[failedCoord.x][failedCoord.y].delete;
            }
            this.coords.hash.splice(this.coords.hash.length-1, 1);
            
        }
        
        //Decide what directions are possible. Direction attribute is obsolete,
        //but I'm keeping it in because future shape functions may use it.
        if (!this.coords.grid[randomNode.x].hasOwnProperty(randomNode.y+1)) {
            possibleDirections.push({
                x : randomNode.x,
                y : randomNode.y+1,
                direction: 0 //Up
            });
        }
        if (!this.coords.grid.hasOwnProperty(randomNode.x+1)
          || !this.coords.grid[randomNode.x+1].hasOwnProperty(randomNode.y)) {
            possibleDirections.push({
                x : randomNode.x+1,
                y : randomNode.y,
                direction: 1 //Right
            });
        } 
        if (!this.coords.grid[randomNode.x].hasOwnProperty(randomNode.y-1)) {
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

        direction = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
        if (direction.hasOwnProperty('x') && direction.hasOwnProperty('y')) {
            if (!this.coords.grid[direction.x]) {
                this.coords.grid[direction.x] = {};
            }
            this.coords.hash.push(direction);
            this.coords.grid[direction.x][direction.y] = direction;
            
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
    