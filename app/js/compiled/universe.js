var Universe,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Universe = (function() {
  function Universe(consts, _pixiStage, gameStepCallback) {
    var contactListener, puddleRandomDirectionArray;
    this.consts = consts;
    this._pixiStage = _pixiStage;
    this.gameStepCallback = gameStepCallback;
    this.update = __bind(this.update, this);
    this.box2dLoaded = __bind(this.box2dLoaded, this);
    this.keyboardHandler = new KeyboardHandler();
    this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
    contactListener = new Box2D.Dynamics.b2ContactListener();
    this.iaCars = [];
    this.playerCar = null;
    this.consts = consts;
    puddleRandomDirectionArray = new Array(1, -1);
    this.jsonsAssetsList = null;
    this.pixiStage = this._pixiStage;
    this.contactManager = null;
  }

  Universe.prototype.loadBox2d = function() {
    var worldSetup;
    this.jsonsAssetsList = new LinkedList();
    this.jsonsAssetsList.add(TracksConfig[0].jsonPath, 'track');
    this.jsonsAssetsList.add(CarsConfig[0].jsonPath, 'car');
    worldSetup = new WorldSetup(this.jsonsAssetsList);
    worldSetup.setWorld(this.world);
    return worldSetup.launchMultiLoad(this.box2dLoaded);
  };


  /*
      * loaderTrackWallsSet is an array of box2d bodies representing the walls
      * playerCarSet is an object reprensenting the player car, it's built like so:
          {
              carBody : box2dbody,
              rearTires : box2dbody[],
              frontTires : box2dbody[],
              directionJoints : box2dJoint
          }
      * otherCarsSets is an array of such objects
   */

  Universe.prototype.box2dLoaded = function(loaderTrackWallsSet, playerCarSet, otherCarsSets) {
    this.loaderTrackWallsSet = loaderTrackWallsSet;
    this.playerCarSet = playerCarSet;
    this.otherCarsSets = otherCarsSets;
    this.playerCar = new PlayerCar(this.consts, 0, CarsConfig[0]);
    this.playerCar.checkPointManager = new CheckPointManager(3);
    this.playerCar.setBox2dData(this.playerCarSet);
    this.setUpDatGui(this.playerCar);
    this.contactManager = new ContactManager(this.world, this.playerCar);
    this.pixiStage.addChild(this.playerCar.pixiSprite);
    this.positionCar(this.playerCar, this.pixiStage);
    this.positionTrack(this.loaderTrackWallsSet);
    document.onkeydown = this.keyboardHandler.handleKeyDown.bind(this.keyboardHandler);
    document.onkeyup = this.keyboardHandler.handleKeyUp.bind(this.keyboardHandler);
    return this.update();
  };

  Universe.prototype.update = function() {
    requestAnimationFrame(this.update);
    this.world.Step(1 / 60, 3, 3);
    this.world.ClearForces();
    this.world.DrawDebugData();
    this.playerCar.updateData();
    this.playerCar.handleKeyboard(this.keyboardHandler.keys);
    return this.gameStepCallback();
  };

  Universe.prototype.positionTrack = function(trackWalls) {
    var position, trackWall, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = trackWalls.length; _i < _len; _i++) {
      trackWall = trackWalls[_i];
      position = trackWall.GetPosition();
      _results.push(trackWall.SetPosition(b2.math.AddVV(this.consts.ScreenCenterVector, position)));
    }
    return _results;
  };

  Universe.prototype.positionCar = function(carInstance) {
    var pos, startPositions;
    startPositions = getBodiesWithNamesStartingWith(this.world, "start");
    pos = new b2.cMath.b2Vec2(0, 0);
    return carInstance.setPosition(b2.math.AddVV(this.consts.ScreenCenterVector, pos));
  };

  Universe.prototype.setUpDatGui = function(refObject) {
    var f1, gui;
    gui = new dat.GUI();
    f1 = gui.addFolder('Car Behaviour');
    f1.add(refObject, 'accelerationFactor', 0.05, 0.5);
    f1.add(refObject, 'lockAngleDeg', 20, 50);
    f1.add(refObject, 'driftTrigger', 0.001, 0.01);
    return f1.open();
  };

  return Universe;

})();
