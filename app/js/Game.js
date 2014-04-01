function Game()
{
	var self = this;
	// create an new instance of a pixi stage
	this.stage = new PIXI.Stage(0xFFFFFF);

	// create a renderer instance.
	this.renderer = PIXI.autoDetectRenderer(800, 600);

	// add the renderer view element to the DOM
	document.getElementById('game').appendChild(this.renderer.view);

	this.animate = function()
	{
		requestAnimFrame(self.animate);
		var d = new Date();
		// just for fun, lets rotate mr rabbit a little
		//car.rotation += 0.01;
		self.car.position.y -= self.car.speed;
		// render the stage
		self.renderer.render(self.stage);
		for (var i = 0; i < 500 ;i++)
		{
			console.log(self);
		}
		var d2 = new Date() -d;
		document.getElementById('fps').innerHTML = d2;
	}

	requestAnimFrame(this.animate);

	// create a texture from an image path
	this.carTexture = PIXI.Texture.fromImage("content/images/car.png");
	// create a new Sprite using the texture
	this.car = new Car(this.carTexture);
	this.stage.addChild(this.car);


	document.addEventListener('keydown', function (event)
	{
		var key = event.which;
		switch (key)
		{
			case 37: break;
			case 38: car.speed += 0.05; break;
			case 39: break;
			case 40: break;
		}
	}, false);
}

var superSprint = new Game();