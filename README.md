memory_city by @Jwaxo and @ChuckyB88

An attempt at a procedural memory game using node.js

## History

2013.05.20 - Repo created

## Abstract

You know those memory games you played in elementary school, where the teacher would put a bunch of objects on the overhead projector, let you look for fifteen seconds, then take them all away and ask you to remember details about them? That's the general idea here, only randomly generated by node.js using the idea of a procedurally-generated city to test your recall. It's also our first project of any sort in node.

## Major Notes

Prior to running, be sure to run "git submodules update --init" so that seedrandom and any other submodules that aren't on npm get installed properly.

## Elements

These are the various elements that will come into play. These aren't necessarily a full list, just a spitball of things we've discussed. Probably not the best place for them in the Readme, but I want you to get an idea.

* Buildings
    + Various sizes
    + Various colors?
* Streets
    + Names
    + Lengths
    + Topography
    + Items found in streets
        - Cars
        - Sign posts
        - Trashcans
        - Other Things
* Topography
* Questions

### Testing

As with ThreeGrid, this module is currently setup to be tested with beefy via browserify.

The last time I got it working (which changes as the module is worked on), I did it with the following steps:

1) Install browserify: `npm install browserify`
2) Install browserify-fs: `npm install browserify-fs`
3) Install beefy: `npm install -g beefy`
4) Run the test: `beefy test.js`
5) Go to the configured beefy page, normally `127.0.0.1:9966`
