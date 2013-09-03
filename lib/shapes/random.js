//A shape function to generate randomly-shaped node sequences.

module.exports = function() {

    this.coords = {};
    
    this.coords.hash = [0];
	this.coords.hash[0] = [0];
    this.coords.grid = { 0 : { 0 : this.coords.hash[0] } };
    
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
        
        randomNode.x = Math.floor(Math.random()*this.coords.hash.length);
        randomNode.y = Math.floor(Math.random()*this.coords.hash[randomNode.x].length);
        
        console.log('Random growth from ('+randomNode.x+','+randomNode.y+')');
        if (previousFailed === 1) {
        
            var failedCoord = this.coords.hash[this.coords.hash.length-1];
            if (this.coords.grid.hasOwnProperty(failedCoord.x)) {
                this.coords.grid[failedCoord.x].delete;
            }
            failedCoord.delete;
            
        }
        
        if (this.coords.grid[randomNode.x] && !this.coords.grid[randomNode.x][randomNode.y+1]) {
            possibleDirections.push({
                x : randomNode.x,
                y : randomNode.y+1,
                direction: 0 //Up
            });
        }
        if (this.coords.grid[randomNode.x+1] && !this.coords.grid[randomNode.x+1][randomNode.y]) {
            possibleDirections.push({
                x : randomNode.x+1,
                y : randomNode.y,
                direction: 1 //Right
            });
        } 
        if (this.coords.grid[randomNode.x] && !this.coords.grid[randomNode.x][randomNode.y-1]) {
            possibleDirections.push({
                x : randomNode.x,
                y : randomNode.y-1,
                direction: 2 //Down
            });
        }
        if (this.coords.grid[randomNode.x-1] && this.coords.grid[randomNode.x-1][randomNode.y]) {
            possibleDirections.push({
                x : randomNode.x-1,
                y : randomNode.y,
                direction: 3 //Left
            });
        }
        
        console.log('Picking from directions "' + possibleDirections + '".');

        direction = possibleDirections[Math.floor(Math.random()*possibleDirections.length)];
        

        if (!this.coords.grid[direction.x]) {
            this.coords.hash.push(direction.x);
            this.coords.grid[direction.x] = [];
        }
        if (!this.coords.hash[direction.x][direction.y]) this.coords.hash[direction.x].push(direction.y);
        
        this.coords.grid[direction.x][direction.y] = this.coords.hash[this.coords.hash.length-1];
        console.log('Newish coords hash is '+this.coords.hash);
        
        console.log('Returning coords '+direction.x+','+direction.y);
            
        return direction;
    }
}
    