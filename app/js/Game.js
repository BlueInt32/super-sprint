function Game()
{
	var me = this;

	this.STAGE_WIDTH = window.innerWidth;
	this.STAGE_HEIGHT = window.innerHeight;

	// Pixi's
	this.stage;
	this.renderer;
	this.assetsLoader;

	// Box2d's
	this.physics;

	//#region Load
	this.LoadPixi = function ()
	{
		/// PIXI
		me.stage = new PIXI.Stage(0xFFFFFF); // create an new instance of a pixi stage
		me.renderer = PIXI.autoDetectRenderer(me.STAGE_WIDTH, me.STAGE_HEIGHT, null, false, true); // create a renderer instance.
		document.getElementById('game').appendChild(me.renderer.view);// add the renderer view element to the DOM

		me.assetsLoader = new PIXI.AssetLoader(["content/images/car.png"]);
		me.assetsLoader.onComplete = me.PixiLoaded;
		me.assetsLoader.load();
	}

	//#endregion

	//#region AssetsLoaded 

	this.PixiLoaded = function()
	{
		// Create the car pixi element
		me.carTexture = PIXI.Texture.fromFrame("content/images/car.png");
		me.car = new Car(me.carTexture);


		//Create the physics involved
		me.physics = new Physics();
		me.physics.createBody(me.STAGE_WIDTH, 30, 0, me.STAGE_HEIGHT, me.physics.b2Body.b2_staticBody); // wall
		me.car.body = me.physics.createBody(50, 50, me.STAGE_WIDTH / 2, me.STAGE_HEIGHT / 2, me.physics.b2Body.b2_dynamicBody); // car
		//me.force = new me.physics.b2Vec2(0, 1);
		console.log(me.car.body.m_xf.position.y);

		requestAnimFrame(me.animate);

		me.stage.addChild(me.car);

		me.keyboardHandler = new KeyboardHandler();
		document.onkeydown = me.keyboardHandler.HandleKeyDown.bind(me.keyboardHandler);
		document.onkeyup = me.keyboardHandler.HandleKeyUp.bind(me.keyboardHandler);

		this.log = function(elId, val)
		{
			document.getElementById(elId).innerHTML = val;
		};
	};
	//#endregion

	//#region animate 
	this.animate = function ()
	{
		if (me.keyboardHandler.Keys.accelerate)
		{
			me.car.Accelerate();
		}
		else if (me.keyboardHandler.Keys.brake)
		{
			me.car.Brake();
		}
		else
		{
			me.car.Decelerate();
		}
		if (me.keyboardHandler.Keys.left)
		{
			me.car.TurnLeft();
		}
		if (me.keyboardHandler.Keys.right)
		{
			me.car.TurnRight();
		}
		me.car.updateData();
		requestAnimFrame(me.animate);

		me.log("speed", me.car.speedValue);
		me.log("rotation", me.car.rotation);
		me.renderer.render(me.stage);
		me.physics.updateElements(me.car);
	};
	//#endregion

	//#region log 
	this.log = function (elId, val)
	{
		if (document.getElementById(elId) == null)
		{
			var span = document.createElement("span");
			span.setAttribute("id", elId);
			span.innerHtml = val;
			// l'ajoute à la fin du corps du document
			document.getElementById("info").appendChild(span);
		}
		document.getElementById(elId).innerHTML = val;
	};
	//#endregion
}

var superSprintGame = new Game();
superSprintGame.LoadPixi();