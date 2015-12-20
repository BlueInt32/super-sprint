/**
* Created by Simon on 15/11/2015.
*/
"use strict";

var LinkedList = require("./utils/LinkedList.js");
var request = require("then-request");
var rubeFileLoader = require("./libs/rubeFileLoader.js");
var B2Helper = require("./utils/B2Helper.js");
var PlayerCar = require("./PlayerCar.js");
var CheckpointManager = require("./CheckpointManager.js");

var B2Loader = function(worldFacade) {
  this.elementsList = new LinkedList();
  this.resourceLoadingIndex = 0;
  this.nextCarPositionAvailable = 0;
  this.worldFacade = worldFacade;
};

B2Loader.prototype.extractAndPlaceTrack = function() {
  var j, len, position, trackB2Body;

  this.worldFacade.trackB2Bodies = rubeFileLoader.getBodies(this.worldFacade.b2World);

  // Positioning the b2Track elements
  for (j = 0, len = this.worldFacade.trackB2Bodies.length; j < len; j++) {
    trackB2Body = this.worldFacade.trackB2Bodies[j];
    position = trackB2Body.GetPosition();
    trackB2Body.SetPosition(B2Helper.math.AddVV(B2Helper.ScreenCenterVector, position));
  }

  this.worldFacade.trackStartPositions = rubeFileLoader.getBodiesWithNamesStartingWith(this.worldFacade.b2World, 'start');
  this.worldFacade.trackIaLine = rubeFileLoader.getBodiesByCustomProperty(this.worldFacade.b2World, "string", "category", "iaLine")[0];
};

B2Loader.prototype.extractAndPlaceLastCarAdded = function() {
  var carB2Body, carB2FrontTires, carB2RearTires, carB2BodiesSet, carsInWorld, carDirectionB2Joints, carDirectionB2JointsInWorld, carB2FrontTiresInWorld, carB2RearTiresInWorld;

   carB2Body= this.findElementInWorldByName("car_body")[0]; 
   carB2RearTires= this.findElementInWorldByName("wheel_rear");
   carB2FrontTires= this.findElementInWorldByName("wheel_front");
   carDirectionB2Joints= this.findJointInWorld("direction");

  carB2BodiesSet = {
    carBody: carB2Body,
    rearTires: carB2RearTires,
    frontTires: carB2FrontTires,
    directionJoints: carDirectionB2Joints
  };

  // Positioning the carB2BodiesSet elements
  var startPosition;
  startPosition = this.worldFacade.trackStartPositions[this.nextCarPositionAvailable].GetPosition();
  carB2Body.SetPosition(startPosition);
  for (var i = 0; i < carB2RearTires.length; i++) {
    carB2RearTires[i].SetPosition(startPosition);
  }
  for (i = 0; i < carB2FrontTires.length; i++) {
    for (i = 0; i < carB2FrontTires.length; i++) {
      carB2RearTires[i].SetPosition(startPosition);
    }
    if (!this.worldFacade.playerCar) {
      var playerCar = new PlayerCar(0);
      playerCar.checkPointManager = new CheckpointManager(3);
      playerCar.setBox2dData(carB2BodiesSet);
      playerCar.name = 'player';
      this.worldFacade.playerCar = playerCar;

    } else {
      this.worldFacade.otherCars.push(carB2BodiesSet);
    }
  }
};

B2Loader.prototype.findInWorld = function(name){
  return rubeFileLoader.getBodiesWithNamesStartingWith(this.worldFacade.b2World, name);
};
B2Loader.prototype.findJointInWorld = function(name){
  var jointsInWorld = rubeFileLoader.getNamedJoints(this.worldFacade.b2World, name)
	  return rubeFileLoader.filterElementsByCustomProperty(jointsInWorld, 'int', 'loadingIndex', this.resourceLoadingIndex);
};
B2Loader.prototype.findElementInWorldByName = function(bodyName, loadingIndex){
  var bodies = this.findInWorld(bodyName);
  return rubeFileLoader.filterElementsByCustomProperty(bodies, 'int', 'loadingIndex', this.resourceLoadingIndex);
};

B2Loader.prototype.loadRawJson = function(rawJson, resourceNode) {

  var parsedJson = rubeFileLoader.preprocessRube(JSON.parse(rawJson));

  // when a subworld is added to the main world, the bodies inside it are affected a resourceLoadingIndex in a custom property
  this.worldFacade.b2World = rubeFileLoader.loadWorldFromRUBE(parsedJson, this.worldFacade.b2World, this.resourceLoadingIndex);

  if (resourceNode.dataType === 'track') {
    this.extractAndPlaceTrack();
  }
  else if (resourceNode.dataType === 'car') {
    this.extractAndPlaceLastCarAdded();
    this.nextCarPositionAvailable += 1;
  }
  this.resourceLoadingIndex += 1;
};

B2Loader.prototype.continueLoadingList = function() {
  if (this.elementsList.size > 0) {
    var resourceNode = this.elementsList.firstNode;
    this.elementsList.removeFirst();
    request('GET', resourceNode.data.jsonPath)
    .done((retrievedData) => {
      var subWorldJson = retrievedData.getBody();
      this.loadRawJson(subWorldJson, resourceNode);
      this.continueLoadingList();
    });
  }
};

B2Loader.prototype.addElement = function(specs) {
	console.log(specs);
  this.elementsList.add(specs.data, specs.type);
  this.continueLoadingList();
};
module.exports = B2Loader;
