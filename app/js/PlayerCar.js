"use strict";

var B2Helper = require('./utils/B2Helper.js');
var settings = require('./settings.js');
var Car = require('./Car.js');

var PlayerCar = function(carIndex) {
  this.localBrakeVector = B2Helper.math.MulFV(-0.5, this.localAccelerationVector);
  this.localHandBrakeVector = B2Helper.math.MulFV(-0.5, this.localAccelerationVector);
  this.desiredAngle = 0;
  this.carConfig = settings.cars[carIndex];
};

PlayerCar.prototype = new Car();
PlayerCar.prototype.constructor = PlayerCar;

PlayerCar.prototype.handleKeyboard = function(keyboardData) {
  if (keyboardData.accelerate) {
    this.accelerate();
  }
  if (keyboardData.handbrake) {
    this.handBrake();
  } else {
    this.handBrakeRelease();
  }
  if (keyboardData.brake) {
    this.brake();
  }
  this.updateSteering(keyboardData);
};

PlayerCar.prototype.updateSteering = function(keyboardData) {
  var angleNow, angleToTurn, newAngle, position;
  if (keyboardData.right && !this.puddleEffect) {
    this.desiredAngle = this.lockAngleDeg * settings.consts.DEGTORAD;
  } else if (keyboardData.left && !this.puddleEffect) {
    this.desiredAngle = -this.lockAngleDeg * settings.consts.DEGTORAD;
  } else {
    this.desiredAngle = 0;
  }
  angleNow = this.directionJoints[0].GetJointAngle();
  angleToTurn = this.desiredAngle - angleNow;
  if (Math.abs(angleNow) > this.lockAngleDeg) {
    angleToTurn = -angleNow;
  } else {
    angleToTurn = B2Helper.math.Clamp(angleToTurn, -this.turnPerTimeStep, this.turnPerTimeStep);
  }
  newAngle = angleNow + angleToTurn;
  this.directionJoints[0].SetLimits(newAngle, newAngle);
  this.directionJoints[1].SetLimits(newAngle, newAngle);
  this.updateFriction();
  position = this.b2Body.GetPosition();
  this.pixiSprite.position.x = position.x * settings.consts.METER;
  this.pixiSprite.position.y = position.y * settings.consts.METER;
  this.pixiSprite.rotation = this.b2Body.GetAngle();
};

PlayerCar.prototype.accelerate = function() {
  var i, tires;
  tires = this.tires;
  for (i in tires) {
    B2Helper.applyForceToCenter(tires[i], this.localAccelerationVector);
  }
};

PlayerCar.prototype.brake = function() {
  var i, tires;
  tires = this.tires;
  for (i in tires) {
    B2Helper.applyForceToCenter(tires[i], this.localBrakeVector);
  }
};

PlayerCar.prototype.handBrake = function() {
  var i, tires;
  tires = this.tires;
  for (i in tires) {
    B2Helper.applyForceToCenter(tires[i], this.localHandBrakeVector);
    this.drifting = true;
  }
};

PlayerCar.prototype.handBrakeRelease = function() {
  this.drifting = false;
};

module.exports = playerCarMaker;