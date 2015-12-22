"use strict";

var B2Helper = require('./utils/B2Helper.js');

var ContactManager = function (world, cars) {
	this.cars = cars;
  var contactListener = new B2Helper.dyn.b2ContactListener();
  var that = this;
  contactListener.BeginContact = function (contact) {
    that.HandleContact(contact, true);
  };

  contactListener.EndContact = function (contact) {
    that.HandleContact(contact, false);
  };

  world.SetContactListener(contactListener);
};

ContactManager.prototype.HandleContact = function (contact, began) {
  var cInfo = this.ExtractContactType(contact);
  if (cInfo.type === "wall")
    return;
  if (began) {
    switch (cInfo.type) {
      case "cp":
        this.cars[0].checkPointManager.step(parseInt(cInfo.id));
        break;
      case "puddle":
        this.cars[0].adherence = false;
        this.cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random() * 2)];
        break;
      case "boost":
        var boostVector = new B2Helper.cMath.b2Vec2(cInfo.boostVector.x, cInfo.boostVector.y);
        this.cars[0].applyImpulse(boostVector);
        break;
    }
  }
  else {
    this.cars[0].adherence = true;
    this.cars[0].paddleEffect = 0;
  }
};

ContactManager.prototype.ExtractContactType = function (contact) {
  var aData = contact.GetFixtureA();
  var bData = contact.GetFixtureB();

  if (aData.name === 'wallFixture' || bData.name === 'wallFixture')
    return { 'type': 'wall' };

  if (aData.name.indexOf('cp') === 0)
    return {
      'type': 'cp',
      'id': aData.name.substr(2, 3)
    };
  if (bData.name.indexOf('cp') === 0)
    return {
      'type': 'cp',
      'id': bData.name.substr(2, 3)
    };
  if (aData.name.indexOf('boost') === 0)
    return {
      'type': 'boost',
      'boostVector': aData.customProperties[0].vec2
    };
  if (bData.name.indexOf('boost') === 0)
    return {
      'type': 'boost',
      'boostVector': bData.customProperties[0].vec2
    };
  return { 'type': '' };
};
module.exports = ContactManager;
