

(function Main()
{
	var b2Helper = new B2Helper(),
		keyboardHandler = new KeyboardHandler(),
		Consts = new ConstsDef(),
		stats,
		pixiRenderer,
		pixiStage,
		pixiSprite,
		car;


	(function init()
	{
		if (!window.requestAnimationFrame)
		{
			window.requestAnimationFrame = (function ()
			{
				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback)
				{
					window.setTimeout(callback, 1000 / 60);
				};
			})();
		}

		window.onload = onLoad;
	})();

	function onLoad()
	{
		const container = document.createElement("div");
		document.body.appendChild(container);

		stats = new Stats();
		container.appendChild(stats.domElement);
		stats.domElement.style.position = "absolute";

		pixiStage = new PIXI.Stage(0xDDDDDD, true);
		pixiRenderer = PIXI.autoDetectRenderer(Consts.STAGE_WIDTH_PIXEL, Consts.STAGE_HEIGHT_PIXEL, undefined, false);
		document.body.appendChild(pixiRenderer.view);
		
		const loader = new PIXI.AssetLoader([Sprites.car]);
		
		
		loader.onComplete = onLoadAssets;
		loader.load();
	}

	function onLoadAssets()
	{
		car = new Car(Consts);
		car.createb2Body(b2Helper, Consts.STAGE_WIDTH_B2 / 2, Consts.STAGE_HEIGHT_B2 / 2);
		pixiStage.addChild(car.pixiSprite);

		document.onkeydown = keyboardHandler.HandleKeyDown.bind(keyboardHandler);
		document.onkeyup = keyboardHandler.HandleKeyUp.bind(keyboardHandler);

		update();
	}

	function update()
	{
		requestAnimationFrame(update);

		b2Helper.world.Step(1 / 60, 3, 3);
		b2Helper.world.ClearForces();

		var body = car.b2Body;

		var currentRightNormal = body.GetWorldVector(new b2.cMath.b2Vec2(0, 1));
		var vCurrentRightNormal = b2.math.MulFV(b2.math.Dot(currentRightNormal, body.GetLinearVelocity()), currentRightNormal);
		var impulse = b2.math.MulFV(-body.GetMass(), vCurrentRightNormal);
		body.ApplyImpulse(impulse, body.GetWorldCenter());



		if (keyboardHandler.Keys.accelerate)
		{
			console.log(body);
			body.ApplyForce(body.GetWorldVector(new b2.cMath.b2Vec2(1, 0)), body.GetWorldCenter());
		}
		else if (b2.math.Dot(body.GetLinearVelocity(), body.GetWorldVector(new b2.cMath.b2Vec2(1, 0))) > 0)
		{
			body.ApplyForce(body.GetWorldVector(new b2.cMath.b2Vec2(-0.2, 0)), body.GetWorldCenter());
		}
		else if (keyboardHandler.Keys.brake)
		{
			body.ApplyForce(body.GetWorldVector(new b2.cMath.b2Vec2(-1, 0)), body.GetWorldCenter());
		}
		if (keyboardHandler.Keys.left)
		{
			body.ApplyTorque(-car.CAR_ROTATE_FACTOR);
		}
		if (keyboardHandler.Keys.right)
		{
			body.ApplyTorque(car.CAR_ROTATE_FACTOR);
		}
		var position = body.GetPosition();
		car.pixiSprite.position.x = position.x * Consts.METER;
		car.pixiSprite.position.y = position.y * Consts.METER;
		car.pixiSprite.rotation = body.GetAngle();


		pixiRenderer.render(pixiStage);
		stats.update();
	}
})();