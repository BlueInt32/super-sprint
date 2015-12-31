"use strict";

var B2Helper = require('./utils/B2Helper.js');
var B2Loader = require('./B2Loader.js');
var playerCommand = require('./PlayerCommand.js');
var dat = require('dat-gui');
var ContactManager = require('./ContactManager.js');


var B2WorldFacade = function(debugDrawActive) {
  this.b2World = new B2Helper.dyn.b2World(new B2Helper.cMath.b2Vec2(0, 0), true);
  this.playerCar = null;
  this.otherCars = [];
  this.trackBodySet = {};
  this.b2Loader = new B2Loader(this);
  if (debugDrawActive) {
    B2Helper.initDebugDraw(this.b2World);
  }
};

B2WorldFacade.prototype.addB2Element = function(specs) {
  this.b2Loader.addElement(specs);
};

B2WorldFacade.prototype.update = function() {
  var car, j, len;
  if(!this.playerCar){
    return;
  }
  this.b2World.Step(1 / 60, 3, 3);
  this.b2World.ClearForces();
  this.b2World.DrawDebugData();
  this.playerCar.updateData();
  this.playerCar.handleKeyboard(playerCommand.keys);
	this.contactManager = new ContactManager(this.b2World, [this.playerCar]);
  for (j = 0, len = this.otherCars.length; j < len; j++) {
    car = this.otherCars[j];
    car.updateData();
    car.updateFriction();
  }
};

module.exports = B2WorldFacade;
