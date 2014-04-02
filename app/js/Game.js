function Game()
{
	var self = this;


	/// MATTER
	var Engine = Matter.Engine,
		World = Matter.World,
		Body = Matter.Body,
		Bodies = Matter.Bodies,
		Constraint = Matter.Constraint,
		Composites = Matter.Composites,
		MouseConstraint = Matter.MouseConstraint;


	/// PIXI
	this.stage = new PIXI.Stage(0xFFFFFF); // create an new instance of a pixi stage
	this.renderer = PIXI.autoDetectRenderer(800, 600, null, false, true); // create a renderer instance.
	document.getElementById('game').appendChild(this.renderer.view);// add the renderer view element to the DOM


	this.animate = function()
	{
		if (self.keyboardHandler.Keys.accelerate)
		{
			self.car.Accelerate();
		}
		else if (self.keyboardHandler.Keys.brake)
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
		self.car.updateData();
		requestAnimFrame(self.animate);
		
		self.log("speed", self.car.speedValue);
		self.log("rotation", self.car.rotation);
		self.renderer.render(self.stage);
	};

	requestAnimFrame(this.animate);

	// create a texture from an image path
	this.carTexture = PIXI.Texture.fromImage("content/images/car.png");
	// create a new Sprite using the texture
	this.car = new Car(this.carTexture);
	this.stage.addChild(this.car);

	this.keyboardHandler = new KeyboardHandler();
	document.onkeydown = this.keyboardHandler.HandleKeyDown.bind(this.keyboardHandler);
	document.onkeyup = this.keyboardHandler.HandleKeyUp.bind(this.keyboardHandler);

	this.log = function(elId, val)
	{
		document.getElementById(elId).innerHTML = val;
	};
}

var superSprint = new Game();