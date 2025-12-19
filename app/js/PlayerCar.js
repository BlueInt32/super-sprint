"use strict";

import B2Helper from './utils/B2Helper.js';
import settings from './settings.js';
import Car from './Car.js';
import SpriteManager from './SpriteManager.js';

var PlayerCar = function(carIndex, pixiContainer) {
  this.carConfig = settings.cars[carIndex];
  this.accelerationFactor = this.carConfig.accelerationFactor;
  this.localAccelerationVector = new B2Helper.cMath.b2Vec2(0, -this.accelerationFactor);
  this.localBrakeVector = B2Helper.math.MulFV(-0.5, this.localAccelerationVector);
  this.localHandBrakeVector = B2Helper.math.MulFV(-0.5, this.localAccelerationVector);
  this.desiredAngle = 0;
  this.lockAngleDeg = this.carConfig.wheelMaxAngle;
  this.driftTrigger = this.carConfig.driftTrigger;
  this.turnSpeedPerSec = settings.cars[carIndex].steeringWheelSpeed * settings.consts.DEGTORAD;
  this.turnPerTimeStep = this.turnSpeedPerSec / 60;

  this.spriteManager = new SpriteManager({
    'spriteType':'ship',
    'index': carIndex,
    'pixiContainer': pixiContainer
  });
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
  var angleNow, angleToTurn, newAngle;
  if (keyboardData.right && !this.puddleEffect) {
    this.spriteManager.setState('turnRight');
    this.desiredAngle = this.lockAngleDeg * settings.consts.DEGTORAD;
  } else if (keyboardData.left && !this.puddleEffect) {
    this.spriteManager.setState('turnLeft');
    this.desiredAngle = -this.lockAngleDeg * settings.consts.DEGTORAD;
  } else {
    this.desiredAngle = 0;
    this.spriteManager.setState('still');
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
};

PlayerCar.prototype.updateSpritePosition = function() {
  var position = this.b2Body.GetPosition();
  this.spriteManager.sprite.position.x = position.x * settings.consts.METER;
  this.spriteManager.sprite.position.y = position.y * settings.consts.METER;
  this.spriteManager.sprite.rotation = this.b2Body.GetAngle();
};

PlayerCar.prototype.accelerate = function() {
  var i;
  for (i in this.tires) {
    B2Helper.applyForceToCenter(this.tires[i], this.localAccelerationVector);
  }
};

PlayerCar.prototype.brake = function() {
  var i;
  for (i in this.tires) {
    B2Helper.applyForceToCenter(this.tires[i], this.localBrakeVector);
  }
};

PlayerCar.prototype.handBrake = function() {
  var i;
  for (i in this.tires) {
    B2Helper.applyForceToCenter(this.tires[i], this.localHandBrakeVector);
    this.drifting = true;
  }
};

PlayerCar.prototype.handBrakeRelease = function() {
  this.drifting = false;
};

export default PlayerCar;
