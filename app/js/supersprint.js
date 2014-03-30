/// <reference path="../bower_components/pixi.js/pixi.dev.js" />

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0x66FF99);

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(800, 600);

// add the renderer view element to the DOM
document.getElementById('game').appendChild(renderer.view);

requestAnimFrame(animate);

// create a texture from an image path
var texture = PIXI.Texture.fromImage("content/images/car.png");
// create a new Sprite using the texture
var car = new PIXI.Sprite(texture);

// center the sprites anchor point
car.anchor.x = 0.5;
car.anchor.y = 0.5;

// move the sprite t the center of the screen
car.position.x = 400;
car.position.y = 500;

car.speed = 0;
car.friction = 0.03;

stage.addChild(car);

function animate()
{
	requestAnimFrame(animate);

	// just for fun, lets rotate mr rabbit a little
	//car.rotation += 0.01;
	car.position.y -= car.speed;
	// render the stage
	renderer.render(stage);
}

document.addEventListener('keydown', function (event)
{
	var key = event.which;
	switch (key)
	{
		case 37: break;
		case 38:car.speed += 0.05; break;
		case 39: break;
		case 40: break;
	}
}, false);
