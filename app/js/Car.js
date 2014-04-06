'use strict';

function Car(renderer)
{
	var me = this;
	this.PiSurDeux = Math.PI / 2;
	this.direction = Physics.vector(1, 0);
	this.speed = 0;

<<<<<<< HEAD
	this.body = Physics.body('convex-polygon', {
		// place the center of the square at (0, 0)
		x: 100,
		y: 100,
		vertices: [
			{ x: 0, y: 0 },
			{ x: 0, y: 32 },
			{ x: 64, y: 32 },
			{ x: 64, y: 0 }
		]
	});
=======
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

	// box2d properties
	this.body;
};
>>>>>>> origin/master

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
	//this.body.state.vel = this.body.state.vel.proj(this.direction);
	this.direction = Physics.vector(Math.cos(this.body.state.angular.pos), Math.sin(this.body.state.angular.pos));
	//console.log(this.direction);
	if (keyboardData.accelerate) this.Accelerate();
	else this.Decelerate();

	if (keyboardData.brake) this.Brake();
	if (keyboardData.right) this.TurnRight();
	else if (keyboardData.left) this.TurnLeft();


	document.getElementById("info").innerHTML = this.direction/*.state.vel.x + " " + this.body.state.vel.y*/;
	//var lateralSpeed = this.GetLateralVelocity();
	this.UpdateFriction();
	//document.getElementById("info2").innerHTML = this.body.state.vel/*.state.vel.x + " " + this.body.state.vel.y*/;
};

Car.prototype.Accelerate = function()
{
	//this.body.applyForce(this.direction.mult(0.002));

	this.body.accelerate(this.direction.mult(0.001));

};
Car.prototype.Brake = function()
{
	this.body.accelerate(this.direction.mult(-0.001));
};
Car.prototype.Decelerate = function()
{
	//this.body.accelerate(this.direction.mult(-0.001));
};

Car.prototype.TurnLeft = function()
{
	this.body.state.angular.pos = this.body.state.angular.pos - 0.0001;
	//this.body.applyForce(this.direction.mult(0.0001).perp(false), Physics.vector(64, 0));
	//this.body.applyForce(
};
Car.prototype.TurnRight = function ()
{

	this.body.state.angular.pos = this.body.state.angular.pos + 0.0001;
	//this.body.applyForce(this.direction.mult(0.0001).perp(true), Physics.vector(64, 32));
};

Car.prototype.GetLateralVelocity = function()
{
	var scratch = Physics.scratchpad();
	var currentRightNormal = Physics.vector(Math.cos(this.body.state.angular.pos + this.PiSurDeux), Math.sin(this.body.state.angular.pos + this.PiSurDeux));
	
	//console.log(this.body.state.vel);
	var speed = scratch.vector(this.body.state.vel);
	//console.log(this.body.state.vel);
	//document.getElementById("info2").innerHTML = this.body.state.vel;
		scratch.done();
		return currentRightNormal.mult(this.body.state.vel.dot(currentRightNormal));
};

Car.prototype.UpdateFriction = function()
{
	var scratch = Physics.scratchpad();
	var lateralVelocity = scratch.vector(this.GetLateralVelocity());
	
	var forceApplied = lateralVelocity.mult(this.body.mass * -0.000001);
	document.getElementById("info").innerHTML = lateralVelocity/*.state.vel.x + " " + this.body.state.vel.y*/;
	//this.body.accelerate(forceApplied);
	//b2Vec2 impulse = m_body->GetMass() * -getLateralVelocity();
	//m_body->ApplyLinearImpulse( impulse, m_body->GetWorldCenter() );
	scratch.done();
};
