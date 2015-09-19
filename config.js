exports.values = {

  seed: 'Fill it ALL with adjacency.',
  map: {
    x: 10, //Highest maximum value of X. The grid will go from 0 to x
    y: 10, //Same as above for y
    roots: ['R','I','C'] //Determines initial nodes created based on zone type; also makes initial roads
  },
  shapes: {
    'line' : require('./lib/shapes/line.js'),
    'random' : require('./lib/shapes/random.js'),
    'rectangle' : require('./lib/shapes/rectangle.js')
  }
};
