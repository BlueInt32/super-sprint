/**
 * Created by Simon on 15/11/2015.
 */
"use strict";

var LinkedList = require('./utils/LinkedList.js');
var request = require('then-request');
var rubeFileLoader = require('./libs/rubeFileLoader.js');
var B2Helper = require('./utils/B2Helper.js');
var PlayerCar = require('./PlayerCar.js');

var B2Loader = function(worldFacade) {

  this.elementsList = new LinkedList();
  this.resourceLoadingIndex = 0;
  this.nextCarPositionAvailable = 0;

  this.addElement = function(specs) {
    this.elementsList.add(specs.data, specs.type);
    continueLoadingList();
  };

  function continueLoadingList() {
    if (elementsList.size > 0) {
      var resourceNode = elementsList.firstNode;
      request('GET', resourceNode.data.jsonPath)
        .done(function(retrievedData) {
          var subWorldJson = retrievedData.getBody();
          loadRawJson(subWorldJson, resourceNode);
          elementsList.removeFirst();
          continueLoadingList();
        });
    }
  };

  function loadRawJson(rawJson, resourceNode) {
    var iaBoundDef, iaCarBody, joint, parsedJson, probeSystem, probeSystemsInWorld;

    parsedJson = rubeFileLoader.preprocessRube(JSON.parse(rawJson));

    // when a subworld is added to the main world, the bodies inside it are affected a resourceLoadingIndex in a custom property
    worldFacade.b2World = rubeFileLoader.loadWorldFromRUBE(parsedJson, worldFacade.b2World, resourceLoadingIndex);

    if (resourceNode.dataType === 'track') {
      extractAndPlaceTrack();
    }
    else if (resourceNode.dataType === 'car') {
      extractAndPlaceLastCarAdded();
      this.nextCarPositionAvailable += 1;
    }
    this.resourceLoadingIndex += 1;
  };

  function extractAndPlaceTrack() {
    var j, len, position, trackB2Body;

    worldFacade.trackB2Bodies = rubeFileLoader.getBodies(worldFacade.b2World);

    // Positioning the b2Track elements
    for (j = 0, len = worldFacade.trackB2Bodies.length; j < len; j++) {
      trackB2Body = worldFacade.trackB2Bodies[j];
      position = trackB2Body.GetPosition();
      trackB2Body.SetPosition(B2Helper.math.AddVV(B2Helper.ScreenCenterVector, position));
    }

    worldFacade.trackStartPositions = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, 'start');
    worldFacade.trackIaLine = rubeFileLoader.getBodiesByCustomProperty(worldFacade.b2World, "string", "category", "iaLine")[0];
  }

  function extractAndPlaceLastCarAdded() {
    var carB2Body, carB2FrontTires, carB2RearTires, carB2BodiesSet, carsInWorld, carDirectionB2Joints, carDirectionB2JointsInWorld, carB2FrontTiresInWorld, carB2RearTiresInWorld;

    carsInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, "car_body");
    carB2RearTiresInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, "wheel_rear");
    carB2FrontTiresInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, "wheel_front");
    carDirectionB2JointsInWorld = rubeFileLoader.getNamedJoints(worldFacade.b2World, "direction");

    carB2Body = rubeFileLoader.filterElementsByCustomProperty(carsInWorld, 'int', 'loadingIndex', resourceLoadingIndex)[0];
    carB2RearTires = rubeFileLoader.filterElementsByCustomProperty(carB2RearTiresInWorld, 'int', 'loadingIndex', resourceLoadingIndex);
    carB2FrontTires = rubeFileLoader.filterElementsByCustomProperty(carB2FrontTiresInWorld, 'int', 'loadingIndex', resourceLoadingIndex);
    carDirectionB2Joints = rubeFileLoader.filterElementsByCustomProperty(carDirectionB2JointsInWorld, 'int', 'loadingIndex', resourceLoadingIndex);

    carB2BodiesSet = {
      carBody: carB2Body,
      rearTires: carB2RearTires,
      frontTires: carB2FrontTires,
      directionJoints: carDirectionB2Joints
    };

    // Positioning the carB2BodiesSet elements
    var startPosition;
    startPosition = worldFacade.trackStartPositions[nextCarPositionAvailable].GetPosition();
    carB2Body.SetPosition(startPosition);
    for (var i = 0; i < carB2RearTires.length; i++) {
      carB2RearTires[i].SetPosition(startPosition);
    }
    for (var i = 0; i < carB2FrontTires.length; i++) {
      carB2RearTires[i].SetPosition(startPosition);
    }


    if (!worldFacade.playerCar) {
      var playerCar = new PlayerCar(0);
      playerCar.checkPointManager = checkpointManagerMaker(3);
      playerCar.setBox2dData(carB2BodiesSet);
      playerCar.name = 'player';
      worldFacade.playerCar = playerCar;

    } else {
      worldFacade.otherCars.push(carB2BodiesSet);
    }
  }
};

module.exports = B2Loader;