/**
 * Created by Simon on 15/11/2015.
 */
"use strict";

var LinkedList = require("./utils/LinkedList.js");
var request = require("then-request");
var RubeFileLoader = require("./libs/rubeFileLoader.js");
var B2Helper = require("./utils/B2Helper.js");
var PlayerCar = require("./PlayerCar.js");
var CheckpointManager = require("./CheckpointManager.js");

var B2Loader = function(worldFacade) {
  this.elementsList = new LinkedList();
  this.resourceLoadingIndex = 0;
  this.nextCarPositionAvailable = 0;
  this.worldFacade = worldFacade;
  this.rubeFileLoader = new RubeFileLoader();

  this.loaded = {};
};

B2Loader.prototype.addElement = function(specs) {
  this.elementsList.add(specs.id, specs.data, specs.type);
  this.continueLoadingList(specs.onAddedAndPlaced);
};

B2Loader.prototype.continueLoadingList = function(onAddedAndPlaced) {
  if (this.elementsList.size > 0) {
    var resourceNode = this.elementsList.firstNode;
    this.elementsList.removeFirst();
    console.log('Loading B2 element:', resourceNode.dataType, 'from', resourceNode.data.jsonPath);
    request('GET', resourceNode.data.jsonPath)
      .done((retrievedData) => {
        console.log('B2 element loaded:', resourceNode.dataType);
        var subWorldJson = retrievedData.getBody();
        this.loadRawJson(subWorldJson, resourceNode, onAddedAndPlaced);
        this.continueLoadingList();
      });
  }
};


B2Loader.prototype.loadRawJson = function(rawJson, resourceNode, onAddedAndPlaced) {

  var parsedJson = this.rubeFileLoader.preprocessRube(JSON.parse(rawJson));

  // when a subworld is added to the main world, the bodies inside it are affected a resourceLoadingIndex in a custom property
  this.worldFacade.b2World = this.rubeFileLoader.loadWorldFromRUBE(parsedJson, this.worldFacade.b2World, this.resourceLoadingIndex);

  if (resourceNode.dataType === 'track') {
    this.loaded[resourceNode.id] = this.extractAndPlaceTrack();
  }
  else if (resourceNode.dataType === 'car') {
    this.loaded[resourceNode.id] = this.extractAndPlaceLastCarAdded();
    this.nextCarPositionAvailable += 1;
  }
  this.resourceLoadingIndex += 1;
  console.log('Calling onAddedAndPlaced for', resourceNode.dataType);
  onAddedAndPlaced.call(this, this.loaded[resourceNode.id]);
  console.log('onAddedAndPlaced finished for', resourceNode.dataType);
};

B2Loader.prototype.extractAndPlaceTrack = function() {
  var j, len, position, trackB2Body;
  var trackBodySet = {
    allBodies: this.rubeFileLoader.getBodies(this.worldFacade.b2World),
    startPositions: this.rubeFileLoader.getBodiesWithNamesStartingWith(this.worldFacade.b2World, 'start'),
    iaLine: this.rubeFileLoader.getBodiesByCustomProperty(this.worldFacade.b2World, "string", "category", "iaLine")[0]
  };

  // Positioning the b2Track elements
  for (j = 0, len = trackBodySet.allBodies.length; j < len; j++) {
    trackB2Body = trackBodySet.allBodies[j];
    position = trackB2Body.GetPosition();
    trackB2Body.SetPosition(B2Helper.math.AddVV(B2Helper.ScreenCenterVector, position));
  }
  this.worldFacade.trackBodySet = trackBodySet;
  return trackBodySet;
};

B2Loader.prototype.extractAndPlaceLastCarAdded = function() {
  var carB2BodiesSet = {
    carBody: this.findElementInWorldByNameAndResourceIndex("car_body")[0],
    rearTires: this.findElementInWorldByNameAndResourceIndex("wheel_rear"),
    frontTires: this.findElementInWorldByNameAndResourceIndex("wheel_front"),
    directionJoints: this.findJointInWorld("direction")
  };

  // Positioning the carB2BodiesSet elements
  var startPosition;
  var initialAngle = -Math.PI / 2; // Point to the left (-90 degrees)
  startPosition = this.worldFacade.trackBodySet.startPositions[this.nextCarPositionAvailable].GetPosition();
  carB2BodiesSet.carBody.SetPosition(startPosition);
  carB2BodiesSet.carBody.SetAngle(initialAngle);
  for (var i = 0; i < carB2BodiesSet.rearTires.length; i++) {
    carB2BodiesSet.rearTires[i].SetPosition(startPosition);
    carB2BodiesSet.rearTires[i].SetAngle(initialAngle);
  }
  for (i = 0; i < carB2BodiesSet.frontTires.length; i++) {
    carB2BodiesSet.frontTires[i].SetPosition(startPosition);
    carB2BodiesSet.frontTires[i].SetAngle(initialAngle);
  }

  return carB2BodiesSet;
};

B2Loader.prototype.findElementInWorldByNameAndResourceIndex = function(bodyName) {
  var bodies = this.findInWorld(bodyName);
  return this.rubeFileLoader.filterElementsByCustomProperty(bodies, 'int', 'loadingIndex', this.resourceLoadingIndex);
};
B2Loader.prototype.findInWorld = function(name) {
  return this.rubeFileLoader.getBodiesWithNamesStartingWith(this.worldFacade.b2World, name);
};
B2Loader.prototype.findJointInWorld = function(name) {
  var jointsInWorld = this.rubeFileLoader.getNamedJoints(this.worldFacade.b2World, name)
  return this.rubeFileLoader.filterElementsByCustomProperty(jointsInWorld, 'int', 'loadingIndex', this.resourceLoadingIndex);
};


module.exports = B2Loader;
