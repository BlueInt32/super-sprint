'use strict';

function Car(consts)
{
	//console.log("ctor Car");

	this.carBodyDef = new b2.dyn.b2BodyDef();
	this.b2Body;
	this.CAR_WIDTH_B2 = 64 / consts.METER;
	this.CAR_HEIGHT_B2 = 32 / consts.METER;
	this.CAR_ROTATE_FACTOR = 1;

	this.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(Sprites.car));
	this.pixiSprite.anchor.x = this.pixiSprite.anchor.y = 0.5;
	this.pixiSprite.scale.x = 1;
	this.pixiSprite.scale.y = 1;

};
Car.prototype.createb2Body = function (b2Helper, x, y)
{
	this.carBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	this.carBodyDef.position.Set(x, y);
	this.carBodyDef.angle = 0;

	this.b2Body = b2Helper.world.CreateBody(this.carBodyDef);

	var s = MathUtil.rndRange(50, 100);
	b2Helper.baseFixture.shape.SetAsBox(this.CAR_WIDTH_B2, this.CAR_HEIGHT_B2);
	this.b2Body.CreateFixture(b2Helper.baseFixture);

}


Car.prototype.updateData = function (keyboardData)
{
	//console.log(keyboardData);
	if (keyboardData.accelerate)
		this.Accelerate();
	else if (b2.math.Dot(this.body.GetLinearVelocity(), this.body.GetWorldVector(new Box2D.Common.Math.b2Vec2(1, 0))) > 0)
		this.Decelerate();
	if (keyboardData.brake) this.Brake();
	if (keyboardData.right) this.TurnRight();
	else if (keyboardData.left) this.TurnLeft();

	this.vCurrentRightNormal = this.GetLateralVelocity();


	document.getElementById("info").innerHTML = this.direction;
	this.UpdateFriction();
};

Car.prototype.Accelerate = function ()
{
	this.body.ApplyForce(this.body.GetWorldVector(new Box2D.Common.Math.b2Vec2(1, 0)), this.body.GetWorldCenter());

};
Car.prototype.Brake = function ()
{
	this.body.ApplyForce(this.body.GetWorldVector(new Box2D.Common.Math.b2Vec2(-1, 0)), this.body.GetWorldCenter());
};
Car.prototype.Decelerate = function ()
{
	this.body.ApplyForce(this.body.GetWorldVector(new Box2D.Common.Math.b2Vec2(-0.2, 0)), this.body.GetWorldCenter());
};

Car.prototype.TurnLeft = function ()
{
	this.body.ApplyTorque(-0.1);
};
Car.prototype.TurnRight = function ()
{
	this.body.ApplyTorque(0.1);
};

Car.prototype.GetLateralVelocity = function ()
{
	var currentRightNormal = this.body.GetWorldVector(new Box2D.Common.Math.b2Vec2(0, 1));

	var vCurrentRightNormal = b2.math.MulFV(b2.math.Dot(currentRightNormal, this.body.GetLinearVelocity()), currentRightNormal);
	//console.log(vCurrentRightNormal);
	return vCurrentRightNormal;
};

Car.prototype.UpdateFriction = function ()
{
	var impulse = b2.math.MulFV(-this.body.GetMass(), this.vCurrentRightNormal);
	this.body.ApplyImpulse(impulse, this.body.GetWorldCenter());
};