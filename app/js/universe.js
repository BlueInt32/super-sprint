"use strict";

var universe_maker = function (consts1, _pixiStage, _trackId, _carIds, gameStepCallback) {

  var that;
  var contactListener, puddleRandomDirectionArray;
  that.consts = consts1;
  that._pixiStage = _pixiStage;
  that._trackId = _trackId;
  that._carIds = _carIds;
  that.gameStepCallback = gameStepCallback;
  that.update = bind(that.update, this);
  that.box2dLoaded = bind(that.box2dLoaded, this);
  that.trackId = that._trackId;
  that.carIds = that._carIds;
  that.keyboardHandler = new KeyboardHandler();
  that.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
  contactListener = new Box2D.Dynamics.b2ContactListener();
  that.playerCar = null;
  that.iaCars = [];
  that.consts = consts;
  puddleRandomDirectionArray = new Array(1, -1);
  that.jsonsAssetsList = null;
  that.pixiStage = that._pixiStage;
  that.contactManager = null;
  that.positioning = 0;
  that.pixiRenderer = null;

  that.setPixiRenderer = function (_pixiRenderer) {
    that._pixiRenderer = _pixiRenderer;
    return that.pixiRenderer = that._pixiRenderer;
  };

  that.loadBox2d = function () {
    var carId, j, len, loadingIndex, ref, worldSetup;
    that.jsonsAssetsList = new LinkedList();
    that.jsonsAssetsList.add(TracksConfig[that.trackId].jsonPath, 'track');
    ref = that.carIds;
    for (loadingIndex = j = 0, len = ref.length; j < len; loadingIndex = ++j) {
      carId = ref[loadingIndex];
      that.jsonsAssetsList.add(CarsConfig[carId].jsonPath, 'car');
      if (loadingIndex !== 0) {
        that.jsonsAssetsList.add(CarsConfig[carId].probesSystemPath, 'probeSystem');
      }
    }
    worldSetup = new WorldSetup(that.jsonsAssetsList);
    worldSetup.setWorld(that.world);
    worldSetup.launchMultiLoad(that.box2dLoaded);
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

  that.box2dLoaded = function (loaderTrackWallsSet, playerCarSet, otherCarsSets) {
    var carSet, i, ia, j, len, ref;
    that.loaderTrackWallsSet = loaderTrackWallsSet;
    that.playerCarSet = playerCarSet;
    that.otherCarsSets = otherCarsSets;
    that.playerCar = new PlayerCar(that.consts, 0, CarsConfig[that.carIds[0]]);
    that.playerCar.checkPointManager = new CheckPointManager(3);
    that.playerCar.setBox2dData(that.playerCarSet);
    that.setUpDatGui(that.playerCar);
    that.contactManager = new ContactManager(that.world, that.playerCar);
    ref = that.otherCarsSets;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      carSet = ref[i];
      ia = new iaCar(that.consts, 0, CarsConfig[that.carIds[i]]);
      ia.setBox2dData(carSet);
      that.positionCar(ia, that.pixiStage);
      that.iaCars.push(ia);
    }
    that.pixiStage.addChild(that.playerCar.pixiSprite);
    that.positionCar(that.playerCar, that.pixiStage);
    that.positionTrack(that.loaderTrackWallsSet);
    document.onkeydown = that.keyboardHandler.handleKeyDown.bind(that.keyboardHandler);
    document.onkeyup = that.keyboardHandler.handleKeyUp.bind(that.keyboardHandler);
    that.update();
  };

  that.update = function () {
    var car, j, len, ref;
    requestAnimationFrame(that.update);
    that.world.Step(1 / 60, 3, 3);
    that.world.ClearForces();
    that.world.DrawDebugData();
    that.playerCar.updateData();
    that.playerCar.handleKeyboard(that.keyboardHandler.keys);
    ref = that.iaCars;
    for (j = 0, len = ref.length; j < len; j++) {
      car = ref[j];
      console.log(car);
      car.updateData();
      car.updateFriction();
    }
    that.gameStepCallback();
  };

  that.positionTrack = function (trackWalls) {
    var j, len, position, trackWall;
    for (j = 0, len = trackWalls.length; j < len; j++) {
      trackWall = trackWalls[j];
      position = trackWall.GetPosition();
      trackWall.SetPosition(b2.math.AddVV(that.consts.ScreenCenterVector, position));
    }
  };

  that.positionCar = function (carInstance) {
    var pos, startPositions;
    startPositions = getBodiesWithNamesStartingWith(that.world, "start");
    pos = startPositions[that.positioning++].GetPosition();
    carInstance.setPosition(b2.math.AddVV(that.consts.ScreenCenterVector, pos));
  };

  that.setUpDatGui = function (refObject) {
    var f1, gui;
    gui = new dat.GUI();
    f1 = gui.addFolder('Car Behaviour');
    f1.add(refObject, 'accelerationFactor', 0.05, 0.2);
    f1.add(refObject, 'lockAngleDeg', 20, 50);
    f1.add(refObject, 'driftTrigger', 0.001, 0.01);
    f1.open();
  };

  return Universe;

};
