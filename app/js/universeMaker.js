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

var universe_maker = function (pixiStage, _trackId, _carIds, gameStepCallback) {

  var that = {};
  var contactListener, puddleRandomDirectionArray;
  that.carIds = _carIds;
  that.gameStepCallback = gameStepCallback;

  that.trackId = _trackId;
  contactListener = new b2.dyn.b2ContactListener();
  that.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
  that.worldSetUp = null;

  that.playerCar = null;
  that.iaCars = [];
  that.otherCars = [];
  puddleRandomDirectionArray = new Array(1, -1);
  that.jsonsAssetsList = null;
  that.contactManager = null;
  that.positioning = 0;
  that.pixiRenderer = null;

  that.setPixiRenderer = function (pixiRenderer) {
    that.pixiRenderer = pixiRenderer;
    return that.pixiRenderer;
  };

  that.loadBox2d = function () {
    var carId, j, len, loadingIndex;
    that.jsonsAssetsList = linkedListMaker();
    that.jsonsAssetsList.add(configs.tracks[that.trackId].jsonPath, 'track');
    for (loadingIndex = j = 0, len = that.carIds.length; j < len; loadingIndex = ++j) {
      carId = that.carIds[loadingIndex];
      that.jsonsAssetsList.add(configs.cars[carId].jsonPath, 'car');
    }
    that.worldSetUp = worldSetup(that.jsonsAssetsList, that.world);
    that.worldSetUp.launchMultiLoad(that.box2dLoaded);
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
    var carSet, i, ia, len, baseCar;
    that.loaderTrackWallsSet = loaderTrackWallsSet;
    that.playerCarSet = playerCarSet;
    that.otherCarsSets = otherCarsSets;

    baseCar = carMaker(0);
    that.playerCar = playerCarMaker(baseCar);
    that.playerCar.checkPointManager = checkpointManagerMaker(3);
    that.playerCar.setBox2dData(that.playerCarSet);
    that.playerCar.name = "player";

    that.setUpDatGui(that.playerCar);
    that.contactManager = contactManagerMaker(that.world, [that.playerCar]);

    pixiStage.addChild(that.playerCar.pixiSprite);
    that.positionTrack(that.loaderTrackWallsSet);
    that.positionCar(that.playerCar);


    for (i = 0; i < that.otherCarsSets.length; i += 1) {
      var newOtherCar =  carMaker(0);
      newOtherCar.setBox2dData(otherCarsSets[i]);
      newOtherCar.name = "other";
      that.positionCar(newOtherCar);
      that.otherCars.push(newOtherCar);
    }

    document.onkeydown = keyboardHandler.handleKeyDown;
    document.onkeyup = keyboardHandler.handleKeyUp;
    that.update();
  };

  that.update = function () {
    var car, j, len;
    requestAnimationFrame(that.update);
    that.world.Step(1 / 60, 3, 3);
    that.world.ClearForces();
    that.world.DrawDebugData();
    that.playerCar.updateData();
    that.playerCar.handleKeyboard(keyboardHandler.keys);
    for (j = 0, len = that.otherCars.length; j < len; j++) {
      car = that.otherCars[j];
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
    var startPosition, startPositions;
    startPosition = that.worldSetUp.trackStartPositions[that.positioning].GetPosition();
    that.positioning += 1;
    var translatedPosition = b2.math.AddVV(b2.ScreenCenterVector, startPosition);
    carInstance.setPosition(startPosition);
    //console.log(carInstance.b2Body.GetPosition());
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