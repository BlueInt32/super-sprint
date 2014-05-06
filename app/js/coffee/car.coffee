#Car class
class Car
	constructor: (@configuration) ->

	setBox2dData: (box2dData) ->
		@rearTires = box2dData.rearTires
		@frontTires = box2dData.frontTires
		@tires = @rearTires.concat(@frontTires)
		@tiresCount = @tires.length
		@directionJoints = box2dData.directionJoints
		@b2Body = box2dData.carBody

	setPosition:(chosenPosition) ->
		temp = chosenPosition.Copy()
		temp.Add(@b2Body.GetPosition())
		@b2Body.SetPosition(temp)

	updateData:(keyboardData) ->
		@localAccelerationVector = new b2.math.b2Vec2(0, -@accelerationFactor)

		for i in [0...@tiresCount]
			@linearVelocities[i] = getLinearVelocity(i);
			@currentRightForwards[i] = @tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
			@vCurrentRightNormals[i] = getLateralVelocity(i);

	getLateralVelocity:(tireIndex) ->
		currentRightNormal = @tires[tireIndex].GetWorldVector(@LocalNormalVector);
		vCurrentRightNormal = b2.math.MulFV(
			b2.math.Dot(currentRightNormal, @linearVelocities[tireIndex]),
			currentRightNormal
		);
		return vCurrentRightNormal;

	getLinearVelocity: (tireIndex) ->
		return @tires[tireIndex].GetLinearVelocity();

	getForwardVelocity: (tireIndex) ->
		vCurrentRightForward = b2.math.MulFV(
			b2.math.Dot(this.currentRightForwards[tireIndex], @linearVelocities[tireIndex]),
			@currentRightForwards[tireIndex]
		);
		return vCurrentRightForward;
	applyImpulse: (vec2) ->
		for i in [0...tiresCount]
			if @adherence
				tireType = b2.findCustomPropertyValue(@tires[i], 'category', 'string')
				if tireType == 'wheel_rear' and @drifting
					@adherenceFactor = 0.2
				else
					@adherenceFactor = 1

				impulse = b2.math.MulFV(
					- this.adherenceFactor * this.tires[i].GetMass(),
					this.vCurrentRightNormals[i]
				);
				if impulse.Length() > @Drift_trigger
					impulse  = b2.math.MulFV(@Drift_trigger / impulse.Length(), impulse);

				@tires[i].ApplyImpulse(impulse, @tires[i].GetWorldCenter());

			# what does this do ???
			inertia = @tires[i].GetInertia()
			vel = @tires[i].GetAngularVelocity();
			@tires[i].ApplyAngularImpulse(10 * inertia * -vel);

			# natural friction against movement. This is a F = -kv type force.
			currentForwardNormal = this.GetForwardVelocity(i);
			currentForwardSpeed = currentForwardNormal.Normalize();
			dragForceMagnitude = -this.configuration.natural_deceleration * currentForwardSpeed;
			this.tires[i].ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), this.tires[i].GetWorldCenter() );

			# here we update how the car behave when its puddleEffect is on (sliding on a paddle).
			if this.puddleEffect != 0
				this.tires[i].ApplyTorque(this.puddleEffect * this.configuration.puddleFactor);
