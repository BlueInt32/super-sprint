class Universe
    constructor: (@consts)->
        @world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true)
        contactListener = new Box2D.Dynamics.b2ContactListener();
        @cars = []
        @consts = consts
        puddleRandomDirectionArray = new Array(1, -1)
        contactManager = new ContactManager(@world, @cars)

    positionTrack: (trackWalls) ->
        for trackWall in trackWalls
            position = trackWall.GetPosition()
            trackWall.SetPosition(b2.math.AddVV(@consts.ScreenCenterVector, position))

    addCar: (carInstance, pixiStage) ->
        carInstance.checkPointManager = new CheckPointManager(3)
        @cars.push(carInstance)
        pixiStage.addChild(carInstance.pixiSprite)
        startPositions = getBodiesWithNamesStartingWith(@world, "start")
        pos = new b2.cMath.b2Vec2(0, 0)
        carInstance.setPosition(b2.math.AddVV(@consts.ScreenCenterVector, pos))