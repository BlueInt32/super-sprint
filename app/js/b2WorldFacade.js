"use strict";


var b2 = require('./utils/b2Helpers.js');
var b2LoaderMaker = require('./b2LoaderMaker.js');

var worldFacade = function(debugDrawActive) {

  var that = {}, b2Loader;

  that.b2World = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
  that.playerCar = null;
  that.otherCars = [];
  that.trackWalls = [];
  that.trackStartPositions = [];

  b2Loader = b2LoaderMaker(that);

  if (debugDrawActive) {
    b2.initDebugDraw(that.b2World);
  }

  that.addB2Element = function(specs) {
    b2Loader.addElement(specs);
  };

  return that;
};


module.exports = worldFacade;