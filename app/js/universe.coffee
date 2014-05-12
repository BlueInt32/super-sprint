class Universe
    constructor: (@consts, @_pixiStage, @gameStepCallback)->
        @keyboardHandler = new KeyboardHandler()
        @world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true)
        contactListener = new Box2D.Dynamics.b2ContactListener();
        @iaCars = []
        @playerCar = null
        @consts = consts
        puddleRandomDirectionArray = new Array(1, -1)
        @jsonsAssetsList = null
        @pixiStage = @_pixiStage
        @contactManager = null

    loadBox2d: () ->
        # Load tracks and cars configs
        @jsonsAssetsList = new LinkedList()
        @jsonsAssetsList.add(TracksConfig[0].jsonPath, 'track')
        @jsonsAssetsList.add(CarsConfig[0].jsonPath, 'car')

        worldSetup = new WorldSetup(@jsonsAssetsList);
        worldSetup.setWorld(@world)
        worldSetup.launchMultiLoad(@box2dLoaded) # /!\ this callBack must supplies 3 sets: walls bodies [], player cars bodies (not an array)

    ###
        * loaderTrackWallsSet is an array of box2d bodies representing the walls
        * playerCarSet is an object reprensenting the player car, it's built like so:
            {
                carBody : box2dbody,
                rearTires : box2dbody[],
                frontTires : box2dbody[],
                directionJoints : box2dJoint
            }
        * otherCarsSets is an array of such objects
    ###
    box2dLoaded:(@loaderTrackWallsSet, @playerCarSet, @otherCarsSets)=>

        #do all the playerCar logic
        @playerCar = new PlayerCar(@consts, 0, CarsConfig[0])
        @playerCar.checkPointManager = new CheckPointManager(3)
        @playerCar.setBox2dData(@playerCarSet)
        @setUpDatGui(@playerCar)
        @contactManager = new ContactManager(@world, @playerCar)

        # add pixi sprite
        @pixiStage.addChild(@playerCar.pixiSprite)

        #position stuff
        @positionCar(@playerCar, @pixiStage)
        @positionTrack(@loaderTrackWallsSet)

        # create the keyboard handlers
        document.onkeydown = @keyboardHandler.handleKeyDown.bind(@keyboardHandler)
        document.onkeyup = @keyboardHandler.handleKeyUp.bind(@keyboardHandler)

        # Launch main loop.
        @update()

    update:()=>
        requestAnimationFrame(@update);
        @world.Step(1 / 60, 3, 3);
        @world.ClearForces();

        @world.DrawDebugData();

        # TODO : update only keyboard data for player's car, the other cars must not be updated the same way.
        # for(carIndex in @universe.cars)
        # {

        @playerCar.updateData();
        @playerCar.handleKeyboard(@keyboardHandler.keys);

        #}
        #@pixiRenderer.render(@pixiStage);
        @gameStepCallback()

    positionTrack: (trackWalls) ->
        for trackWall in trackWalls
            position = trackWall.GetPosition()
            trackWall.SetPosition(b2.math.AddVV(@consts.ScreenCenterVector, position))

    positionCar: (carInstance) ->
        startPositions = getBodiesWithNamesStartingWith(@world, "start")
        pos = new b2.cMath.b2Vec2(0, 0)
        carInstance.setPosition(b2.math.AddVV(@consts.ScreenCenterVector, pos))

    setUpDatGui:(refObject)->
        gui = new dat.GUI();

        f1 = gui.addFolder('Car Behaviour');
        f1.add(refObject, 'accelerationFactor', 0.05, 0.5);
        f1.add(refObject, 'lockAngleDeg', 20, 50);
        f1.add(refObject, 'driftTrigger', 0.001, 0.01);
        f1.open();