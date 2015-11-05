"use strict";

/**
 * this class encapsulates the management of box2d contacts
 * @param {b2World} world in which the bodies evolve
 * @param {Cars[]} cars
 */
var ContactManager = function (world, cars) {
  var that;

  var contactListener = new Box2D.Dynamics.b2ContactListener();

  contactListener.BeginContact = function (contact) {
    that.HandleContact(contact, true);
  };
  contactListener.EndContact = function (contact) {
    that.HandleContact(contact, false);
  };
  world.SetContactListener(contactListener);


  that.HandleContact = function (contact, began) {
    var cInfo = ExtractContactType(contact);
    if (cInfo.type === "wall")
      return;
    if (began) {
      switch (cInfo.type) {
        case "cp":
          cars[0].checkPointManager.Step(parseInt(cInfo.id));
          break;
        case "puddle":
          cars[0].adherence = false;
          cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random() * 2)];
          break;
        case "boost":
          var boostVector = new b2.cMath.b2Vec2(cInfo.boostVector.x, cInfo.boostVector.y);
          cars[0].ApplyImpulse(boostVector);
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
