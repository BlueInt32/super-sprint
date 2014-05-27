var Universe,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Universe = (function() {
  function Universe(consts, _pixiStage, _trackId, _carIds, gameStepCallback) {
    var contactListener, puddleRandomDirectionArray;
    this.consts = consts;
    this._pixiStage = _pixiStage;
    this._trackId = _trackId;
    this._carIds = _carIds;
    this.gameStepCallback = gameStepCallback;
    this.update = __bind(this.update, this);
    this.box2dLoaded = __bind(this.box2dLoaded, this);
    this.trackId = this._trackId;
    this.carIds = this._carIds;
    this.keyboardHandler = new KeyboardHandler();
    this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
    contactListener = new Box2D.Dynamics.b2ContactListener();
    this.iaCars = [];
    this.playerCar = null;
    this.consts = consts;
    puddleRandomDirectionArray = new Array(1, -1);
    this.jsonsAssetsList = null;
    this.pixiStage = this._pixiStage;
    console.log(this.pixiStage);
    this.contactManager = null;
    this.positioning = 0;
    this.pixiRenderer = null;
    return;
  }

  Universe.prototype.setPixiRenderer = function(_pixiRenderer) {
    this._pixiRenderer = _pixiRenderer;
    return this.pixiRenderer = this._pixiRenderer;
  };

  Universe.prototype.loadBox2d = function() {
    var carId, worldSetup, _i, _len, _ref;
    this.jsonsAssetsList = new LinkedList();
    this.jsonsAssetsList.add(TracksConfig[this.trackId].jsonPath, 'track');
    _ref = this.carIds;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      carId = _ref[_i];
      this.jsonsAssetsList.add(CarsConfig[carId].jsonPath, 'car');
    }
    worldSetup = new WorldSetup(this.jsonsAssetsList);
    worldSetup.setWorld(this.world);
    worldSetup.launchMultiLoad(this.box2dLoaded);
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
    var carSet, i, ia, _i, _len, _ref;
    this.loaderTrackWallsSet = loaderTrackWallsSet;
    this.playerCarSet = playerCarSet;
    this.otherCarsSets = otherCarsSets;
    this.playerCar = new PlayerCar(this.consts, 0, CarsConfig[this.carIds[0]]);
    this.playerCar.checkPointManager = new CheckPointManager(3);
    this.playerCar.setBox2dData(this.playerCarSet);
    this.setUpDatGui(this.playerCar);
    this.contactManager = new ContactManager(this.world, this.playerCar);
    _ref = this.otherCarsSets;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      carSet = _ref[i];
      console.log(this.carIds[i]);
      ia = new iaCar(this.consts, 0, CarsConfig[this.carIds[i]]);
      ia.setBox2dData(carSet);
      this.positionCar(ia, this.pixiStage);
      this.iaCars.push(ia);
    }
    this.pixiStage.addChild(this.playerCar.pixiSprite);
    this.positionCar(this.playerCar, this.pixiStage);
    this.positionTrack(this.loaderTrackWallsSet);
    document.onkeydown = this.keyboardHandler.handleKeyDown.bind(this.keyboardHandler);
    document.onkeyup = this.keyboardHandler.handleKeyUp.bind(this.keyboardHandler);
    this.update();
  };

  Universe.prototype.update = function() {
    var car, _i, _len, _ref;
    requestAnimationFrame(this.update);
    this.world.Step(1 / 60, 3, 3);
    this.world.ClearForces();
    this.world.DrawDebugData();
    this.playerCar.updateData();
    this.playerCar.handleKeyboard(this.keyboardHandler.keys);
    _ref = this.iaCars;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      car = _ref[_i];
      car.updateData();
      car.updateFriction();
    }
    this.pixiRenderer.render(this.pixiStage);
    this.gameStepCallback();
  };

  Universe.prototype.positionTrack = function(trackWalls) {
    var position, trackWall, _i, _len;
    for (_i = 0, _len = trackWalls.length; _i < _len; _i++) {
      trackWall = trackWalls[_i];
      position = trackWall.GetPosition();
      trackWall.SetPosition(b2.math.AddVV(this.consts.ScreenCenterVector, position));
    }
  };

  Universe.prototype.positionCar = function(carInstance) {
    var pos, startPositions;
    startPositions = getBodiesWithNamesStartingWith(this.world, "start");
    pos = startPositions[this.positioning++].GetPosition();
    carInstance.setPosition(b2.math.AddVV(this.consts.ScreenCenterVector, pos));
  };

  Universe.prototype.setUpDatGui = function(refObject) {
    var f1, gui;
    gui = new dat.GUI();
    f1 = gui.addFolder('Car Behaviour');
    f1.add(refObject, 'accelerationFactor', 0.05, 0.2);
    f1.add(refObject, 'lockAngleDeg', 20, 50);
    f1.add(refObject, 'driftTrigger', 0.001, 0.01);
    f1.open();
  };

  return Universe;

})();
