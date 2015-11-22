/**
 * Created by Simon on 15/11/2015.
 */
var linkedListMaker = require('./utils/linkedListMaker.js');
var request = require('then-request');
var rubeFileLoader = require('./libs/rubeFileLoader.js');

var b2LoaderMaker = function(worldFacade) {
  var that = {},
    elementsList = linkedListMaker(),
    resourceLoadingIndex = 0;

  that.addElement = function(specs) {
    debugger;
    elementsList.add(specs.data.jsonPath, specs.type);
    continueLoadingList();
  };

  function continueLoadingList() {
    if (elementsList.size > 0) {
      var resourceNode = elementsList.firstNode;
      request('GET', resourceNode.data)
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

    // when a subworld is added to the main world, the bodies inside it are affected a resourceLoadingIndex
    worldFacade.b2World = rubeFileLoader.loadWorldFromRUBE(parsedJson, worldFacade.b2World, resourceLoadingIndex);


    if (resourceNode.dataType === 'car') {
      extractLastCar();
    } else if (resourceNode.dataType === 'track') {
      extractTrack();
    }
    resourceLoadingIndex += 1;
    //if (resourceNode.next != null) {
    //  that.loadResource(resourceNode.next);
    //} else {
    //  that.mainLoaderCallback.apply(null, [that.trackWalls, that.playerCar, that.otherCars]);
    //}
  };

  function extractLastCar() {
    var carBody, carFrontTires, carRearTires, carSet, carsInWorld, dirJoints, dirJointsInWorld, frontTiresInWorld, rearTiresInWorld;

    carsInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, "car_body");
    rearTiresInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, "wheel_rear");
    frontTiresInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, "wheel_front");
    dirJointsInWorld = rubeFileLoader.getNamedJoints(worldFacade.b2World, "direction");

    carBody = rubeFileLoader.filterElementsByCustomProperty(carsInWorld, 'int', 'loadingIndex', resourceLoadingIndex)[0];
    carRearTires = rubeFileLoader.filterElementsByCustomProperty(rearTiresInWorld, 'int', 'loadingIndex', resourceLoadingIndex);
    carFrontTires = rubeFileLoader.filterElementsByCustomProperty(frontTiresInWorld, 'int', 'loadingIndex', resourceLoadingIndex);
    dirJoints = rubeFileLoader.filterElementsByCustomProperty(dirJointsInWorld, 'int', 'loadingIndex', resourceLoadingIndex);

    carSet = {
      carBody: carBody,
      rearTires: carRearTires,
      frontTires: carFrontTires,
      directionJoints: dirJoints
    };
    if (!worldFacade.playerCar) {
      worldFacade.playerCar = carSet;
    } else {
      worldFacade.otherCars.push(carSet);
    }
  }

  function extractTrack() {
    worldFacade.trackWalls = rubeFileLoader.getBodies(worldFacade.b2World);
    worldFacade.trackStartPositions = rubeFileLoader.getBodiesWithNamesStartingWith(worldFacade.b2World, 'start');
    worldFacade.trackIaLine = rubeFileLoader.getBodiesByCustomProperty(worldFacade.b2World, "string", "category", "iaLine")[0];
  }

  return that;
};

module.exports = b2LoaderMaker;