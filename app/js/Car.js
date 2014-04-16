//'use strict';

function Car(consts, carIndex)
{
	this.CarConfig = Cars[carIndex];

	//this.previousKeyboardData = null;

	this.id = carIndex;
	this.METER = consts.METER;
	this.carBodyDef = new b2.dyn.b2BodyDef();
	this.b2Body = null;
	this.CAR_WIDTH_B2 = this.CarConfig.width / 2 / this.METER;
	this.CAR_HEIGHT_B2 = this.CarConfig.height / 2 / this.METER;

	this.Current_Drift_trigger = this.CarConfig.driftTrigger;


	this.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(Cars[carIndex].sprite));
	this.pixiSprite.anchor.x  = 0.5;
	this.pixiSprite.anchor.y = 0.5;
	this.pixiSprite.scale.x = 1;
	this.pixiSprite.scale.y = 1;

	this.adherence = true;
	this.paddleEffect = 0;

	this.carFixture = new b2.dyn.b2FixtureDef();
	this.carFixture.shape = new b2.shapes.b2PolygonShape();
	this.carFixture.density = 1;
	this.carFixture.restitution = this.CarConfig.restitution;


	this.vCurrentRightNormal = null;

	this.linearVelocity = null; // updated each turn (see updateData) this is the (vx, vy) vector in world ref.
	this.currentRightForward = null; // updated each turn (see updateData) this is the 1-length vector in world ref, corresponding to the pilot look straight ahead.

	this.checkPointManager = null;

}

Car.prototype.createb2Body = function (b2Universe, x, y)
{

	this.carBodyDef.position.Set(x, y);
	this.carBodyDef.angle = 0;

	this.b2Body = b2Universe.world.CreateBody(this.carBodyDef);

	var s = MathUtil.rndRange(50, 100);
	this.carFixture.shape.SetAsBox(this.CAR_WIDTH_B2, this.CAR_HEIGHT_B2);
	var carFixture = this.b2Body.CreateFixture(this.carFixture);
	carFixture.SetUserData("car");

};

Car.prototype.updateData = function (keyboardData)
{
	//compute velocity which is used several times per turn
	this.linearVelocity = this.b2Body.GetLinearVelocity();
	this.currentRightForward = this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(1, 0));

	//console.log(keyboardData);
	if (keyboardData.accelerate) this.Accelerate();
	//else if (b2.math.Dot(this.b2Body.GetLinearVelocity(), this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(1, 0))) > 0)
	//	this.Decelerate();
	if (keyboardData.handbrake)
		this.HandBrake();
	else
		this.HandBrakeRelease();
	if(keyboardData.brake)
		this.Brake();
	if (keyboardData.right && this.paddleEffect === 0) this.TurnRight();
	else if (keyboardData.left && this.paddleEffect === 0) this.TurnLeft();

	this.vCurrentRightNormal = this.GetLateralVelocity();


	this.UpdateFriction();

	var position = this.b2Body.GetPosition();
	this.pixiSprite.position.x = position.x * this.METER;
	this.pixiSprite.position.y = position.y * this.METER;
	this.pixiSprite.rotation = this.b2Body.GetAngle();

	//this.previousKeyboardData = keyboardData;
};

Car.prototype.Accelerate = function ()
{
	this.b2Body.ApplyForce(this.b2Body.GetWorldVector(new Box2D.Common.Math.b2Vec2(this.CarConfig.accelerationFactor, 0)), this.b2Body.GetWorldCenter());
};
Car.prototype.Brake = function ()
{
	this.b2Body.ApplyForce(this.b2Body.GetWorldVector(new Box2D.Common.Math.b2Vec2(this.CarConfig.accelerationFactor / -3, 0)), this.b2Body.GetWorldCenter());
};

Car.prototype.HandBrake = function ()
{
	this.b2Body.ApplyForce(this.b2Body.GetWorldVector(new Box2D.Common.Math.b2Vec2(this.CarConfig.accelerationFactor / -4, 0)), this.b2Body.GetWorldCenter());
	this.Current_Drift_trigger = this.CarConfig.driftTriggerWithHandbrake;
};
Car.prototype.HandBrakeRelease = function ()
{
	this.Current_Drift_trigger = this.CarConfig.driftTrigger;
};

Car.prototype.TurnLeft = function ()
{

	this.b2Body.ApplyTorque(-this.CarConfig.rotateFactor * this.NegateTorque());
};
Car.prototype.TurnRight = function ()
{
	this.b2Body.ApplyTorque(this.NegateTorque() * this.CarConfig.rotateFactor);
};

Car.prototype.NegateTorque = function()
{

	return b2.math.Dot(this.currentRightForward, this.linearVelocity) < -0.01 ? -1 : 1;
};

Car.prototype.GetLateralVelocity = function ()
{
	var currentRightNormal = this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(0, 1));
	var vCurrentRightNormal = b2.math.MulFV(b2.math.Dot(currentRightNormal, this.linearVelocity), currentRightNormal);
	return vCurrentRightNormal;
};

Car.prototype.GetForwardVelocity = function ()
{
	var vCurrentRightForward = b2.math.MulFV(b2.math.Dot(this.currentRightForward, this.linearVelocity), this.currentRightForward);
	return vCurrentRightForward;
};


Car.prototype.UpdateFriction = function ()
{
	if(this.adherence)
	{
		// Prevent car from sliding. Let it slide where lateral velocity is high (drift);
		var impulse = b2.math.MulFV(-this.b2Body.GetMass(), this.vCurrentRightNormal);
		//console.log(impulse.Length());
		if (impulse.Length() > this.Current_Drift_trigger)
			impulse  = b2.math.MulFV(this.Current_Drift_trigger / impulse.Length(), impulse);
		this.b2Body.ApplyImpulse(impulse, this.b2Body.GetWorldCenter());
	}



	var inertia = this.b2Body.GetInertia();
	var vel = this.b2Body.GetAngularVelocity();
	this.b2Body.ApplyAngularImpulse(0.1 * this.b2Body.GetInertia() * -vel);


	// natural friction against movement. This is a F = -kv type force.
	var currentForwardNormal = this.GetForwardVelocity();
	var currentForwardSpeed = currentForwardNormal.Normalize();
	var dragForceMagnitude = -this.CarConfig.natural_deceleration * currentForwardSpeed;
	this.b2Body.ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), this.b2Body.GetWorldCenter() );


	// here we update how the car behave when its paddleEffect is on (sliding on a paddle).
	if(this.paddleEffect !== 0)
	{
		this.b2Body.ApplyTorque(this.paddleEffect * this.CarConfig.rotateFactor);
	}
};

