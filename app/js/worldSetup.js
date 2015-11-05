var WorldSetup;

var world_setup = function () {

  var that;
  that.jsonLinkedList = resourcesList;
  that.playerCar = null;
  that.otherCars = [];
  that.iaProbeSystems = [];
  that.trackWalls = [];
  that.trackStartPositions = [];
  that.mainLoaderCallback = null;
  that.refWorld = null;
  that.firstCarLoaded = false;
  that.resourceLoadingIndex = 0;

  that.launchMultiLoad = function (callback) {
    that.mainLoaderCallback = callback;
    that.loadResource(that.jsonLinkedList.firstNode);
  };

  that.setWorld = function (world) {
    that.refWorld = world;
  };

  that.loadResource = function (resourceNode) {
    if (resourceNode.data === "") {
      that.loadResource(resourceNode.next);
    }
    return that.loadJSON(resourceNode.data, (function (_that) {
      return function (rawJson) {
        var carBody, carFrontTires, carRearTires, carSet, carsInWorld, dirJoints, dirJointsInWorld, frontTiresInWorld, iaBoundDef, iaCarBody, joint, parsedJson, probeSystem, probeSystemsInWorld, rearTiresInWorld;
        parsedJson = JSON.parse(rawJson);
        parsedJson = _that.preprocessRube(parsedJson);
        _that.refWorld = loadWorldFromRUBE(parsedJson, _that.refWorld, _that.resourceLoadingIndex);
        if (resourceNode.dataType === "car") {
          carsInWorld = getBodiesByCustomProperty(_that.refWorld, "string", "category", "car_body");
          rearTiresInWorld = getBodiesByCustomProperty(_that.refWorld, "string", "category", "wheel_rear");
          frontTiresInWorld = getBodiesByCustomProperty(_that.refWorld, "string", "category", "wheel_front");
          dirJointsInWorld = getNamedJoints(_that.refWorld, "direction");
          carBody = filterElementsByCustomProperty(carsInWorld, 'int', 'loadingIndex', _that.resourceLoadingIndex)[0];
          carRearTires = filterElementsByCustomProperty(rearTiresInWorld, 'int', 'loadingIndex', _that.resourceLoadingIndex);
          carFrontTires = filterElementsByCustomProperty(frontTiresInWorld, 'int', 'loadingIndex', _that.resourceLoadingIndex);
          dirJoints = filterElementsByCustomProperty(dirJointsInWorld, 'int', 'loadingIndex', _that.resourceLoadingIndex);
          carSet = {
            carBody: carBody,
            rearTires: carRearTires,
            frontTires: carFrontTires,
            directionJoints: dirJoints
          };
          if (!_that.firstCarLoaded) {
            _that.playerCar = carSet;
            _that.firstCarLoaded = true;
          } else {
            _that.otherCars.push(carSet);
          }
        } else if (resourceNode.dataType === 'probeSystem') {
          probeSystemsInWorld = getBodiesByCustomProperty(_that.refWorld, "string", "category", "probeSystem");
          probeSystem = filterElementsByCustomProperty(probeSystemsInWorld, 'int', 'loadingIndex', _that.resourceLoadingIndex)[0];
          iaCarBody = _that.otherCars[_that.otherCars.length - 1].carBody;
          iaBoundDef = new b2.joints.b2DistanceJointDef();
          iaBoundDef.bodyA = probeSystem;
          iaBoundDef.bodyB = iaCarBody;
          iaBoundDef.collideConnected = false;
          iaBoundDef.length = 0;
          iaBoundDef.localAnchorB.SetV(new b2.cMath.b2Vec2(0, 0.25));
          joint = _that.refWorld.CreateJoint(iaBoundDef);
          _that.otherCars[_that.otherCars.length - 1].probeSystem = probeSystem;
        } else if (resourceNode.dataType === "track") {
          _that.trackWalls = getBodies(_that.refWorld);
          _that.trackStartPositions = getBodiesWithNamesStartingWith(_that.refWorld);
          _that.trackIaLine = getBodiesByCustomProperty(_that.refWorld, "string", "category", "iaLine")[0];
        }
        _that.resourceLoadingIndex++;
        if (resourceNode.next != null) {
          _that.loadResource(resourceNode.next);
        } else {
          _that.mainLoaderCallback.apply(null, [_that.trackWalls, _that.playerCar, _that.otherCars]);
        }
      };
    })(this));
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

  that.loadJSON = function (filePath, callback) {
    var xobj;
    xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, true);
    xobj.onreadystatechange = function () {
      if (xobj.readyState === 4 && xobj.status === 200) {
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
  };

  return WorldSetup;

};
