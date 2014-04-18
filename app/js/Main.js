(function Main()
{
	var keyboardHandler = new KeyboardHandler(),
		Consts = new ConstsDef(),
		stats,
		pixiRenderer,
		pixiStage,
		pixiSprite;
	var b2Universe = new B2Universe(Consts);

	var carConfigPointer = null;




	var canvas = document.getElementById('canvas');
	canvas.width = Consts.STAGE_WIDTH_PIXEL;
	canvas.height = Consts.STAGE_HEIGHT_PIXEL;
	debugDraw();

	var scaleX = canvas.width / window.innerWidth;
	var scaleY = canvas.height / window.innerHeight;
	var scaleToFit = Math.min(scaleX, scaleY);

		// stage.style.transformOrigin = "0 0";
		// stage.style.transform = "scale("+scaleToFit+")";



	(function init()
	{
		if (!window.requestAnimationFrame)
		{
			window.requestAnimationFrame = (function ()
			{
				return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
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
		carConfigPointer = new Car0Config();


		var rubeFilesLoader = new RubeFilesLoader(
			{
				track:Tracks[0].json/**/,
				cars:[carConfigPointer.json]
			});
		rubeFilesLoader.setWorld(b2Universe.world);
		rubeFilesLoader.load(box2dLoaded);
	}

	function box2dLoaded(loaderTrackWalls, loaderCars)
	{
		var rcar = new Car(Consts, 0, carConfigPointer);
		setUpDatGui(rcar);



		//console.log(loaderTrackWalls);
		b2Universe.PositionTrack(loaderTrackWalls);

		rcar.SetBox2dData(loaderCars[0]);
		b2Universe.AddCar(rcar, pixiStage);

		//b2Universe.CreateWalls();

		document.onkeydown = keyboardHandler.HandleKeyDown.bind(keyboardHandler);
		document.onkeyup = keyboardHandler.HandleKeyUp.bind(keyboardHandler);

		update();
	}

	function debugDraw()
	{
		var debugDrawer = new b2.dyn.b2DebugDraw();
		debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
		debugDrawer.SetDrawScale(100.0);
		debugDrawer.SetFillAlpha(0.5);
		debugDrawer.SetLineThickness(10.0);
		debugDrawer.SetFlags(
			b2.dyn.b2DebugDraw.e_shapeBit
			| b2.dyn.b2DebugDraw.e_jointBit
			// | b2.dyn.b2DebugDraw.e_centerOfMassBit
			| b2.dyn.b2DebugDraw.e_controllerBit
			| b2.dyn.b2DebugDraw.e_pairBit
			);
		b2Universe.world.SetDebugDraw(debugDrawer);
	}

	function update()
	{


		requestAnimationFrame(update);
		b2Universe.world.Step(1 / 60, 3, 3);
		b2Universe.world.ClearForces();

		b2Universe.world.DrawDebugData();

		//var ctx = document.getElementById("canvas").getContext("2d");
		//ctx.drawImage(document.getElementById("canvas"), 0, 0, 200, 200);

		for(var carIndex in b2Universe.cars)
		{
			b2Universe.cars[carIndex].updateData(keyboardHandler.Keys);
		}
		//pixiRenderer.render(pixiStage);
		stats.update();
	}

	function setUpDatGui(refObject)
	{
		var gui = new dat.GUI();

		var f1 = gui.addFolder('Car Behaviour');
		f1.add(refObject, 'accelerationFactor', 0.05, 0.5);
		f1.add(refObject, 'lockAngleDeg', 20, 50);
	}


})();