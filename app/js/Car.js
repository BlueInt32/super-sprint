'use strict';

SuperSprintCar.prototype =  Object.create(PIXI.Sprite.prototype);
SuperSprintCar.prototype.constructor = SuperSprintCar;
function SuperSprintCar(texture)
{
	PIXI.Sprite.call(this, texture);
	//PIXI.Sprite.prototype.texture = texture;
	console.log('car instantiated');

	//PIXI.Sprite.call(texture);
	console.log(PIXI.Sprite.prototype);
	// center the sprites anchor point
	PIXI.Sprite.prototype.anchor.x = 0.5;
	PIXI.Sprite.prototype.anchor.y = 0.5;

	// move the sprite t the center of the screen
	PIXI.Sprite.prototype.position.x = 400;
	PIXI.Sprite.prototype.position.y = 500;

	this.speed = 0;
	this.friction = 0.03;
}

SuperSprintCar.prototype.speed = 0;
SuperSprintCar.prototype.friction = 0.03;