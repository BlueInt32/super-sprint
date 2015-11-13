"use strict";

var linkedListMaker = require('./utils/linkedList.js');
var keyboardHandler = require('./keyboardHandler.js');
var b2 = require('./utils/b2Helpers.js');
var worldSetup = require('./worldSetup.js');
var configs =  require('./configs.js');
var carMaker = require('./carMaker.js');
var playerCarMaker = require('./playerCarMaker.js');
var checkpointManagerMaker = require('./checkpointManagerMaker.js');
var contactManagerMaker = require('./contactManagerMaker.js');
var dat = require('dat-gui');
var rubeFileLoader = require('./libs/rubeFileLoader.js');

var universe_maker = function (_pixiStage, _trackId, _carIds, gameStepCallback) {

  var that = {};
  var contactListener, puddleRandomDirectionArray;
  that._pixiStage = _pixiStage;
  that.carIds = _carIds;
  that.gameStepCallback = gameStepCallback;

  that.trackId = _trackId;
  contactListener = new b2.dyn.b2ContactListener();
  that.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);

  that.playerCar = null;
  that.iaCars = [];
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
    var carId, j, len, loadingIndex, worldSettingUp;
    that.jsonsAssetsList = linkedListMaker();
    that.jsonsAssetsList.add(configs.tracks[that.trackId].jsonPath, 'track');
    for (loadingIndex = j = 0, len = that.carIds.length; j < len; loadingIndex = ++j) {
      carId = that.carIds[loadingIndex];
      that.jsonsAssetsList.add(configs.cars[carId].jsonPath, 'car');
      if (loadingIndex !== 0) {
        that.jsonsAssetsList.add(configs.cars[carId].probesSystemPath, 'probeSystem');
      }
    }
    worldSettingUp = worldSetup(that.jsonsAssetsList, that.world);
    worldSettingUp.launchMultiLoad(that.box2dLoaded);
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
    var carSet, i, ia, j, len, ref, baseCar;
    that.loaderTrackWallsSet = loaderTrackWallsSet;
    that.playerCarSet = playerCarSet;
    that.otherCarsSets = otherCarsSets;

    baseCar = carMaker(0);
    that.playerCar = playerCarMaker(baseCar);
    that.playerCar.checkPointManager = checkpointManagerMaker(3);
    that.playerCar.setBox2dData(that.playerCarSet);

    that.setUpDatGui(that.playerCar);
    that.contactManager = contactManagerMaker(that.world, [that.playerCar]);
    ref = that.otherCarsSets;
    //for (i = j = 0, len = ref.length; j < len; i = ++j) {
    //  carSet = ref[i];
    //  ia = new iaCar(that.consts, 0, CarsConfig[that.carIds[i]]);
    //  ia.setBox2dData(carSet);
    //  that.positionCar(ia, that.pixiStage);
    //  that.iaCars.push(ia);
    //}

    that.pixiStage.addChild(that.playerCar.pixiSprite);
    that.positionCar(that.playerCar, that.pixiStage);
    that.positionTrack(that.loaderTrackWallsSet);
    document.onkeydown = keyboardHandler.handleKeyDown;
    document.onkeyup = keyboardHandler.handleKeyUp;
    that.update();
  };

  that.update = function () {
    var car, j, len, ref;
    requestAnimationFrame(that.update);
    that.world.Step(1 / 60, 3, 3);
    that.world.ClearForces();
    that.world.DrawDebugData();
    that.playerCar.updateData();
    that.playerCar.handleKeyboard(keyboardHandler.keys);
    ref = that.iaCars;
    for (j = 0, len = ref.length; j < len; j++) {
      car = ref[j];
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
      trackWall.SetPosition(b2.math.AddVV(b2.ScreenCenterVector, position));
    }
  };

  that.positionCar = function (carInstance) {
    var pos, startPositions;
    startPositions = rubeFileLoader.getBodiesWithNamesStartingWith(that.world, "start");
    pos = startPositions[that.positioning++].GetPosition();
    carInstance.setPosition(b2.math.AddVV(b2.ScreenCenterVector, pos));
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

  return that;
};

module.exports = universe_maker;