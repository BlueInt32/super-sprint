function Car(consts, carIndex, configuration, isIA)
{

	this.configuration = configuration;
	this.consts = consts;

	// B2
	this.carBodyDef = new b2.dyn.b2BodyDef();
	this.b2Body = null;
	this.tiresFront = [];
	this.rearTires = [];
	this.tiresCount = 0;
	this.directionJoints = [];

	// Car Behaviours
	this.Drift_trigger = this.configuration.driftTrigger;
	this.accelerationFactor = this.configuration.accelerationFactor;
	this.LocalAccelerationVector = new b2.cMath.b2Vec2(0, -this.accelerationFactor);
	this.LocalBrakeVector = b2.math.MulFV(-0.5 , this.LocalAccelerationVector);
	this.LocalHandBrakeVector = b2.math.MulFV(-0.5, this.LocalAccelerationVector);
	this.LocalNormalVector = new b2.cMath.b2Vec2(1, 0);
	this.vCurrentRightNormals = [];

	// updated each turn (see updateData) this is the (vx, vy) vector in world ref for each tire
	// 0 : front left, 1: front right, 2 :
	this.linearVelocities = [];

	// updated each turn (see updateData) this is the 1-length
	// vector in world ref, corresponding to the pilot look straight ahead.
	this.currentRightForwards = [];

	this.isIA = isIA;

	// Steering mgmt
	this.lockAngleDeg = this.configuration.wheelMaxAngle;

	//from lock to lock in 0.5 sec
	this.turnSpeedPerSec = this.configuration.steeringWheelSpeed * this.consts.DEGTORAD;
	this.turnPerTimeStep = this.turnSpeedPerSec / 60;
	this.desiredAngle = 0;
	this.adherenceFactor = 1;


	this.adherence = true;
	this.puddleEffect = 0;


	this.checkPointManager = null;


//  /       \ /      |/  |  /  |/      |
//  $$$$$$$  |$$$$$$/ $$ |  $$ |$$$$$$/
//  $$ |__$$ |  $$ |  $$  \/$$/   $$ |
//  $$    $$/   $$ |   $$  $$<    $$ |
//  $$$$$$$/    $$ |    $$$$  \   $$ |
//  $$ |       _$$ |_  $$ /$$  | _$$ |_
//  $$ |      / $$   |$$ |  $$ |/ $$   |
//  $$/       $$$$$$/ $$/   $$/ $$$$$$/

	this.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(Cars[carIndex].sprite));
	this.pixiSprite.anchor.x  = 0.5;
	this.pixiSprite.anchor.y = 0.5;
	this.pixiSprite.scale.x = 1;
	this.pixiSprite.scale.y = 1;
}

// param:  box2dData = {carBody : carBody, rearTires : carRearTires,
//	frontTires : carFrontTires, directionJoints : dirJoints}
Car.prototype.SetBox2dData = function(box2dData)
{
	this.b2Body = box2dData.carBody;
	this.rearTires = box2dData.rearTires;
	this.frontTires = box2dData.frontTires;
	this.tiresCount = this.tires.length;
	this.directionJoints = box2dData.directionJoints;
	if(typeof this.directionJoints[0] !== 'undefined')
	{
		this.directionJoints[0].SetLimits(0, 0);
		this.directionJoints[1].SetLimits(0, 0);
	}
};


Car.prototype.SetPosition = function(chosenPosition)
{

	var temp = chosenPosition.Copy();
	temp.Add(this.b2Body.GetPosition());
	this.b2Body.SetPosition(temp);

	for (var i = 0; i < this.tiresCount; i++)
	{
		temp = chosenPosition.Copy();
		temp.Add(this.tires[i].GetPosition());
		this.tires[i].SetPosition(temp);
	}
}

Car.prototype.updateData = function (keyboardData)
{
	//console.log(keyboardData);
	//compute velocity which is used several times per turn

	this.LocalAccelerationVector = new Box2D.Common.Math.b2Vec2(0, -this.accelerationFactor);


	for (var i = 0; i < this.tiresCount; i++) {
		this.linearVelocities[i] = this.GetLinearVelocity(i);
		this.currentRightForwards[i] = this.tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
		this.vCurrentRightNormals[i] = this.GetLateralVelocity(i);
	}
	//this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(0, 1));

	if (keyboardData.accelerate) this.Accelerate();
	if (keyboardData.handbrake) this.HandBrake();
	else this.HandBrakeRelease();
	if(keyboardData.brake)
		this.Brake();

	this.UpdateSteering(keyboardData);

};

Car.prototype.UpdateSteering = function(keyboardData)
{

	//control steering
	if (keyboardData.right && this.puddleEffect === 0) this.desiredAngle =  this.lockAngleDeg * this.consts.DEGTORAD;
	else if (keyboardData.left && this.puddleEffect === 0) this.desiredAngle = -this.lockAngleDeg * this.consts.DEGTORAD;
	else this.desiredAngle = 0;

	var angleNow = this.directionJoints[0].GetJointAngle();

	var angleToTurn = this.desiredAngle - angleNow;
	if(Math.abs(angleNow) > this.lockAngleDeg)
		angleToTurn = -angleNow;
	else
		angleToTurn = b2Math.Clamp( angleToTurn, -this.turnPerTimeStep, this.turnPerTimeStep );
	var newAngle = angleNow + angleToTurn;
	this.directionJoints[0].SetLimits( newAngle, newAngle );
	this.directionJoints[1].SetLimits( newAngle, newAngle );

	this.UpdateFriction();
	var position = this.b2Body.GetPosition();
	//console.log(position);
	this.pixiSprite.position.x = position.x * this.consts.METER;
	this.pixiSprite.position.y = position.y * this.consts.METER;
	this.pixiSprite.rotation = this.b2Body.GetAngle();

	//this.previousKeyboardData = keyboardData;
};


Car.prototype.Accelerate = function ()
{
	for (var i = 0; i < this.tiresCount; i++)
	{
		this.tires[i].ApplyForce(this.tires[i].GetWorldVector(this.LocalAccelerationVector), this.tires[i].GetWorldCenter());
	}

};
Car.prototype.Brake = function ()
{
	for (var i = 0; i < this.tiresCount; i++)
	{
		this.tires[i].ApplyForce(this.tires[i].GetWorldVector(this.LocalBrakeVector), this.tires[i].GetWorldCenter());
	}
};

Car.prototype.HandBrake = function ()
{
	for (var i = 0; i < this.tiresCount; i++)
	{
		this.tires[i].ApplyForce(this.tires[i].GetWorldVector(this.LocalHandBrakeVector), this.tires[i].GetWorldCenter());
		this.drifting = true;
	}
};
Car.prototype.HandBrakeRelease = function ()
{
	this.drifting = false;
};

Car.prototype.NegateTorque = function(tireIndex)
{
	return b2.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
};

Car.prototype.GetLateralVelocity = function (tireIndex)
{
	var currentRightNormal = this.tires[tireIndex].GetWorldVector(this.LocalNormalVector);
	var vCurrentRightNormal = b2.math.MulFV(b2.math.Dot(currentRightNormal, this.linearVelocities[tireIndex]), currentRightNormal);
	//if(tireIndex===0) console.log(vCurrentRightNormal);
	return vCurrentRightNormal;
};

Car.prototype.GetLinearVelocity = function(tireIndex)
{
	 return this.tires[tireIndex].GetLinearVelocity();
};

Car.prototype.GetForwardVelocity = function (tireIndex)
{
	var vCurrentRightForward = b2.math.MulFV(b2.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]), this.currentRightForwards[tireIndex]);
	return vCurrentRightForward;
};

Car.prototype.ApplyImpulse = function(vec2)
{
	for (var i = 0; i < this.tiresCount; i++)
	{
		this.tires[i].ApplyImpulse(vec2, this.tires[i].GetWorldCenter());
	}
};

Car.prototype.UpdateFriction = function ()
{
	for (var i = 0; i < this.tiresCount; i++)
	{
		if(this.adherence)
		{
			if(this.tires[i].customProperties[1].bool && this.drifting)
				this.adherenceFactor = 0.2;
			else
				this.adherenceFactor = 1;
			// Prevent car from sliding. Let it slide where lateral velocity is high (drift);
			var impulse = b2.math.MulFV(- this.adherenceFactor * this.tires[i].GetMass(), this.vCurrentRightNormals[i]);

			if (impulse.Length() > this.Drift_trigger)
			{
				impulse  = b2.math.MulFV(this.Drift_trigger / impulse.Length(), impulse);
			}
			this.tires[i].ApplyImpulse(impulse, this.tires[i].GetWorldCenter());
		}

		// what does this do ???
		var inertia = this.tires[i].GetInertia();
		var vel = this.tires[i].GetAngularVelocity();
		this.tires[i].ApplyAngularImpulse(10 * inertia * -vel);


		// natural friction against movement. This is a F = -kv type force.
		var currentForwardNormal = this.GetForwardVelocity(i);
		var currentForwardSpeed = currentForwardNormal.Normalize();
		var dragForceMagnitude = -this.configuration.natural_deceleration * currentForwardSpeed;
		this.tires[i].ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), this.tires[i].GetWorldCenter() );

		// here we update how the car behave when its puddleEffect is on (sliding on a paddle).
		if(this.puddleEffect !== 0)
		{
			this.tires[i].ApplyTorque(this.puddleEffect * this.configuration.puddleFactor);
		}
	}
};