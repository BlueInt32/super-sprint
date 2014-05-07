#Car class
class Car
	constructor: (@_consts, @_carIndex, @_configuration, @_isIA) ->
		@configuration = @_configuration;
		@consts = @_consts;

		# B2
		@frontTires = [];
		@rearTires = [];
		@tires = [];
		@tiresCount = 0;
		@directionJoints = [];

		# Car Behaviours
		@driftTrigger = @configuration.driftTrigger;
		@accelerationFactor = @configuration.accelerationFactor;
		@localAccelerationVector = new b2.cMath.b2Vec2(0, -@accelerationFactor);
		@localBrakeVector = b2.math.MulFV(-0.5 , @localAccelerationVector);
		@localHandBrakeVector = b2.math.MulFV(-0.5, @localAccelerationVector);
		@localNormalVector = new b2.cMath.b2Vec2(1, 0);
		@vCurrentRightNormals = [];
		@linearVelocities = [];
		@currentRightForwards = [];

		#@isIA = isIA;

		# Steering mgmt
		@lockAngleDeg = @configuration.wheelMaxAngle;

		# from lock to lock in 0.5 sec
		@turnSpeedPerSec = @configuration.steeringWheelSpeed * @consts.DEGTORAD
		@turnPerTimeStep = @turnSpeedPerSec / 60
		@desiredAngle = 0
		@adherenceFactor = 1

		#states
		@adherence = true
		@drifting = false
		@puddleEffect = false

		#for now checkPoints are relative to cars, they shouldn't...
		@checkPointManager = null;

		#PIXI
		@pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(Cars[@_carIndex].sprite));
		@pixiSprite.anchor.x  = 0.5
		@pixiSprite.anchor.y = 0.5
		@pixiSprite.scale.x = 1
		@pixiSprite.scale.y = 1

	setBox2dData: (box2dData) ->
		@rearTires = box2dData.rearTires
		@frontTires = box2dData.frontTires
		@tires = @rearTires.concat(@frontTires)
		@tiresCount = @tires.length
		@directionJoints = box2dData.directionJoints
		@b2Body = box2dData.carBody
		return

	setPosition:(chosenPosition) ->
		temp = chosenPosition.Copy()
		temp.Add(@b2Body.GetPosition())
		@b2Body.SetPosition(temp)
		for i in @tiresCount
			temp = chosenPosition.Copy()
			temp.Add(@tires[i].GetPosition())
			@tires[i].SetPosition(temp)
		return


	updateData:(keyboardData) ->
		@localAccelerationVector = new b2.cMath.b2Vec2(0, -@accelerationFactor)

		for i in [0...@tiresCount]
			@linearVelocities[i] = @getLinearVelocity(i)
			@currentRightForwards[i] = @tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1))
			@vCurrentRightNormals[i] = @getLateralVelocity(i)

		if keyboardData.accelerate then	@accelerate()
		if keyboardData.handbrake then @handBrake()
		else @handBrakeRelease()
		if keyboardData.brake then @brake()

		@updateSteering(keyboardData)
		return

	updateSteering:(keyboardData) ->
		if (keyboardData.right && @puddleEffect == 0)
			@desiredAngle =  @lockAngleDeg * @consts.DEGTORAD
		else if (keyboardData.left && @puddleEffect == 0)
			@desiredAngle = -@lockAngleDeg * @consts.DEGTORAD
		else @desiredAngle = 0;

		angleNow = @directionJoints[0].GetJointAngle()

		angleToTurn = @desiredAngle - angleNow
		if(Math.abs(angleNow) > @lockAngleDeg)
			angleToTurn = -angleNow
		else
			angleToTurn = b2Math.Clamp( angleToTurn, -@turnPerTimeStep, @turnPerTimeStep )
		newAngle = angleNow + angleToTurn
		@directionJoints[0].SetLimits(newAngle, newAngle)
		@directionJoints[1].SetLimits(newAngle, newAngle)

		@updateFriction()
		position = @b2Body.GetPosition()
		@pixiSprite.position.x = position.x * @consts.METER
		@pixiSprite.position.y = position.y * @consts.METER
		@pixiSprite.rotation = @b2Body.GetAngle()
		return

	accelerate: ->
		tires = @tires
		for i of tires
			b2.applyForceToCenter(tires[i], @localAccelerationVector)
		return

	brake: ->
		tires = @tires
		for i of tires
			b2.applyForceToCenter(tires[i], @localBrakeVector)
		return

	handBrake: ->
		tires = @tires
		for i of @tires
			b2.applyForceToCenter(tires[i], @localHandBrakeVector)
			@drifting = true
		return

	handBrakeRelease: ->
		@drifting = false

	negateTorque: (tireIndex) ->
		b2.math.Dot(@currentRightForwards[tireIndex], @linearVelocities[tireIndex]) < -0.01 ? -1 : 1

	getLateralVelocity:(tireIndex) ->
		currentRightNormal = @tires[tireIndex].GetWorldVector(@localNormalVector);
		vCurrentRightNormal = b2.math.MulFV(
			b2.math.Dot(currentRightNormal, @linearVelocities[tireIndex]),
			currentRightNormal
		);
		return vCurrentRightNormal;

	getLinearVelocity: (tireIndex) ->
		return @tires[tireIndex].GetLinearVelocity();

	getForwardVelocity: (tireIndex) ->
		vCurrentRightForward = b2.math.MulFV(
			b2.math.Dot(@currentRightForwards[tireIndex], @linearVelocities[tireIndex]),
			@currentRightForwards[tireIndex]
		);
		return vCurrentRightForward;

	updateFriction: (vec2) ->
		for i in [0...@tiresCount]
			if @adherence
				tireType = b2.findCustomPropertyValue(@tires[i], 'category', 'string')
				if tireType == 'wheel_rear' and @drifting
					@adherenceFactor = 0.2
				else
					@adherenceFactor = 1

				impulse = b2.math.MulFV(
					- @adherenceFactor * @tires[i].GetMass(),
					@vCurrentRightNormals[i]
				);
				if impulse.Length() > @driftTrigger
					impulse  = b2.math.MulFV(@driftTrigger / impulse.Length(), impulse);

				@tires[i].ApplyImpulse(impulse, @tires[i].GetWorldCenter());

			# this has some effect on how the car turns
			inertia = @tires[i].GetInertia()
			vel = @tires[i].GetAngularVelocity();
			@tires[i].ApplyAngularImpulse(10 * inertia * -vel);

			# natural friction against movement. This is a F = -kv type force.
			currentForwardNormal = @getForwardVelocity(i);
			currentForwardSpeed = currentForwardNormal.Normalize();
			dragForceMagnitude = -@configuration.natural_deceleration * currentForwardSpeed;
			@tires[i].ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), @tires[i].GetWorldCenter() );

			# here we update how the car behave when its puddleEffect is on (sliding on a paddle).
			if @puddleEffect != 0
				@tires[i].ApplyTorque(@puddleEffect * @configuration.puddleFactor);
		return
