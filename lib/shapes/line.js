//A shape function to generate straight-line node sequences.

module.exports = function() {
    this.state = 0; //Flips between flops every creation
    this.count = 1;
    this.failedState = 0;
    
    var direction = Math.floor(Math.random()*4);
    
    console.log("Line ready to be drawn.");
    
    return function(previousFailed) { //Lines stop in a specific direction when
    //that direction fails, designated by a "1" for previousFailed.
        var coord = {
            x : 0,
            y : 0
        };
        
        if (this.failedState != this.state) {
            switch (direction) {
                case 0:
                    coord.y = 1 * count;
                    break;
                case 1:
                    coord.x = 1 * count;
                    break;
                case 2:
                    coord.y = -1 * count;
                    break;
                case 3:
                    coord.x = -1 * count;
                    break;
            }
        }
        
        if (previousFailed === 1) {
            this.failedState = this.state;
        }
        
        count = (count+this.state) * -1;
        
        this.state++%2;
            
        return coord;
    }
}
    