(function() {
  var Car;

  Car = (function() {
    function Car(configuration) {
      this.configuration = configuration;
    }

    Car.prototype.setBox2dData = function(box2dData) {
      this.rearTires = box2dData.rearTires;
      this.frontTires = box2dData.frontTires;
      this.tires = this.rearTires.concat(this.frontTires);
      this.tiresCount = this.tires.length;
      this.directionJoints = box2dData.directionJoints;
      return this.b2Body = box2dData.carBody;
    };

    Car.prototype.setPosition = function(chosenPosition) {
      var temp;
      temp = chosenPosition.Copy();
      temp.Add(this.b2Body.GetPosition());
      return this.b2Body.SetPosition(temp);
    };

    Car.prototype.updateData = function(keyboardData) {
      var i, _i, _ref, _results;
      this.localAccelerationVector = new b2.math.b2Vec2(0, -this.accelerationFactor);
      _results = [];
      for (i = _i = 0, _ref = this.tiresCount; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.linearVelocities[i] = getLinearVelocity(i);
        this.currentRightForwards[i] = this.tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
        _results.push(this.vCurrentRightNormals[i] = getLateralVelocity(i));
      }
      return _results;
    };

    Car.prototype.getLateralVelocity = function(tireIndex) {
      var currentRightNormal, vCurrentRightNormal;
      currentRightNormal = this.tires[tireIndex].GetWorldVector(this.LocalNormalVector);
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
      var currentForwardNormal, currentForwardSpeed, dragForceMagnitude, i, impulse, inertia, tireType, vel, _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= tiresCount ? _i < tiresCount : _i > tiresCount; i = 0 <= tiresCount ? ++_i : --_i) {
        if (this.adherence) {
          tireType = b2.findCustomPropertyValue(this.tires[i], 'category', 'string');
          if (tireType === 'wheel_rear' && this.drifting) {
            this.adherenceFactor = 0.2;
          } else {
            this.adherenceFactor = 1;
          }
          impulse = b2.math.MulFV(-this.adherenceFactor * this.tires[i].GetMass(), this.vCurrentRightNormals[i]);
          if (impulse.Length() > this.Drift_trigger) {
            impulse = b2.math.MulFV(this.Drift_trigger / impulse.Length(), impulse);
          }
          this.tires[i].ApplyImpulse(impulse, this.tires[i].GetWorldCenter());
        }
        inertia = this.tires[i].GetInertia();
        vel = this.tires[i].GetAngularVelocity();
        this.tires[i].ApplyAngularImpulse(10 * inertia * -vel);
        currentForwardNormal = this.GetForwardVelocity(i);
        currentForwardSpeed = currentForwardNormal.Normalize();
        dragForceMagnitude = -this.configuration.natural_deceleration * currentForwardSpeed;
        this.tires[i].ApplyForce(b2.math.MulFV(dragForceMagnitude, currentForwardNormal), this.tires[i].GetWorldCenter());
        if (this.puddleEffect !== 0) {
          _results.push(this.tires[i].ApplyTorque(this.puddleEffect * this.configuration.puddleFactor));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return Car;

  })();

}).call(this);
