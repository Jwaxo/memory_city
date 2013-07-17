//A shape function to generate randomly-shaped node sequences.

module.exports = function() {

    this.coords = {};
    
    this.coords.hash = [0 = [0]];
    this.coords.grid = { 0 : { 0 : this.coords.hash[0] } };
    
    console.log("Random ready to be drawn.");
    
    return function(previousFailed) { //If the previous failed, we need to remove
    //it from the coordsArray.
    
        var coord = {
            x : 0,
            y : 0
        };
        var possibleDirections = [];
        var randomNode = this.coords.hash[Math.floor(Math.random()*this.coords.hash.length)];
    
        if (previousFailed === 1) {
        
            var failedCoord = this.coords.hash[this.coords.hash.length-1];
            if (this.coords.grid.hasOwnProperty(failedCoord.x)) {
                this.coords.grid[failedCoord.x].delete;
            }
            failedCoord.delete;
            
        }
        
        for (var i = 0;i < 4;i++) {
            if (!this.coords.grid[randomNode.x][randomNode.y+1]) {
                possibleDirections.push({
                    x : x,
                    y : y+1,
                    direction: 0 //Up
                });
            }
            if (!this.coords.grid[randomNode.x+1][randomNode.y]) {
                possibleDirections.push({
                    x : randomNode.x+1,
                    y : randomNode.y,
                    direction: 1 //Right
                });
            }
            if (!this.coords.grid[randomNode.x][randomNode.y-1]) {
                possibleDirections.push({
                    x : randomNode.x,
                    y : randomNode.y-1,
                    direction: 2 //Down
                });
            }
            if (this.coords.grid[randomNode.x-1][randomNode.y]) {
                possibleDirections.push({
                    x : randomNode.x-1,
                    y : randomNode.y,
                    direction: 3 //Left
                    });
            }
        }

        var direction = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
        
        switch (direction.direction) {
            case 0:
                coord.y = 1 * this.count;
                break;
            case 1:
                coord.x = 1 * this.count;
                break;
            case 2:
                coord.y = -1 * this.count;
                break;
            case 3:
                coord.x = -1 * this.count;
                break;
        }
        
        this.coords.hash.push(direction);
        if  (this.coords.grid[direction.x]) {
            this.coords.grid[direction.x].push(this.coords.grid[direction.y]);
        } else {
            this.coords.grid[direction.x] = (
                direction.y = this.coords.hash[this.coords.hash.length-1]
                );
        }
            
        return coord;
    }
}
    