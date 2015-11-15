"use strict";


var b2 = require('./utils/b2Helpers.js');

var worldFacade = function(debugDrawActive) {

  var b2World = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
  if (debugDrawActive) {
    b2.initDebugDraw(b2World);
  }


  that.playerCar = null;
  that.otherCars = [];

  that.trackWalls = [];
  that.trackStartPositions = [];


  return that;
};


module.exports = worldFacade;