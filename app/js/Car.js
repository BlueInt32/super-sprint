'use strict';

function Car(renderer)
{


	this.body.view = renderer.createDisplay('sprite', {
		texture: 'content/images/car.png',
		anchor: {
			x: 0.5,
			y: 0.5
		}
	});
};

Car.prototype.updateData = function (keyboardData)
{
	if (keyboardData.accelerate) this.Accelerate();
	else this.Decelerate();
	if (keyboardData.brake) this.Brake();
	if (keyboardData.right) this.TurnRight();
	else if (keyboardData.left) this.TurnLeft();


	document.getElementById("info").innerHTML = this.direction;
	this.UpdateFriction();
};

Car.prototype.Accelerate = function()
{

};
Car.prototype.Brake = function()
{
};
Car.prototype.Decelerate = function()
{
};

Car.prototype.TurnLeft = function()
{
};
Car.prototype.TurnRight = function ()
{
};

Car.prototype.GetLateralVelocity = function()
{
};

Car.prototype.UpdateFriction = function()
{
};
