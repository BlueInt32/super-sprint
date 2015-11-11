'use strict';

var configs = require('./configs.js');
var b2 = require('./utils/b2Helpers.js');
var PIXI = require('./libs/pixi.js/pixi.dev.js');

var carMaker = function (carIndex) {
  var that = {},
    carConfig = configs.cars[carIndex];
  // B2
  that.frontTires = [];
  that.rearTires = [];
  that.tires = [];
  that.tiresCount = 0;

  var probeSystem = null,

  // Car Behaviours

    localNormalVector = new b2.cMath.b2Vec2(1, 0),
    vCurrentRightNormals = [],
    linearVelocities = [],
    currentRightForwards = [];

  //var  from lock to lock in 0.5 sec
    that.adherenceFactor = 1;


  //states
  that.adherence = true;
  that.drifting = false;
  that.puddleEffect = false;

  //for now checkPoints are relative to cars, they shouldn't...
  that.checkPointManager = null;

  that.accelerationFactor = carConfig.accelerationFactor;
  that.localAccelerationVector = new b2.cMath.b2Vec2(0, -that.accelerationFactor);

  that.turnSpeedPerSec = configs.cars[carIndex].steeringWheelSpeed * configs.consts.DEGTORAD;
  that.turnPerTimeStep = that.turnSpeedPerSec / 60;

  // Steering mgmt
  that.lockAngleDeg = carConfig.wheelMaxAngle;
  that.driftTrigger = carConfig.driftTrigger;
  that.directionJoints = [];

  //PIXI
  that.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(configs.cars[carIndex].spritePath));
  that.pixiSprite.anchor.x = 0.5;
  that.pixiSprite.anchor.y = 0.5;
  that.pixiSprite.scale.x = 1;
  that.pixiSprite.scale.y = 1;

  that.setBox2dData = function (box2dData) {
    that.rearTires = box2dData.rearTires;
    that.frontTires = box2dData.frontTires;
    that.tires = that.rearTires.concat(that.frontTires);
    that.tiresCount = that.tires.length;
    that.directionJoints = box2dData.directionJoints;
    if (box2dData.hasOwnProperty("probeSystem")) {
      var probeSystem = box2dData.probeSystem;
    }
    if (that.directionJoints[0]) {
      that.directionJoints[0].SetLimits(0, 0);
    }
    else {
      that.directionJoints[1].SetLimits(0, 0);
    }
    that.b2Body = box2dData.carBody;
    return that.b2Body;
  };

  that.setPosition = function (chosenPosition) {
    var temp = chosenPosition.Copy();
    temp.Add(that.b2Body.GetPosition());
    that.b2Body.SetPosition(temp);
    for (var i = 0; i < that.tires.length; i++) {
      temp = chosenPosition.Copy();
      temp.Add(that.tires[i].GetPosition());
      that.tires[i].SetPosition(temp);
    }
    if (typeof probeSystem !== "undefined" && probeSystem !== null) {
      temp = chosenPosition.Copy();
      temp.Add(probeSystem.GetPosition());
      probeSystem.SetPosition(temp);
    }
  };

  that.updateData = function (keyboardData) {
    that.localAccelerationVector = new b2.cMath.b2Vec2(0, -that.accelerationFactor);
    //tires = @tires
    for (var i = 0; i < that.tires.length; i++) {
      linearVelocities[i] = that.getLinearVelocity(i)
      currentRightForwards[i] = that.tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
      vCurrentRightNormals[i] = that.getLateralVelocity(i)
    }
  };

  that.negateTorque = function (tireIndex) {
    return b2.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
  };

  that.getLateralVelocity = function (tireIndex) {
    var currentRightNormal = that.tires[tireIndex].GetWorldVector(localNormalVector);
    var vCurrentRightNormal = b2.math.MulFV(
      b2.math.Dot(currentRightNormal, linearVelocities[tireIndex]),
      currentRightNormal
    );
    return vCurrentRightNormal;
  };

  that.getLinearVelocity = function (tireIndex) {
    return that.tires[tireIndex].GetLinearVelocity();
  };

  that.getForwardVelocity = function (tireIndex) {
    var vCurrentRightForward = b2.math.MulFV(
      b2.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]),
      currentRightForwards[tireIndex]
    );
    return vCurrentRightForward;
  };

  that.applyImpulse = function (vec2) {
    //tires = @tires
    for (var i = 0; i < that.tires.length; i++) {
      b2.applyForceToCenter(that.tires[i], vec2);
    }
  };

  that.updateFriction = function (vec2) {
    for (var i = 0; i < that.tires.length; i++) {

      if (that.adherence) {
        var tireType = b2.findCustomPropertyValue(that.tires[i], 'category', 'string')
        if (tireType == 'wheel_rear' && that.drifting) {
          that.adherenceFactor = 0.2
        }
        else {
          that.adherenceFactor = 1
        }
        var impulse = b2.math.MulFV(-that.adherenceFactor * that.tires[i].GetMass(), vCurrentRightNormals[i]);
        if (impulse.Length() > that.driftTrigger) {
          impulse = b2.math.MulFV(that.driftTrigger / impulse.Length(), impulse);
        }
        that.tires[i].ApplyImpulse(impulse, that.tires[i].GetWorldCenter());
      }
      // this has some effect on how the car turns
      var inertia = that.tires[i].GetInertia()
      var vel = that.tires[i].GetAngularVelocity();
      that.tires[i].ApplyAngularImpulse(10 * inertia * -vel);

      // natural friction against movement. This is a F = -kv type force.
      var currentForwardNormal = that.getForwardVelocity(i);
      var currentForwardSpeed = currentForwardNormal.Normalize();
      var dragForceMagnitude = -carConfig.natural_deceleration * currentForwardSpeed;
      that.tires[i].ApplyForce(b2.math.MulFV(dragForceMagnitude, currentForwardNormal), that.tires[i].GetWorldCenter());

      // here we update how the car behave when its puddleEffect is on (sliding on a paddle).
      if (that.puddleEffect) {
        that.tires[i].ApplyTorque((that.puddleEffect ? 1 : 0) * carConfig.puddleFactor);
      }
    }
  };

  return that;
}

module.exports = carMaker;