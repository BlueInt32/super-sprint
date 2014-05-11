var PlayerCar,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PlayerCar = (function(_super) {
  __extends(PlayerCar, _super);

  function PlayerCar() {
    return PlayerCar.__super__.constructor.apply(this, arguments);
  }

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
      this.desiredAngle = this.lockAngleDeg * this.consts.DEGTORAD;
    } else if (keyboardData.left && !this.puddleEffect) {
      this.desiredAngle = -this.lockAngleDeg * this.consts.DEGTORAD;
    } else {
      this.desiredAngle = 0;
    }
    angleNow = this.directionJoints[0].GetJointAngle();
    angleToTurn = this.desiredAngle - angleNow;
    if (Math.abs(angleNow) > this.lockAngleDeg) {
      angleToTurn = -angleNow;
    } else {
      angleToTurn = b2Math.Clamp(angleToTurn, -this.turnPerTimeStep, this.turnPerTimeStep);
    }
    newAngle = angleNow + angleToTurn;
    this.directionJoints[0].SetLimits(newAngle, newAngle);
    this.directionJoints[1].SetLimits(newAngle, newAngle);
    this.updateFriction();
    position = this.b2Body.GetPosition();
    this.pixiSprite.position.x = position.x * this.consts.METER;
    this.pixiSprite.position.y = position.y * this.consts.METER;
    this.pixiSprite.rotation = this.b2Body.GetAngle();
  };

  PlayerCar.prototype.accelerate = function() {
    var i, tires;
    tires = this.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], this.localAccelerationVector);
    }
  };

  PlayerCar.prototype.brake = function() {
    var i, tires;
    tires = this.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], this.localBrakeVector);
    }
  };

  PlayerCar.prototype.handBrake = function() {
    var i, tires;
    tires = this.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], this.localHandBrakeVector);
      this.drifting = true;
    }
  };

  PlayerCar.prototype.handBrakeRelease = function() {
    this.drifting = false;
  };

  return PlayerCar;

})(Car);
