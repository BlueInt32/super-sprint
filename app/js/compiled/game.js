var Game, game,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Game = (function() {
  function Game() {
    this.update = __bind(this.update, this);
    this.box2dLoaded = __bind(this.box2dLoaded, this);
    this.onLoadAssets = __bind(this.onLoadAssets, this);
    this.onLoad = __bind(this.onLoad, this);
    this.keyboardHandler = new KeyboardHandler();
    this.consts = new ConstsDef();
    this.stats = new Stats();
    this.universe = new Universe(this.consts);
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.consts.STAGE_WIDTH_PIXEL;
    this.canvas.height = this.consts.STAGE_HEIGHT_PIXEL;
    this.debugDraw();
    this.init();
  }

  Game.prototype.init = function() {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
          return window.setTimeout(callback, 1000 / 60);
        };
      };
    }
    window.onload = this.onLoad;
  };

  Game.prototype.onLoad = function() {
    var background, container, loader;
    container = document.createElement("div");
    document.body.appendChild(container);
    this.carConfigPointer = CarsConfig[0];
    container.appendChild(this.stats.domElement);
    this.stats.domElement.style.position = "absolute";
    this.pixiStage = new PIXI.Stage(0xDDDDDD, true);
    this.pixiRenderer = PIXI.autoDetectRenderer(this.consts.STAGE_WIDTH_PIXEL, this.consts.STAGE_HEIGHT_PIXEL, void 0, false);
    document.getElementById('gameContainer').appendChild(this.pixiRenderer.view);
    background = PIXI.Sprite.fromImage('assets/tracks/images/track0.png');
    this.pixiStage.addChild(background);
    loader = new PIXI.AssetLoader([this.carConfigPointer.spritePath]);
    loader.onComplete = this.onLoadAssets;
    return loader.load();
  };

  Game.prototype.onLoadAssets = function() {
    var jsonPathsLList, worldSetup;
    jsonPathsLList = new LinkedList();
    jsonPathsLList.add(TracksConfig[0].jsonPath, 'track');
    jsonPathsLList.add(this.carConfigPointer.jsonPath, 'car');
    worldSetup = new WorldSetup(jsonPathsLList);
    worldSetup.setWorld(this.universe.world);
    return worldSetup.launchMultiLoad(this.box2dLoaded);
  };

  Game.prototype.box2dLoaded = function(loaderTrackWalls, loaderCars) {
    var rCar;
    rCar = new PlayerCar(this.consts, 0, this.carConfigPointer);
    console.log(rCar);
    this.setUpDatGui(rCar);
    this.universe.positionTrack(loaderTrackWalls);
    rCar.setBox2dData(loaderCars[0]);
    this.universe.addCar(rCar, this.pixiStage);
    document.onkeydown = this.keyboardHandler.handleKeyDown.bind(this.keyboardHandler);
    document.onkeyup = this.keyboardHandler.handleKeyUp.bind(this.keyboardHandler);
    return this.update();
  };

  Game.prototype.debugDraw = function() {
    var debugDrawer;
    debugDrawer = new b2.dyn.b2DebugDraw();
    debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDrawer.SetDrawScale(100.0);
    debugDrawer.SetFillAlpha(0.5);
    debugDrawer.SetLineThickness(10.0);
    debugDrawer.SetFlags(b2.dyn.b2DebugDraw.e_shapeBit | b2.dyn.b2DebugDraw.e_jointBit | b2.dyn.b2DebugDraw.e_controllerBit | b2.dyn.b2DebugDraw.e_pairBit);
    return this.universe.world.SetDebugDraw(debugDrawer);
  };

  Game.prototype.update = function() {
    requestAnimationFrame(this.update);
    this.universe.world.Step(1 / 60, 3, 3);
    this.universe.world.ClearForces();
    this.universe.world.DrawDebugData();
    this.universe.cars[0].updateData();
    this.universe.cars[0].handleKeyboard(this.keyboardHandler.keys);
    return this.stats.update();
  };

  Game.prototype.setUpDatGui = function(refObject) {
    var f1, gui;
    gui = new dat.GUI();
    f1 = gui.addFolder('Car Behaviour');
    f1.add(refObject, 'accelerationFactor', 0.05, 0.5);
    f1.add(refObject, 'lockAngleDeg', 20, 50);
    f1.add(refObject, 'driftTrigger', 0.001, 0.01);
    return f1.open();
  };

  return Game;

})();

game = new Game();
