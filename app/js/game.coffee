class Game
    constructor:() ->
        @consts = new ConstsDef()
        @stats = new Stats()
        @pixiStage = new PIXI.Stage(0xDDDDDD, true)
        @queryParams = @loadQueryConfig()
        @universe = new Universe(@consts, @pixiStage, @queryParams.track, @queryParams.cars, ()=> @stats.update())
        @canvas = document.getElementById('canvas')
        @canvas.width = @consts.STAGE_WIDTH_PIXEL
        @canvas.height = @consts.STAGE_HEIGHT_PIXEL

        @debugDraw()
        @initWindowAnimationFrame()


        console.log(@queryParams);


    initWindowAnimationFrame: ()->
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame =  () ->
                return  window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                (callback, element) -> window.setTimeout(callback, 1000 / 60)
        window.onload = @initPixi;
        return

    initPixi:()=>
        container = document.createElement("div");
        document.body.appendChild(container);

        #Stats
        container.appendChild(@stats.domElement);
        @stats.domElement.style.position = "absolute";

        #PIXI
        @pixiRenderer = PIXI.autoDetectRenderer(@consts.STAGE_WIDTH_PIXEL, @consts.STAGE_HEIGHT_PIXEL, undefined, false)
        @universe.setPixiRenderer(@pixiRenderer)
        document.getElementById('gameContainer').appendChild(@pixiRenderer.view);
        background = PIXI.Sprite.fromImage('assets/tracks/images/track0.png');
        @pixiStage.addChild(background);
        pixiLoader = new PIXI.AssetLoader([CarsConfig[@queryParams.cars[0]].spritePath]);
        pixiLoader.onComplete = @loadUniverse;
        pixiLoader.load();

    loadUniverse:()=>
        @universe.loadBox2d()


    debugDraw:()->
        debugDrawer = new b2.dyn.b2DebugDraw();
        debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"))
        debugDrawer.SetDrawScale(100.0)
        debugDrawer.SetFillAlpha(0.5)
        debugDrawer.SetLineThickness(10.0)
        debugDrawer.SetFlags(
            b2.dyn.b2DebugDraw.e_shapeBit |
            b2.dyn.b2DebugDraw.e_jointBit |
            b2.dyn.b2DebugDraw.e_controllerBit |
            b2.dyn.b2DebugDraw.e_pairBit
            #  | b2.dyn.b2DebugDraw.e_centerOfMassBit
            );
        #@universe.world.SetDebugDraw(debugDrawer)

    loadQueryConfig:()->
        urlParams = @parseQueryString()
        console.log(urlParams);
        queryParams = {}
        if urlParams.hasOwnProperty('track')
            queryParams.track = urlParams.track
        else
            queryParams.track = 0
        if urlParams.hasOwnProperty('cars')
            queryParams.cars = urlParams.cars.split(',')
        else
            queryParams.cars = [0,0,0]
        return queryParams

    parseQueryString:()->
        assoc = {}
        keyValues = location.search.slice(1).split('&')
        decode = (s)->
            return decodeURIComponent(s.replace(/\+/g, ' '))
        for val in keyValues
            key = val.split('=')
            if (1 < key.length)
                assoc[decode(key[0])] = decode(key[1])
        return assoc;


game = new Game()