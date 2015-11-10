"use strict";

var b2 = require('./utils/b2Helpers.js');
var configs = require('./configs.js');

var playerCarMaker = function (car) {

  var that = car;

  that.localBrakeVector = b2.math.MulFV(-0.5, that.localAccelerationVector);
  that.localHandBrakeVector = b2.math.MulFV(-0.5, that.localAccelerationVector);


  that.desiredAngle = 0;

  that.handleKeyboard = function (keyboardData) {
    if (keyboardData.accelerate) {
      that.accelerate();
    }
    if (keyboardData.handbrake) {
      that.handBrake();
    } else {
      that.handBrakeRelease();
    }
    if (keyboardData.brake) {
      that.brake();
    }
    that.updateSteering(keyboardData);
  };

  that.updateSteering = function (keyboardData) {
    var angleNow, angleToTurn, newAngle, position;
    if (keyboardData.right && !that.puddleEffect) {
      that.desiredAngle = that.lockAngleDeg * that.consts.DEGTORAD;
    } else if (keyboardData.left && !that.puddleEffect) {
      that.desiredAngle = -that.lockAngleDeg * that.consts.DEGTORAD;
    } else {
      that.desiredAngle = 0;
    }
    angleNow = that.directionJoints[0].GetJointAngle();
    angleToTurn = that.desiredAngle - angleNow;
    if (Math.abs(angleNow) > that.lockAngleDeg) {
      angleToTurn = -angleNow;
    } else {
      angleToTurn = b2.math.Clamp(angleToTurn, -that.turnPerTimeStep, that.turnPerTimeStep);
    }
    newAngle = angleNow + angleToTurn;
    that.directionJoints[0].SetLimits(newAngle, newAngle);
    that.directionJoints[1].SetLimits(newAngle, newAngle);
    that.updateFriction();
    position = that.b2Body.GetPosition();
    that.pixiSprite.position.x = position.x * configs.consts.METER;
    that.pixiSprite.position.y = position.y * configs.consts.METER;
    that.pixiSprite.rotation = that.b2Body.GetAngle();
  };

  that.accelerate = function () {
    var i, tires;
    tires = that.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], that.localAccelerationVector);
    }
  };

  that.brake = function () {
    var i, tires;
    tires = that.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], that.localBrakeVector);
    }
  };

  that.handBrake = function () {
    var i, tires;
    tires = that.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], that.localHandBrakeVector);
      that.drifting = true;
    }
  };

  that.handBrakeRelease = function () {
    that.drifting = false;
  };

  return that;
};

module.exports = playerCarMaker;