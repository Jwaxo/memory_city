//A shape function to generate straight-line node sequences.

module.exports = function() {

    //Pull in the default shape functions
    //I am not sure if we use any of them for line.js, but we might in the future
    var default_functions = require('./grid_functions.js');
    for (var func in default_functions) {
        this[func] = default_functions[func];
    }

    this.state = 0; //Flips between flops every creation
    this.flopcount = 1;
    this.count = 0;
    this.failedcount = 0;
    this.failedState = false;
    
    this.direction = Math.floor(Math.random()*4); //TODO: add shape prototype
    //that includes function for randomly choosing an open adjacent.
    
    return function(previousFailed) { //Lines stop in a specific direction when
    //that direction fails, designated by a "1" for previousFailed.
        if (previousFailed === true) {
            this.failedcount++;
            if (this.count == 1 && this.failedcount == 2) {
                //We've failed twice and only have the initial node down, so we
                //should try expanding perpendicular to where we currently are
                //in order to fit.
                this.failedState = false;
                this.failedcount = 0;
                this.state = 0;
                this.flopcount = 1;
                this.direction = (this.direction + 1)%4;
            } else if (this.failedcount >= 2) {
                this.failedState = this.state;
            } else {
                this.failedState = (this.state + 1)%2;
            }
        } else {
            this.count++;
        }
        
        var coord = {
            x : 0,
            y : 0
        };
        
        if (this.failedState !== this.state) {
            switch (this.direction) {
                case 0:
                    coord.y = 1 * this.flopcount;
                    break;
                case 1:
                    coord.x = 1 * this.flopcount;
                    break;
                case 2:
                    coord.y = -1 * this.flopcount;
                    break;
                case 3:
                    coord.x = -1 * this.flopcount;
                    break;
            }
        } else {
            coord = false; //The only allowed "fail" creation.
        }
        
        this.direction = (this.direction + 2)%4;
        
        this.flopcount = this.flopcount + this.state * 1;
        
        this.state = (this.state + 1)%2;
            
        return coord;
    }
}
    