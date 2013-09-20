//A NON-SHAPE, HELPER FUNCTION. This provides several default functions used
//across all/most shapes

module.exports.processFailedCoord = function() {
    var failedCoord = {};
    failedCoord.x = parseInt(this.coords.hash[this.coords.hash.length-1].x);
    failedCoord.y = parseInt(this.coords.hash[this.coords.hash.length-1].y);
    console.log('Removing previous coords '+failedCoord.x+','+failedCoord.y);                
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