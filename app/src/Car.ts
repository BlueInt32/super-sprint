"use strict";

import settings from './settings.ts';
import B2Helper from './utils/B2Helper.ts';

var Car = function() {
  // B2
  this.frontTires = [];
  this.rearTires = [];
  this.tires = [];
  this.tiresCount = 0;

  var probeSystem = null;
	this.localNormalVector = new B2Helper.cMath.b2Vec2(1, 0);
	this.vCurrentRightNormals = [];
	this.linearVelocities = [];
  this.currentRightForwards = [];
  this.adherenceFactor = 1;

  //states
  this.adherence = true;
  this.drifting = false;
  this.puddleEffect = false;

  //fornow checkPoints are relative to cars, they shouldn't...
  this.checkPointManager = null;

  // Steering mgmt
  this.directionJoints = [];

};

Car.prototype.setBox2dData = function(box2dData) {
  this.rearTires = box2dData.rearTires;
  this.frontTires = box2dData.frontTires;
  this.tires = this.rearTires.concat(this.frontTires);
  this.tiresCount = this.tires.length;
  this.directionJoints = box2dData.directionJoints;
  this.b2Body = box2dData.carBody;
  return this.b2Body;
};

Car.prototype.setPosition = function(chosenPosition) {
  this.b2Body.SetPosition(chosenPosition);
  this.foreachTire(function(tire, tireIndex){
    tire.SetPosition(chosenPosition);
  });
};

Car.prototype.updateData = function() {
	
  this.localAccelerationVector = new B2Helper.cMath.b2Vec2(0, -this.accelerationFactor);
  this.foreachTire((tire, tireIndex)=>{
     this.linearVelocities[tireIndex] = this.getLinearVelocity(tireIndex);
    this.currentRightForwards[tireIndex] = tire.GetWorldVector(new B2Helper.cMath.b2Vec2(0, 1));
    this.vCurrentRightNormals[tireIndex] = this.getLateralVelocity(tireIndex);
  });
};

Car.prototype.negateTorque = function(tireIndex) {
  return B2Helper.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
};

Car.prototype.getLateralVelocity = function(tireIndex) {
  var currentRightNormal = this.tires[tireIndex].GetWorldVector(this.localNormalVector);
  var vCurrentRightNormal = B2Helper.math.MulFV(
    B2Helper.math.Dot(currentRightNormal, this.linearVelocities[tireIndex]),
    currentRightNormal
  );
  return vCurrentRightNormal;
};

Car.prototype.getLinearVelocity = function(tireIndex) {
  return this.tires[tireIndex].GetLinearVelocity();
};

Car.prototype.getForwardVelocity = function(tireIndex) {
  var vCurrentRightForward = B2Helper.math.MulFV(
    B2Helper.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]),
    this.currentRightForwards[tireIndex]
  );
  return vCurrentRightForward;
};

Car.prototype.applyImpulse = function(vec2) {
  this.foreachTire(function(tire, tireIndex){
    B2Helper.applyForceToCenter(tire, vec2);
  });
};

Car.prototype.updateFriction = function() {
	this.foreachTire((tire, tireIndex)=> {
    if (this.adherence) {
      var tireType = B2Helper.findCustomPropertyValue(tire, 'category', 'string');
      if (tireType == 'wheel_rear' && this.drifting) {
				this.adherenceFactor = this.carConfig.driftAdherenceFactor;
      }
      else {
				this.adherenceFactor = this.carConfig.normalAdherenceFactor;
      }
      var impulse = B2Helper.math.MulFV(-this.adherenceFactor * tire.GetMass(), this.vCurrentRightNormals[tireIndex]);
			//console.log(impulse.Length() - this.driftTrigger);
      if (impulse.Length() > this.driftTrigger) {
        impulse = B2Helper.math.MulFV(this.driftTrigger / impulse.Length(), impulse);
      }
      tire.ApplyImpulse(impulse, tire.GetWorldCenter());
    }
    // this has some effect on how the car turns
    var inertia = tire.GetInertia();
    var vel = tire.GetAngularVelocity();
    tire.ApplyAngularImpulse(10 * inertia * -vel);

    // natural friction against movement. This is a F = -kv type force.
    var currentForwardNormal = this.getForwardVelocity([tireIndex]);
    var currentForwardSpeed = currentForwardNormal.Normalize();
    var dragForceMagnitude = -this.carConfig.natural_deceleration * currentForwardSpeed;
    tire.ApplyForce(B2Helper.math.MulFV(dragForceMagnitude, currentForwardNormal), tire.GetWorldCenter());

    // here we update how the car behave when its puddleEffect is on (sliding on a paddle).
    if (this.puddleEffect) {
      tire.ApplyTorque((this.puddleEffect ? 1 : 0) * this.carConfig.puddleFactor);
    }
  });
};

Car.prototype.foreachTire = function(perTireAction){
  for (var i = 0; i < this.tires.length; i++) {
     perTireAction.call(this, this.tires[i], i);
  }
};

export default Car;
