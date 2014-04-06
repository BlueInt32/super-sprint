'use strict';

function Car(texture)
{
	PIXI.Sprite.call(this, texture);

	this.rotation = 0;
	this.anchor.x = 0.5;
	this.anchor.y = 0.2;
	this.position.x = 400;
	this.position.y = 300;
	this.direction = new Vec2(0,1);
	this.accelerationValue = 0.02;
	this.speedValue = 0.1;
	this.rotationSpeedFactor = 0.5;
	this.rotationInnerSpeedFactor = 0.1;
	this.frictionValue = 0.01;
	this.brakeValue = 0.1;
};

Car.prototype.direction = new Vec2(0, 1);

Car.prototype = Object.create(PIXI.Sprite.prototype);
Car.prototype.updateData = function ()
{
	this.rotationSpeedValue = this.rotationSpeedFactor * Math.log(this.rotationInnerSpeedFactor * this.speedValue + 1) * Math.exp(-this.rotationInnerSpeedFactor * this.speedValue);

	if (this.speedValue < 0.01) this.speedValue = 0;
	this.direction.x = Math.cos(this.rotation);
	this.direction.y = Math.sin(this.rotation);
	var speedV = this.direction;
	//console.log(this.direction);
	vMath.mulS(speedV, this.speedValue);
	//console.log(speedV);
	this.position.x = this.position.x + speedV.x;
	this.position.y = this.position.y + speedV.y;
	//console.log(this.position);

	//throw "Erreur2";
};

Car.prototype.Accelerate = function()
{
	this.speedValue += this.accelerationValue;
};
Car.prototype.Brake = function()
{
	this.speedValue -= this.speedValue > 0 ? this.brakeValue : 0;
};
Car.prototype.Decelerate = function()
{
	this.speedValue -= this.speedValue > 0 ? this.frictionValue : 0;
};

Car.prototype.TurnLeft = function()
{
	this.rotation -= this.rotationSpeedValue;
};
Car.prototype.TurnRight = function ()
{
	this.rotation += this.rotationSpeedValue;
};
