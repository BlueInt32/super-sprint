"use strict";

var B2Helper = require('./utils/B2Helper.js');
var B2Loader = require('./B2Loader.js');
var playerCommand = require('./PlayerCommand.js');

var B2WorldFacade = function(debugDrawActive) {
  console.log(playerCommand);
  this.b2World = new B2Helper.dyn.b2World(new B2Helper.cMath.b2Vec2(0, 0), true);
  this.playerCar = null;
  this.otherCars = [];
  this.trackB2Bodies = [];
  this.trackStartPositions = [];
  this.b2Loader = new B2Loader(this);
  if (debugDrawActive) {
    B2Helper.initDebugDraw(this.b2World);
  }
};

B2WorldFacade.prototype.addB2Element = function(specs) {
  this.b2Loader.addElement(specs);
};

B2WorldFacade.prototype.update = function() {
  var car, j, len;
  if(!this.playerCar){
    return;
  }
  this.b2World.Step(1 / 60, 3, 3);
  this.b2World.ClearForces();
  this.b2World.DrawDebugData();
  this.playerCar.updateData();
  this.playerCar.handleKeyboard(playerCommand.keys);
  for (j = 0, len = this.otherCars.length; j < len; j++) {
    car = this.otherCars[j];
    car.updateData();
    car.updateFriction();
  }
};

B2WorldFacade.prototype.positionTrack = function(trackWalls) {
  var j, len, position, trackWall;
  for (j = 0, len = trackWalls.length; j < len; j++) {
    trackWall = trackWalls[j];
    position = trackWall.GetPosition();
    trackWall.SetPosition(B2Helper.math.AddVV(B2Helper.ScreenCenterVector, position));
  }
};

B2WorldFacade.prototype.positionCar = function(carInstance) {
  var startPosition, startPositions;
  startPosition = this.worldSetUp.trackStartPositions[this.positioning].GetPosition();
  this.positioning += 1;
  var translatedPosition = B2Helper.math.AddVV(B2Helper.ScreenCenterVector, startPosition);
  carInstance.setPosition(startPosition);
  //console.log(carInstance.b2Body.GetPosition());
};

B2WorldFacade.prototype.setUpDatGui = function(refObject) {
  var f1, gui;
  gui = new dat.GUI();
  f1 = gui.addFolder('Car Behaviour');
  f1.add(refObject, 'accelerationFactor', 0.05, 0.2);
  f1.add(refObject, 'lockAngleDeg', 20, 50);
  f1.add(refObject, 'driftTrigger', 0.001, 0.01);
  f1.open();
};

B2WorldFacade.prototype.box2dLoaded = function(loaderTrackWallsSet, playerCarSet, otherCarsSets) {
  var carSet, i, ia, len, baseCar;
  this.loaderTrackWallsSet = loaderTrackWallsSet;
  this.playerCarSet = playerCarSet;
  this.otherCarsSets = otherCarsSets;

  baseCar = carMaker(0);
  this.playerCar = playerCarMaker(baseCar);
  this.playerCar.checkPointManager = checkpointManagerMaker(3);
  this.playerCar.setBox2dData(this.playerCarSet);
  this.playerCar.name = "player";

  this.setUpDatGui(this.playerCar);
  this.contactManager = contactManagerMaker(this.b2World, [this.playerCar]);

  pixiStage.addChild(this.playerCar.pixiSprite);
  this.positionTrack(this.loaderTrackWallsSet);
  this.positionCar(this.playerCar);


  for (i = 0; i < this.otherCarsSets.length; i += 1) {
    var newOtherCar = carMaker(0);
    newOtherCar.setBox2dData(otherCarsSets[i]);
    newOtherCar.name = "other";
    this.positionCar(newOtherCar);
    this.otherCars.push(newOtherCar);
  }

  document.onkeydown = keyboardHandler.handleKeyDown;
  document.onkeyup = keyboardHandler.handleKeyUp;
  this.update();
};

module.exports = B2WorldFacade;
