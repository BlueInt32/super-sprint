'use strict';

function Car(texture)
{
	PIXI.Sprite.call(this, texture);

	this.direction = 1;
	this.speed = 0;

	this.anchor.x = 0.5;
	this.anchor.y = 0.5;
	this.position.x = 400;
	this.position.y = 300;
};
Car.prototype = Object.create(PIXI.Sprite.prototype, {
	move: function ()
	{
		this.position.y += this.speed * this.direction;
	},

	setDirection: function (direction)
	{
		if (direction === 'left')
			this.direction = -1;
		else
			this.direction = 1;
	},
	//get direction() { return this.direction; }
});