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
        
        randomNode.x = parseInt(pickRandomProperty(this.coords.grid));
        randomNode.y = parseInt(pickRandomProperty(this.coords.grid[randomNode.x]));
        console.log('Random growth from ('+randomNode.x+','+randomNode.y+')');
        if (previousFailed > 0) {
            console.log('Removing previous coords.');
            var failedCoord = this.coords.hash[this.coords.hash.length-1];
            if (this.coords.grid.hasOwnProperty(failedCoord.x) && this.coords.grid[failedCoord.x].hasOwnProperty(failedCoord.y)) {
                this.coords.grid[failedCoord.x][failedCoord.y].delete;
            }
            this.coords.hash.splice(this.coords.hash.length-1, 1);
            
        }
        
        if (!this.coords.grid[randomNode.x].hasOwnProperty(randomNode.y+1)) {
            possibleDirections.push({
                x : randomNode.x,
                y : randomNode.y+1,
                direction: 0 //Up
            });
        }
        if (!this.coords.grid.hasOwnProperty(randomNode.x+1) || !this.coords.grid[randomNode.x+1].hasOwnProperty(randomNode.y)) {
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
        if (!this.coords.grid.hasOwnProperty(randomNode.x-1) || this.coords.grid[randomNode.x-1].hasOwnProperty(randomNode.y)) {
            possibleDirections.push({
                x : randomNode.x-1,
                y : randomNode.y,
                direction: 3 //Left
            });
        }

        direction = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
        console.log('Newish coords hash at x is '+this.coords.grid[0]+' with randomNode.y as '+direction.y+' and x as '+direction.x);
        if (direction.hasOwnProperty('x') && direction.hasOwnProperty('y')) {
            if (!this.coords.grid[direction.x]) {
                this.coords.grid[direction.x] = {};
            }
            this.coords.hash.push(direction);
            this.coords.grid[direction.x][direction.y] = direction;
            
            console.log('Newish coords hash is '+this.coords.hash);
            
            console.log('Returning coords '+direction.x+','+direction.y);
        } else {
            direction = false;
        }
            
        return direction;
    }
    
    function pickRandomProperty(obj) {
        var result;
        var count = 0;
        for (var prop in obj)
            if (Math.random() < 1/++count)
               result = prop;
        return result;
    }
}
    