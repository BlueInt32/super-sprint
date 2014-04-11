(function Main()
{
	var b2Universe = new B2Universe(),
		keyboardHandler = new KeyboardHandler(),
		Consts = new ConstsDef(),
		b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
		stats,
		pixiRenderer,
		pixiStage,
		pixiSprite,
		car;
	document.getElementById("canvas").setAttribute("width", window.innerWidth);
	document.getElementById("canvas").setAttribute("height", window.innerHeight);
	debugDraw();
	(function init()
	{
		if (!window.requestAnimationFrame)
		{
			alert("no requestAnimationFrame");
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
		var container = document.createElement("div");
		document.body.appendChild(container);

		stats = new Stats();
		container.appendChild(stats.domElement);
		stats.domElement.style.position = "absolute";

		pixiStage = new PIXI.Stage(0xDDDDDD, true);
		pixiRenderer = PIXI.autoDetectRenderer(Consts.STAGE_WIDTH_PIXEL, Consts.STAGE_HEIGHT_PIXEL, undefined, false);
		document.body.appendChild(pixiRenderer.view);

		var loader = new PIXI.AssetLoader([Cars[0].sprite]);
		loader.onComplete = onLoadAssets;
		loader.load();
	}

	function onLoadAssets()
	{
		b2Universe.CreateWalls(Consts.STAGE_WIDTH_B2, Consts.STAGE_HEIGHT_B2);
		b2Universe.CreatePuddles(Consts.STAGE_WIDTH_B2, Consts.STAGE_HEIGHT_B2);

		car = new Car(Consts, 0);
		car.createb2Body(b2Universe, Consts.STAGE_WIDTH_B2 / 2, Consts.STAGE_HEIGHT_B2 / 2);
		pixiStage.addChild(car.pixiSprite);

		b2Universe.cars.push(car);

		document.onkeydown = keyboardHandler.HandleKeyDown.bind(keyboardHandler);
		document.onkeyup = keyboardHandler.HandleKeyUp.bind(keyboardHandler);

		update();
	}

	function debugDraw()
	{
		var debugDrawer = new b2DebugDraw();
		debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
		debugDrawer.SetDrawScale(100.0);
		debugDrawer.SetFillAlpha(0.5);
		debugDrawer.SetLineThickness(1.0);
		debugDrawer.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		b2Universe.world.SetDebugDraw(debugDraw);
	}

	function update()
	{

		requestAnimationFrame(update);
		b2Universe.world.Step(1 / 60, 3, 3);
		b2Universe.world.DrawDebugData();

		//var ctx = document.getElementById("canvas").getContext("2d");
		//ctx.drawImage(document.getElementById("canvas"), 0, 0, 200, 200);


		b2Universe.world.ClearForces();
		car.updateData(keyboardHandler.Keys);
		pixiRenderer.render(pixiStage);
		stats.update();
	}
})();