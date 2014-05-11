var Car;

Car = (function() {
  function Car(_consts, _carIndex, _configuration, _isIA) {
    this._consts = _consts;
    this._carIndex = _carIndex;
    this._configuration = _configuration;
    this._isIA = _isIA;
    this.configuration = this._configuration;
    this.consts = this._consts;
    this.frontTires = [];
    this.rearTires = [];
    this.tires = [];
    this.tiresCount = 0;
    this.directionJoints = [];
    this.driftTrigger = this.configuration.driftTrigger;
    this.accelerationFactor = this.configuration.accelerationFactor;
    this.localAccelerationVector = new b2.cMath.b2Vec2(0, -this.accelerationFactor);
    this.localBrakeVector = b2.math.MulFV(-0.5, this.localAccelerationVector);
    this.localHandBrakeVector = b2.math.MulFV(-0.5, this.localAccelerationVector);
    this.localNormalVector = new b2.cMath.b2Vec2(1, 0);
    this.vCurrentRightNormals = [];
    this.linearVelocities = [];
    this.currentRightForwards = [];
    this.lockAngleDeg = this.configuration.wheelMaxAngle;
    this.turnSpeedPerSec = this.configuration.steeringWheelSpeed * this.consts.DEGTORAD;
    this.turnPerTimeStep = this.turnSpeedPerSec / 60;
    this.desiredAngle = 0;
    this.adherenceFactor = 1;
    this.adherence = true;
    this.drifting = false;
    this.puddleEffect = false;
    this.checkPointManager = null;
    this.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(CarsConfig[this._carIndex].spritePath));
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
    if (this.directionJoints[0] != null) {
      this.directionJoints[0].SetLimits(0, 0);
      this.directionJoints[1].SetLimits(0, 0);
    }
    this.b2Body = box2dData.carBody;
  };

  Car.prototype.setPosition = function(chosenPosition) {
    var i, temp, tires;
    temp = chosenPosition.Copy();
    temp.Add(this.b2Body.GetPosition());
    this.b2Body.SetPosition(temp);
    tires = this.tires;
    for (i in tires) {
      temp = chosenPosition.Copy();
      temp.Add(tires[i].GetPosition());
      tires[i].SetPosition(temp);
    }
  };

  Car.prototype.updateData = function(keyboardData) {
    var i, _i, _ref;
    this.localAccelerationVector = new b2.cMath.b2Vec2(0, -this.accelerationFactor);
    for (i = _i = 0, _ref = this.tiresCount; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      this.linearVelocities[i] = this.getLinearVelocity(i);
      this.currentRightForwards[i] = this.tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
      this.vCurrentRightNormals[i] = this.getLateralVelocity(i);
    }
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

  Car.prototype.updateSteering = function(keyboardData) {
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

  Car.prototype.accelerate = function() {
    var i, tires;
    tires = this.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], this.localAccelerationVector);
    }
  };

  Car.prototype.brake = function() {
    var i, tires;
    tires = this.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], this.localBrakeVector);
    }
  };

  Car.prototype.handBrake = function() {
    var i, tires;
    tires = this.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], this.localHandBrakeVector);
      this.drifting = true;
    }
  };

  Car.prototype.handBrakeRelease = function() {
    this.drifting = false;
  };

  Car.prototype.negateTorque = function(tireIndex) {
    var _ref;
    return (_ref = b2.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]) < -0.01) != null ? _ref : -{
      1: 1
    };
  };

  Car.prototype.getLateralVelocity = function(tireIndex) {
    var currentRightNormal, vCurrentRightNormal;
    currentRightNormal = this.tires[tireIndex].GetWorldVector(this.localNormalVector);
    vCurrentRightNormal = b2.math.MulFV(b2.math.Dot(currentRightNormal, this.linearVelocities[tireIndex]), currentRightNormal);
    return vCurrentRightNormal;
  };

  Car.prototype.getLinearVelocity = function(tireIndex) {
    return this.tires[tireIndex].GetLinearVelocity();
  };

  Car.prototype.getForwardVelocity = function(tireIndex) {
    var vCurrentRightForward;
    vCurrentRightForward = b2.math.MulFV(b2.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]), this.currentRightForwards[tireIndex]);
    return vCurrentRightForward;
  };

  Car.prototype.applyImpulse = function(vec2) {
    var i, tires, _results;
    tires = this.tires;
    _results = [];
    for (i in tires) {
      _results.push(b2.applyForceToCenter(tires[i], vec2));
    }
    return _results;
  };

  Car.prototype.updateFriction = function(vec2) {
    var currentForwardNormal, currentForwardSpeed, dragForceMagnitude, i, impulse, inertia, tireType, tires, vel, _ref;
    tires = this.tires;
    for (i in tires) {
      if (this.adherence) {
        tireType = b2.findCustomPropertyValue(tires[i], 'category', 'string');
        if (tireType === 'wheel_rear' && this.drifting) {
          this.adherenceFactor = 0.2;
        } else {
          this.adherenceFactor = 1;
        }
        impulse = b2.math.MulFV(-this.adherenceFactor * tires[i].GetMass(), this.vCurrentRightNormals[i]);
        if (impulse.Length() > this.driftTrigger) {
          impulse = b2.math.MulFV(this.driftTrigger / impulse.Length(), impulse);
        }
        tires[i].ApplyImpulse(impulse, tires[i].GetWorldCenter());
      }
      inertia = tires[i].GetInertia();
      vel = tires[i].GetAngularVelocity();
      tires[i].ApplyAngularImpulse(10 * inertia * -vel);
      currentForwardNormal = this.getForwardVelocity(i);
      currentForwardSpeed = currentForwardNormal.Normalize();
      dragForceMagnitude = -this.configuration.natural_deceleration * currentForwardSpeed;
      tires[i].ApplyForce(b2.math.MulFV(dragForceMagnitude, currentForwardNormal), tires[i].GetWorldCenter());
      if (this.puddleEffect) {
        tires[i].ApplyTorque(((_ref = this.puddleEffect) != null ? _ref : {
          1: 0
        }) * this.configuration.puddleFactor);
      }
    }
  };

  return Car;

})();
