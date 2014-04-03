function Game()
{
	var self = this;
	this.Load = function ()
	{


		/// PIXI

		const STAGE_WIDTH = window.innerWidth, STAGE_HEIGHT = window.innerHeight;
		self.stage = new PIXI.Stage(0xFFFFFF); // create an new instance of a pixi stage
		self.renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, null, false, true); // create a renderer instance.
		document.getElementById('game').appendChild(self.renderer.view);// add the renderer view element to the DOM

		const loader = new PIXI.AssetLoader(["content/images/car.png"]);
		loader.onComplete = self.AssetsLoaded;
		loader.load();
	}
	this.animate = function ()
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
	this.AssetsLoaded = function ()
	{

		/// MATTER WORLD CREATION
		var Engine = Matter.Engine,
			World = Matter.World,
			Body = Matter.Body,
			Bodies = Matter.Bodies,
			Constraint = Matter.Constraint,
			Composites = Matter.Composites,
			MouseConstraint = Matter.MouseConstraint;

		// create a Matter.js engine
		var engine = Engine.create(document.getElementById('game'), {
			//render: 
			//{
			//	options: {
			//		wireframes: false,
			//		background: 'http://brm.io/matter-js-demo/img/wall-bg.jpg'
			//	}
			//}
		});

		// Create walls
		var offset = 10,
			wallOptions = {
				isStatic: true,
				render: {
					visible: true
				}
			};

		// add some invisible some walls to the world
		World.add(engine.world,
		[
			Bodies.rectangle(400, -offset, 800 + 2 * offset, 50, wallOptions),
			Bodies.rectangle(400, 600 + offset, 800 + 2 * offset, 50, wallOptions),
			Bodies.rectangle(800 + offset, 300, 50, 600 + 2 * offset, wallOptions),
			Bodies.rectangle(-offset, 300, 50, 600 + 2 * offset, wallOptions)
		]);



		requestAnimFrame(self.animate);

		// create a texture from an image path
		self.carTexture = PIXI.Texture.fromFrame("content/images/car.png");
		// create a new Sprite using the texture
		self.car = new Car(self.carTexture);
		self.stage.addChild(self.car);

		self.keyboardHandler = new KeyboardHandler();
		document.onkeydown = self.keyboardHandler.HandleKeyDown.bind(self.keyboardHandler);
		document.onkeyup = self.keyboardHandler.HandleKeyUp.bind(self.keyboardHandler);

		this.log = function (elId, val)
		{
			document.getElementById(elId).innerHTML = val;
		};
	}
	this.log = function (elId, val)
	{
		document.getElementById(elId).innerHTML = val;
	};
}

var superSprintGame = new Game();
superSprintGame.Load();