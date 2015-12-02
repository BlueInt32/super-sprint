var rubeFileLoader = require('./libs/rubeFileLoader.js');
var b2 = require('./utils/B2Helper.js');
var request = require('then-request');

var worldSetup = function (resourcesList, mainWorld) {

  var that = {};
  that.jsonLinkedList = resourcesList;
  that.playerCar = null;
  that.otherCars = [];
  that.iaProbeSystems = [];
  that.trackWalls = [];
  that.trackStartPositions = [];
  that.mainLoaderCallback = null;
  that.mainWorld = mainWorld;
  that.firstCarLoaded = false;
  that.resourceLoadingIndex = 0;

  that.launchMultiLoad = function (callback) {
    that.mainLoaderCallback = callback;
    that.loadResource(that.jsonLinkedList.firstNode);
  };

  that.loadResource = function (resourceNode) {
    if (resourceNode.data === "") {
      throw {
        "ErrorCode": "WORLD_SETUP_ERROR",
        "ErrorMessage": "Supersprint : Empty sub-worlds list !"
      };
    }

    request('GET', resourceNode.data)
      .done(function (retrievedData) {
        var subWorldJson = retrievedData.getBody();
        that.loadRawJson(subWorldJson, resourceNode);
      });
  };

  that.loadRawJson = function (rawJson, resourceNode) {
    var carBody, carFrontTires, carRearTires, carSet, carsInWorld, dirJoints, dirJointsInWorld, frontTiresInWorld, iaBoundDef, iaCarBody, joint, parsedJson, probeSystem, probeSystemsInWorld, rearTiresInWorld;
    parsedJson = JSON.parse(rawJson);
    parsedJson = that.preprocessRube(parsedJson);

    // when a subworld is added to the main world, the bodies inside it are affected a resourceLoadingIndex
    that.mainWorld = rubeFileLoader.loadWorldFromRUBE(parsedJson, that.mainWorld, that.resourceLoadingIndex);


    if (resourceNode.dataType === "car") {
      carsInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(that.mainWorld, "car_body");
      rearTiresInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(that.mainWorld, "wheel_rear");
      frontTiresInWorld = rubeFileLoader.getBodiesWithNamesStartingWith(that.mainWorld, "wheel_front");

      dirJointsInWorld = rubeFileLoader.getNamedJoints(that.mainWorld, "direction");
      carBody = rubeFileLoader.filterElementsByCustomProperty(carsInWorld, 'int', 'loadingIndex', that.resourceLoadingIndex)[0];
      carRearTires = rubeFileLoader.filterElementsByCustomProperty(rearTiresInWorld, 'int', 'loadingIndex', that.resourceLoadingIndex);
      carFrontTires = rubeFileLoader.filterElementsByCustomProperty(frontTiresInWorld, 'int', 'loadingIndex', that.resourceLoadingIndex);
      dirJoints = rubeFileLoader.filterElementsByCustomProperty(dirJointsInWorld, 'int', 'loadingIndex', that.resourceLoadingIndex);
      carSet = {
        carBody: carBody,
        rearTires: carRearTires,
        frontTires: carFrontTires,
        directionJoints: dirJoints
      };
      if (!that.firstCarLoaded) {
        that.playerCar = carSet;
        that.firstCarLoaded = true;
      } else {
        that.otherCars.push(carSet);
      }
    } else if (resourceNode.dataType === 'probeSystem') {
      probeSystemsInWorld = rubeFileLoader.getBodiesByCustomProperty(that.mainWorld, "string", "category", "probeSystem");
      probeSystem = rubeFileLoader.filterElementsByCustomProperty(probeSystemsInWorld, 'int', 'loadingIndex', that.resourceLoadingIndex)[0];
      iaCarBody = that.otherCars[that.otherCars.length - 1].carBody;
      iaBoundDef = new b2.joints.b2DistanceJointDef();
      iaBoundDef.bodyA = probeSystem;
      iaBoundDef.bodyB = iaCarBody;
      iaBoundDef.collideConnected = false;
      iaBoundDef.length = 0;
      iaBoundDef.localAnchorB.SetV(new b2.cMath.b2Vec2(0, 0.25));
      joint = that.mainWorld.CreateJoint(iaBoundDef);
      that.otherCars[that.otherCars.length - 1].probeSystem = probeSystem;
    } else if (resourceNode.dataType === "track") {
      that.trackWalls = rubeFileLoader.getBodies(that.mainWorld);
      that.trackStartPositions = rubeFileLoader.getBodiesWithNamesStartingWith(that.mainWorld, 'start');
      that.trackIaLine = rubeFileLoader.getBodiesByCustomProperty(that.mainWorld, "string", "category", "iaLine")[0];
    }
    that.resourceLoadingIndex += 1;
    if (resourceNode.next != null) {
      that.loadResource(resourceNode.next);
    } else {
      that.mainLoaderCallback.apply(null, [that.trackWalls, that.playerCar, that.otherCars]);
    }
  };

  that.preprocessRube = function (parsedJson) {
    var fixture, i, index, j, joint, jsonBody, k, len, len1, len2, ref, ref1, ref2;
    ref = parsedJson.body;
    for (i = 0, len = ref.length; i < len; i++) {
      jsonBody = ref[i];
      if (jsonBody.position !== 0) {
        jsonBody.position.y = jsonBody.position.y * -1;
      }
      if (typeof jsonBody.fixture !== "undefined") {
        ref1 = jsonBody.fixture;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          fixture = ref1[j];
          if (fixture.hasOwnProperty("polygon")) {
            for (index in fixture.polygon.vertices.y) {
              fixture.polygon.vertices.y[index] = -fixture.polygon.vertices.y[index];
            }
            fixture.polygon.vertices.x.reverse();
            fixture.polygon.vertices.y.reverse();
          }
          if (fixture.hasOwnProperty("chain")) {
            for (index in fixture.chain.vertices.y) {
              fixture.chain.vertices.y[index] = -fixture.chain.vertices.y[index];
            }
            fixture.chain.vertices.x.reverse();
            fixture.chain.vertices.y.reverse();
          }
        }
      }
    }
    if (parsedJson.hasOwnProperty("joint")) {
      ref2 = parsedJson.joint;
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        joint = ref2[k];
        if (joint.anchorA !== 0) {
          joint.anchorA.y = joint.anchorA.y * -1;
        }
        if (joint.anchorB !== 0) {
          joint.anchorB.y = joint.anchorB.y * -1;
        }
        joint.upperLimit = 0;
        joint.lowerLimit = 0;
      }
    }
    return parsedJson;
  };

  return that;
};

module.exports = worldSetup;