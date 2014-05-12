class Game
    constructor:() ->
        @keyboardHandler = new KeyboardHandler()
        @consts = new ConstsDef()
        @stats = new Stats()
        @universe = new Universe(@consts);
        @canvas = document.getElementById('canvas');
        @canvas.width = @consts.STAGE_WIDTH_PIXEL;
        @canvas.height = @consts.STAGE_HEIGHT_PIXEL;

        @debugDraw()
        @init()

    init: ()->
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame =  () ->
                return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                (callback, element) -> window.setTimeout(callback, 1000 / 60)
        window.onload = @onLoad;
        return


    onLoad:()=>
        container = document.createElement("div");
        document.body.appendChild(container);
        @carConfigPointer = CarsConfig[0];

        container.appendChild(@stats.domElement);
        @stats.domElement.style.position = "absolute";

        @pixiStage = new PIXI.Stage(0xDDDDDD, true);
        @pixiRenderer = PIXI.autoDetectRenderer(@consts.STAGE_WIDTH_PIXEL, @consts.STAGE_HEIGHT_PIXEL, undefined, false);
        document.getElementById('gameContainer').appendChild(@pixiRenderer.view);

        #  create a background..
        background = PIXI.Sprite.fromImage('assets/tracks/images/track0.png');

        #  add background to stage..
        @pixiStage.addChild(background);

        loader = new PIXI.AssetLoader([@carConfigPointer.spritePath]);
        loader.onComplete = @onLoadAssets;
        loader.load();

    onLoadAssets:()=>
        jsonPathsLList = new LinkedList()
        jsonPathsLList.add(TracksConfig[0].jsonPath, 'track')
        jsonPathsLList.add(@carConfigPointer.jsonPath, 'car')

        worldSetup = new WorldSetup(jsonPathsLList);
        worldSetup.setWorld(@universe.world)
        worldSetup.launchMultiLoad(@box2dLoaded)

    box2dLoaded:(loaderTrackWalls, loaderCars)=>
        rCar = new PlayerCar(@consts, 0, @carConfigPointer)
        console.log(rCar);

        @setUpDatGui(rCar)
        @universe.positionTrack(loaderTrackWalls)
        rCar.setBox2dData(loaderCars[0])

        @universe.addCar(rCar, @pixiStage)

        document.onkeydown = @keyboardHandler.handleKeyDown.bind(@keyboardHandler)
        document.onkeyup = @keyboardHandler.handleKeyUp.bind(@keyboardHandler)

        @update()

    debugDraw:()->
        debugDrawer = new b2.dyn.b2DebugDraw();
        debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"))
        debugDrawer.SetDrawScale(100.0)
        debugDrawer.SetFillAlpha(0.5)
        debugDrawer.SetLineThickness(10.0)
        debugDrawer.SetFlags(
            b2.dyn.b2DebugDraw.e_shapeBit | b2.dyn.b2DebugDraw.e_jointBit | b2.dyn.b2DebugDraw.e_controllerBit | b2.dyn.b2DebugDraw.e_pairBit
            #  | b2.dyn.b2DebugDraw.e_centerOfMassBit
            );
        @universe.world.SetDebugDraw(debugDrawer);

    update:()=>
        requestAnimationFrame(@update);
        @universe.world.Step(1 / 60, 3, 3);
        @universe.world.ClearForces();

        @universe.world.DrawDebugData();

        # TODO : update only keyboard data for player's car, the other cars must not be updated the same way.
        # for(carIndex in @universe.cars)
        # {

        @universe.cars[0].updateData();
        @universe.cars[0].handleKeyboard(@keyboardHandler.keys);

        #}
        #@pixiRenderer.render(@pixiStage);
        @stats.update();

    setUpDatGui:(refObject)->
        gui = new dat.GUI();

        f1 = gui.addFolder('Car Behaviour');
        f1.add(refObject, 'accelerationFactor', 0.05, 0.5);
        f1.add(refObject, 'lockAngleDeg', 20, 50);
        f1.add(refObject, 'driftTrigger', 0.001, 0.01);
        f1.open();

game = new Game()