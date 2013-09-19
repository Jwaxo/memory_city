//A shape function to generate straight-line node sequences.

module.exports = function() {
    this.state = 0; //Flips between flops every creation
    this.count = 1;
    this.failedState = false;
    
    this.direction = Math.floor(Math.random()*4); //TODO: add shape prototype
    //that includes function for randomly choosing an open adjacent.
    
    console.log("Line ready to be drawn.");
    
    return function(previousFailed) { //Lines stop in a specific direction when
    //that direction fails, designated by a "1" for previousFailed.
        if (previousFailed === true) {
            this.failedState = (this.state + 1)%2;
            console.log("failedState logged as " + this.failedState);
        }
        var coord = {
            x : 0,
            y : 0
        };
        
        if (this.failedState !== this.state) {
            switch (this.direction) {
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
        } else {
            coord = false; //The only allowed "fail" creation.
        }
        
        this.direction = (this.direction + 2)%4;
        
        if (this.state === 1) {
            this.count++;
        }
        
        this.state = (this.state + 1)%2;
            
        return coord;
    }
}
    