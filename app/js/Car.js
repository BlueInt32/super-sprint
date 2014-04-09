'use strict';

function Car(consts)
{
	this.METER = consts.METER;
	this.carBodyDef = new b2.dyn.b2BodyDef();
	this.b2Body;
	this.CAR_WIDTH_B2 = 32 / this.METER;
	this.CAR_HEIGHT_B2 = 16 / this.METER;
	this.CAR_ROTATE_FACTOR = 0.2;

	this.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(Sprites.car));
	this.pixiSprite.anchor.x  = 0.5;
	this.pixiSprite.anchor.y = 0.5;
	this.pixiSprite.scale.x = 1;
	this.pixiSprite.scale.y = 1;


	this.carFixture = new b2.dyn.b2FixtureDef();
	this.carFixture.shape = new b2.shapes.b2PolygonShape();
	this.carFixture.density = 1;
	this.carFixture.restitution = 0;


	this.vCurrentRightNormal;

};
Car.prototype.createb2Body = function (b2Helper, x, y)
{
	this.carBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	this.carBodyDef.position.Set(x, y);
	this.carBodyDef.angle = 0;

	this.b2Body = b2Helper.world.CreateBody(this.carBodyDef);

	var s = MathUtil.rndRange(50, 100);
	this.carFixture.shape.SetAsBox(this.CAR_WIDTH_B2, this.CAR_HEIGHT_B2);
	this.b2Body.CreateFixture(this.carFixture);

}


Car.prototype.updateData = function (keyboardData)
{
	//console.log(keyboardData);
	if (keyboardData.accelerate)
		this.Accelerate();
	//else if (b2.math.Dot(this.b2Body.GetLinearVelocity(), this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(1, 0))) > 0)
	//	this.Decelerate();
	if (keyboardData.brake) this.Brake();
	if (keyboardData.right) this.TurnRight();
	else if (keyboardData.left) this.TurnLeft();

	this.vCurrentRightNormal = this.GetLateralVelocity();


	this.UpdateFriction();

	var position = this.b2Body.GetPosition();
	this.pixiSprite.position.x = position.x * this.METER;
	this.pixiSprite.position.y = position.y * this.METER;
	this.pixiSprite.rotation = this.b2Body.GetAngle();

};

Car.prototype.Accelerate = function ()
{
	this.b2Body.ApplyForce(this.b2Body.GetWorldVector(new Box2D.Common.Math.b2Vec2(1.4, 0)), this.b2Body.GetWorldCenter());
};
Car.prototype.Brake = function ()
{
	this.b2Body.ApplyForce(this.b2Body.GetWorldVector(new Box2D.Common.Math.b2Vec2(-1, 0)), this.b2Body.GetWorldCenter());
};

Car.prototype.TurnLeft = function ()
{
	
	this.b2Body.ApplyTorque(-this.CAR_ROTATE_FACTOR * this.NegateTorque());
};
Car.prototype.TurnRight = function ()
{
	this.b2Body.ApplyTorque(this.NegateTorque() * this.CAR_ROTATE_FACTOR);
};

Car.prototype.NegateTorque = function()
{
	var currentRightForward = this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(1, 0));
	return b2.math.Dot(currentRightForward, this.b2Body.GetLinearVelocity()) < 0 ? -1 : 1;
}

Car.prototype.GetLateralVelocity = function ()
{
	var currentRightNormal = this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(0, 1));
	var vCurrentRightNormal = b2.math.MulFV(b2.math.Dot(currentRightNormal, this.b2Body.GetLinearVelocity()), currentRightNormal);
	return vCurrentRightNormal;
};

Car.prototype.GetForwardVelocity = function ()
{
	var currentRightForward = this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(1, 0));
	
	var vCurrentRightForward = b2.math.MulFV(b2.math.Dot(currentRightForward, this.b2Body.GetLinearVelocity()), currentRightForward);

	return vCurrentRightForward;
};


Car.prototype.UpdateFriction = function ()
{
	var maxLateralImpulse = 0.035;

	var impulse = b2.math.MulFV(-this.b2Body.GetMass(), this.vCurrentRightNormal);
	//console.log(impulse.Length());
	if (impulse.Length() > maxLateralImpulse )
    	impulse  = b2.math.MulFV(maxLateralImpulse / impulse.Length(), impulse);

	this.b2Body.ApplyImpulse(impulse, this.b2Body.GetWorldCenter());

	var inertia = this.b2Body.GetInertia();
	var vel = this.b2Body.GetAngularVelocity();
	this.b2Body.ApplyAngularImpulse(0.1 * this.b2Body.GetInertia() * -vel);

	var currentForwardNormal = this.GetForwardVelocity();
	var currentForwardSpeed = currentForwardNormal.Normalize();
	// document.getElementById("info").innerHTML = currentForwardSpeed;

	var dragForceMagnitude = -0.2 * currentForwardSpeed;
	this.b2Body.ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), this.b2Body.GetWorldCenter() );
};

