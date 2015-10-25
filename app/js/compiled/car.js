var Car;

Car = (function() {
  function Car(_consts, _carIndex, _configuration) {
    this._consts = _consts;
    this._carIndex = _carIndex;
    this._configuration = _configuration;
    this.configuration = this._configuration;
    this.consts = this._consts;
    this.frontTires = [];
    this.rearTires = [];
    this.tires = [];
    this.tiresCount = 0;
    this.directionJoints = [];
    this.probeSystem = null;
    this.driftTrigger = this.configuration.driftTrigger;
    this.accelerationFactor = this.configuration.accelerationFactor;
    this.localAccelerationVector = new b2.cMath.b2Vec2(0, -this.accelerationFactor);
    this.localBrakeVector = b2.math.MulFV(-0.5, this.localAccelerationVector);
    this.localHandBrakeVector = b2.math.MulFV(-0.5, this.localAccelerationVector);
    this.localNormalVector = new b2.cMath.b2Vec2(1, 0);
    this.vCurrentRightNormals = [];
    this.linearVelocities = [];
    console.log(this.linearVelocities);
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
    console.log(box2dData);
    this.rearTires = box2dData.rearTires;
    this.frontTires = box2dData.frontTires;
    this.tires = this.rearTires.concat(this.frontTires);
    this.tiresCount = this.tires.length;
    this.directionJoints = box2dData.directionJoints;
    if (box2dData.hasOwnProperty("probeSystem")) {
      this.probeSystem = box2dData.probeSystem;
    }
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
    if ((this.probeSystem != null)) {
      temp = chosenPosition.Copy();
      temp.Add(this.probeSystem.GetPosition());
      this.probeSystem.SetPosition(temp);
    }
  };

  Car.prototype.updateData = function(keyboardData) {
    var i, tires;
    this.localAccelerationVector = new b2.cMath.b2Vec2(0, -this.accelerationFactor);
    tires = this.tires;
    for (i in tires) {
      console.log(this.linearVelocities);
      this.linearVelocities[i] = this.getLinearVelocity(i);
      this.currentRightForwards[i] = this.tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
      this.vCurrentRightNormals[i] = this.getLateralVelocity(i);
    }
  };

  Car.prototype.negateTorque = function(tireIndex) {
    var _ref;
        if ((_ref = b2.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]) < -0.01) != null) {
      _ref;
    } else {
      -({
        1: 1
      });
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
    var i, tires;
    tires = this.tires;
    for (i in tires) {
      b2.applyForceToCenter(tires[i], vec2);
    }
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
