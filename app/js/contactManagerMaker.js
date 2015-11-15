"use strict";

var b2 = require('./utils/b2Helpers.js');

var contactManagerMaker = function (world, cars) {
  var that = {};

  var contactListener = new b2.dyn.b2ContactListener();

  contactListener.BeginContact = function (contact) {
    that.HandleContact(contact, true);
  };

  contactListener.EndContact = function (contact) {
    that.HandleContact(contact, false);
  };

  world.SetContactListener(contactListener);


  that.HandleContact = function (contact, began) {
    var cInfo = that.ExtractContactType(contact);
    if (cInfo.type === "wall")
      return;
    if (began) {
      switch (cInfo.type) {
        case "cp":
          cars[0].checkPointManager.step(parseInt(cInfo.id));
          break;
        case "puddle":
          cars[0].adherence = false;
          cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random() * 2)];
          break;
        case "boost":
          var boostVector = new b2.cMath.b2Vec2(cInfo.boostVector.x, cInfo.boostVector.y);
          cars[0].applyImpulse(boostVector);
          break;
      }
    }
    else {
      cars[0].adherence = true;
      cars[0].paddleEffect = 0;
    }
  };

  that.ExtractContactType = function (contact) {
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

  return that;
};

module.exports = contactManagerMaker;