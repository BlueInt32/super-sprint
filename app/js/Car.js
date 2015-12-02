"use strict";

var settings = require('./settings.js');
var B2Helper = require('./utils/B2Helper.js');
var PIXI = require('pixi');

var Car = function() {

  this.carConfig = null;
  // B2
  this.frontTires = [];
  this.rearTires = [];
  this.tires = [];
  this.tiresCount = 0;

  var probeSystem = null,
    localNormalVector = new B2Helper.cMath.b2Vec2(1, 0),
    vCurrentRightNormals = [],
    linearVelocities = [],
    currentRightForwards = [];
  this.adherenceFactor = 1;

  //states
  this.adherence = true;
  this.drifting = false;
  this.puddleEffect = false;

  //for now checkPoints are relative to cars, they shouldn't...
  this.checkPointManager = null;

  this.accelerationFactor = carConfig.accelerationFactor;
  this.localAccelerationVector = new B2Helper.cMath.b2Vec2(0, -this.accelerationFactor);

  this.turnSpeedPerSec = settings.cars[carIndex].steeringWheelSpeed * settings.consts.DEGTORAD;
  this.turnPerTimeStep = this.turnSpeedPerSec / 60;

  // Steering mgmt
  this.lockAngleDeg = carConfig.wheelMaxAngle;
  this.driftTrigger = carConfig.driftTrigger;
  this.directionJoints = [];

  //PIXI
  this.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(settings.cars[carIndex].spritePath));
  this.pixiSprite.anchor.x = 0.5;
  this.pixiSprite.anchor.y = 0.5;
  this.pixiSprite.scale.x = 1;
  this.pixiSprite.scale.y = 1;
}

Car.prototype.setBox2dData = function(box2dData) {
  this.rearTires = box2dData.rearTires;
  this.frontTires = box2dData.frontTires;
  this.tires = this.rearTires.concat(this.frontTires);
  this.tiresCount = this.tires.length;
  this.directionJoints = box2dData.directionJoints;
  if (box2dData.hasOwnProperty("probeSystem")) {
    var probeSystem = box2dData.probeSystem;
  }
  if (this.directionJoints[0]) {
    this.directionJoints[0].SetLimits(0, 0);
  }
  else {
    this.directionJoints[1].SetLimits(0, 0);
  }
  this.b2Body = box2dData.carBody;
  return this.b2Body;
};
Car.prototype.setPosition = function(chosenPosition) {
  this.b2Body.SetPosition(chosenPosition);
  console.log(this.name, this.b2Body.GetPosition());

  for (var i = 0; i < this.tires.length; i++) {
    this.tires[i].SetPosition(chosenPosition);
  }
  if (typeof probeSystem !== "undefined" && probeSystem !== null) {
    probeSystem.SetPosition(chosenPosition);
  }
};
Car.prototype.updateData = function(keyboardData) {
  this.localAccelerationVector = new B2Helper.cMath.b2Vec2(0, -this.accelerationFactor);
  //tires = @tires
  for (var i = 0; i < this.tires.length; i++) {
    linearVelocities[i] = this.getLinearVelocity(i)
    currentRightForwards[i] = this.tires[i].GetWorldVector(new B2Helper.cMath.b2Vec2(0, 1));
    vCurrentRightNormals[i] = this.getLateralVelocity(i)
  }
};
Car.prototype.negateTorque = function(tireIndex) {
  return B2Helper.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
};
Car.prototype.getLateralVelocity = function(tireIndex) {
  var currentRightNormal = this.tires[tireIndex].GetWorldVector(localNormalVector);
  var vCurrentRightNormal = B2Helper.math.MulFV(
    B2Helper.math.Dot(currentRightNormal, linearVelocities[tireIndex]),
    currentRightNormal
  );
  return vCurrentRightNormal;
};
Car.prototype.getLinearVelocity = function(tireIndex) {
  return this.tires[tireIndex].GetLinearVelocity();
};
Car.prototype.getForwardVelocity = function(tireIndex) {
  var vCurrentRightForward = B2Helper.math.MulFV(
    B2Helper.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]),
    currentRightForwards[tireIndex]
  );
  return vCurrentRightForward;
};
Car.prototype.applyImpulse = function(vec2) {
  //tires = @tires
  for (var i = 0; i < this.tires.length; i++) {
    B2Helper.applyForceToCenter(this.tires[i], vec2);
  }
};
Car.prototype.updateFriction = function() {

  for (var i = 0; i < this.tires.length; i++) {

    if (this.adherence) {
      var tireType = B2Helper.findCustomPropertyValue(this.tires[i], 'category', 'string')
      if (tireType == 'wheel_rear' && this.drifting) {
        this.adherenceFactor = 0.2
      }
      else {
        this.adherenceFactor = 1
      }
      var impulse = B2Helper.math.MulFV(-this.adherenceFactor * this.tires[i].GetMass(), vCurrentRightNormals[i]);
      if (impulse.Length() > this.driftTrigger) {
        impulse = B2Helper.math.MulFV(this.driftTrigger / impulse.Length(), impulse);
      }
      this.tires[i].ApplyImpulse(impulse, this.tires[i].GetWorldCenter());
    }
    // this has some effect on how the car turns
    var inertia = this.tires[i].GetInertia()
    var vel = this.tires[i].GetAngularVelocity();
    this.tires[i].ApplyAngularImpulse(10 * inertia * -vel);

    // natural friction against movement. This is a F = -kv type force.
    var currentForwardNormal = this.getForwardVelocity(i);
    var currentForwardSpeed = currentForwardNormal.Normalize();
    var dragForceMagnitude = -carConfig.natural_deceleration * currentForwardSpeed;
    this.tires[i].ApplyForce(B2Helper.math.MulFV(dragForceMagnitude, currentForwardNormal), this.tires[i].GetWorldCenter());

    // here we update how the car behave when its puddleEffect is on (sliding on a paddle).
    if (this.puddleEffect) {
      this.tires[i].ApplyTorque((this.puddleEffect ? 1 : 0) * carConfig.puddleFactor);
    }
  }
};

module.exports = Car;