'use strict';

function Car(pixiStage)
{
	//console.log("Car creation");
	var pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame("Content/images/car.png"));
	var vCurrentRightNormal;

	pixiSprite.i = 0;
	pixiSprite.anchor.x = pixiSprite.anchor.y = 0.5;
	pixiSprite.scale.x = 1;
	pixiSprite.scale.y = 1;
	pixiStage.addChild(pixiSprite);
};

Car.prototype.createBody = function (bodyDef, world, polyFixture)
{
	//console.log("Car createBody");
	bodyDef.position.Set(Consts.STAGE_WIDTH / 2, Consts.STAGE_HEIGHT / 2);
	bodyDef.angle = 0;

	this.body = world.CreateBody(bodyDef);

	polyFixture.shape.SetAsBox(32 / Consts.METER, 16 / Consts.METER);
	this.body.CreateFixture(polyFixture);
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