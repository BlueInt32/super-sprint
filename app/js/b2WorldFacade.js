"use strict";

import B2Helper from './utils/B2Helper.js';
import B2Loader from './B2Loader.js';
import playerCommand from './playerCommand.js';
import dat from 'dat-gui';
import ContactManager from './ContactManager.js';


var B2WorldFacade = function(debugDrawActive) {
  this.b2World = new B2Helper.dyn.b2World(new B2Helper.cMath.b2Vec2(0, 0), true);
  this.playerCar = null;
  this.otherCars = [];
  this.trackBodySet = {};
  this.b2Loader = new B2Loader(this);
  this.contactManager = null;
  this.debugDrawActive = debugDrawActive;
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
  if (this.debugDrawActive) {
    this.b2World.DrawDebugData();
  }
  this.playerCar.updateData();
  this.playerCar.handleKeyboard(playerCommand.keys);
  this.playerCar.updateSpritePosition();
  if (!this.contactManager) {
    this.contactManager = new ContactManager(this.b2World, [this.playerCar]);
  }
  for (j = 0, len = this.otherCars.length; j < len; j++) {
    car = this.otherCars[j];
    car.updateData();
    car.updateFriction();
  }
};

B2WorldFacade.prototype.toggleDebugDraw = function() {
  this.debugDrawActive = !this.debugDrawActive;

  // Initialize debug draw if it wasn't initialized before
  if (this.debugDrawActive && !this.b2World.m_debugDraw) {
    B2Helper.initDebugDraw(this.b2World);
  }

  // Show or hide the debug canvas
  var canvas = document.getElementById('canvas');
  if (canvas) {
    canvas.style.display = this.debugDrawActive ? 'block' : 'none';
  }
};

export default B2WorldFacade;
