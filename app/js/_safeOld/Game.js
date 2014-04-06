function Game()
{
	var self = this;
	this.Load = function()
	{
		/// PIXI
		self.STAGE_WIDTH = window.innerWidth;
		self.STAGE_HEIGHT = window.innerHeight;
		self.stage = new PIXI.Stage(0xFFFFFF); // create an new instance of a pixi stage
		self.renderer = PIXI.autoDetectRenderer(self.STAGE_WIDTH, self.STAGE_HEIGHT, null, false, true); // create a renderer instance.
		document.getElementById('game').appendChild(self.renderer.view); // add the renderer view element to the DOM

		loader = new PIXI.AssetLoader(["content/images/car.png"]);
		loader.onComplete = self.AssetsLoaded;
		loader.load();
	};
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
		self.box2dUpdate();
	};
	this.AssetsLoaded = function()
	{
		// box 2d web data !
		self.b2Vec2 = Box2D.Common.Math.b2Vec2;
		self.b2AABB = Box2D.Collision.b2AABB;
		self.b2BodyDef = Box2D.Dynamics.b2BodyDef;
		self.b2Body = Box2D.Dynamics.b2Body;
		self.b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
		self.b2Fixture = Box2D.Dynamics.b2Fixture;
		self.b2World = Box2D.Dynamics.b2World;
		self.b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
		self.b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

		self.worldScale = 1;

		self.world = new self.b2World(new self.b2Vec2(0, 10), true);

		//var canvasPosition = getElementPosition(document.getElementsByTagName("canvas")[0]);

		//self.debugDraw();             
		//window.setInterval(update,1000/60);


		self.createBox(self.STAGE_WIDTH, 30, 0, self.STAGE_HEIGHT, self.b2Body.b2_staticBody);
		self.carbody = self.createBox(50, 50, self.STAGE_WIDTH / 2, self.STAGE_HEIGHT / 2, self.b2Body.b2_dynamicBody);
		self.force = new self.b2Vec2(0, -100);
		console.log(self.carbody);

		requestAnimFrame(self.animate);

		// create a texture from an image path
		self.carTexture = PIXI.Texture.fromFrame("content/images/car.png");
		// create a new Sprite using the texture
		self.car = new Car(self.carTexture);
		self.stage.addChild(self.car);

		self.keyboardHandler = new KeyboardHandler();
		document.onkeydown = self.keyboardHandler.HandleKeyDown.bind(self.keyboardHandler);
		document.onkeyup = self.keyboardHandler.HandleKeyUp.bind(self.keyboardHandler);

		this.log = function(elId, val)
		{
			document.getElementById(elId).innerHTML = val;
		};
	};
	//this.debugDraw = function()
	//{
	//	var debugDraw = new self.b2DebugDraw();
	//	debugDraw.SetSprite(document.getElementsByTagName("canvas")[0].getContext("2d"));
		
	//	debugDraw.SetDrawScale(30.0);
	//	debugDraw.SetFillAlpha(0.5);
	//	debugDraw.SetLineThickness(1.0);
	//	debugDraw.SetFlags(self.b2DebugDraw.e_shapeBit | self.b2DebugDraw.e_jointBit);
	//	world.SetDebugDraw(debugDraw);
	//}
	this.createBox = function(width, height, pX, pY, type)
	{
		var bodyDef = new self.b2BodyDef;
		bodyDef.type = type;
		bodyDef.position.Set(pX / self.worldScale, pY / self.worldScale);
		//console.log(pX);
		var polygonShape = new self.b2PolygonShape;
		polygonShape.SetAsBox(width / 2 / self.worldScale, height / 2 / self.worldScale);
		var fixtureDef = new self.b2FixtureDef;
		fixtureDef.density = 1.0;
		fixtureDef.friction = 0.5;
		fixtureDef.restitution = 0.5;
		fixtureDef.shape = polygonShape;
		var body = self.world.CreateBody(bodyDef);
		var bodyFixture = body.CreateFixture(fixtureDef);
		return body;
	};

	this.box2dUpdate = function ()
	{
		self.world.Step(1 / 10, 10, 10);
		self.world.DrawDebugData();
		//self.world.ClearForces();
		//console.log(self.carbody.m_xf.position.y);
		self.car.position.y = self.carbody.m_xf.position.y;
		self.carbody.ApplyImpulse(self.force, self.carbody.m_xf.position);
	};

	//http://js-tut.aardon.de/js-tut/tutorial/position.html
	this.getElementPosition = function (element)
	{
		var elem = element, tagname = "", x = 0, y = 0;
		while ((typeof (elem) == "object") && (typeof (elem.tagName) != "undefined"))
		{
			y += elem.offsetTop;
			x += elem.offsetLeft;
			tagname = elem.tagName.toUpperCase();
			if (tagname == "BODY")
			{
				elem = 0;
			}
			if (typeof (elem) == "object")
			{
				if (typeof (elem.offsetParent) == "object")
				{
					elem = elem.offsetParent;
				}
			}
		}
		return { x: x, y: y };
	}

	this.log = function (elId, val)
	{
		document.getElementById(elId).innerHTML = val;
	};
}

var superSprintGame = new Game();
superSprintGame.Load();