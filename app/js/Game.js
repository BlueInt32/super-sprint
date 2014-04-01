function Game()
{
	var self = this;
	// create an new instance of a pixi stage
	this.stage = new PIXI.Stage(0xFFFFFF);

	// create a renderer instance.
	this.renderer = PIXI.autoDetectRenderer(800, 600);

	// add the renderer view element to the DOM
	document.getElementById('game').appendChild(this.renderer.view);

	this.keyboardHandler = new KeyboardHandler();

	this.animate = function()
	{
		if (self.keyboardHandler.Keys.accelerate)
		{
			self.car.Accelerate();
		} else if (self.keyboardHandler.Keys.brake)
		{
			self.car.Brake();
		}
		else
		{
			self.car.Decelerate();
		}
		if (self.keyboardHandler.Keys.left)
		{
			self.car.TurnLeft();
		}
		if (self.keyboardHandler.Keys.right)
		{
			self.car.TurnRight();
		}
		//console.log(self.car);
		self.car.updateData();
		requestAnimFrame(self.animate);
		
		self.log("speed", self.car.speedValue);
		self.log("rotation", self.car.rotation);
		// just for fun, lets rotate mr rabbit a little
		//self.car.rotation += 0.01;
		// render the stage
		self.renderer.render(self.stage);
	};

	requestAnimFrame(this.animate);

	// create a texture from an image path
	this.carTexture = PIXI.Texture.fromImage("content/images/car.png");
	// create a new Sprite using the texture
	this.car = new Car(this.carTexture);
	this.stage.addChild(this.car);

	document.onkeydown = self.keyboardHandler.HandleKeyDown.bind(self.keyboardHandler);
	document.onkeyup = self.keyboardHandler.HandleKeyUp.bind(self.keyboardHandler);
	//document.addEventListener('keydown', self.keyboardHandler.HandleKeyDown(event, self.keyboardHandler), false);
	//document.addEventListener('keyup', self.keyboardHandler.HandleKeyUp(event, self.keyboardHandler), false);

	this.log = function(elId, val)
	{
		document.getElementById(elId).innerHTML = val;
	};
}

var superSprint = new Game();