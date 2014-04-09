(function Main()
{
	var b2Helper = new B2Helper(),
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
		
		var loader = new PIXI.AssetLoader([Sprites.car]);
		loader.onComplete = onLoadAssets;
		loader.load();
	}

	function onLoadAssets()
	{
		b2Helper.CreateWalls(Consts.STAGE_WIDTH_B2, Consts.STAGE_HEIGHT_B2);

		car = new Car(Consts);
		car.createb2Body(b2Helper, Consts.STAGE_WIDTH_B2 / 2, Consts.STAGE_HEIGHT_B2 / 2);
		pixiStage.addChild(car.pixiSprite);

		document.onkeydown = keyboardHandler.HandleKeyDown.bind(keyboardHandler);
		document.onkeyup = keyboardHandler.HandleKeyUp.bind(keyboardHandler);

		update();
	}

	function debugDraw()
	{
		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
		debugDraw.SetDrawScale(100.0);
		debugDraw.SetFillAlpha(0.5);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		b2Helper.world.SetDebugDraw(debugDraw);
	}

	function update()
	{

		requestAnimationFrame(update);
		b2Helper.world.Step(1 / 60, 3, 3);
		b2Helper.world.DrawDebugData();

		//var ctx = document.getElementById("canvas").getContext("2d");
		//ctx.drawImage(document.getElementById("canvas"), 0, 0, 200, 200);


		b2Helper.world.ClearForces();
		car.updateData(keyboardHandler.Keys);
		pixiRenderer.render(pixiStage);
		stats.update();
	}
})();