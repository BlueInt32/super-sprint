var WorldSetup;

WorldSetup = (function() {
  function WorldSetup(resourcesList) {
    this.jsonLinkedList = resourcesList;
    this.playerCar = null;
    this.otherCars = [];
    this.iaProbeSystems = [];
    this.trackWalls = [];
    this.trackStartPositions = [];
    this.mainLoaderCallback = null;
    this.refWorld = null;
    this.firstCarLoaded = false;
    this.resourceLoadingIndex = 0;
  }

  WorldSetup.prototype.launchMultiLoad = function(callback) {
    this.mainLoaderCallback = callback;
    this.loadResource(this.jsonLinkedList.firstNode);
  };

  WorldSetup.prototype.setWorld = function(world) {
    this.refWorld = world;
  };

  WorldSetup.prototype.loadResource = function(resourceNode) {
    if (resourceNode.data === "") {
      this.loadResource(resourceNode.next);
    }
    return this.loadJSON(resourceNode.data, (function(_this) {
      return function(rawJson) {
        var carBody, carFrontTires, carRearTires, carSet, carsInWorld, dirJoints, dirJointsInWorld, frontTiresInWorld, iaBoundDef, iaCarBody, joint, parsedJson, probeSystem, probeSystemsInWorld, rearTiresInWorld;
        parsedJson = JSON.parse(rawJson);
        parsedJson = _this.preprocessRube(parsedJson);
        _this.refWorld = loadWorldFromRUBE(parsedJson, _this.refWorld, _this.resourceLoadingIndex);
        if (resourceNode.dataType === "car") {
          carsInWorld = getBodiesByCustomProperty(_this.refWorld, "string", "category", "car_body");
          rearTiresInWorld = getBodiesByCustomProperty(_this.refWorld, "string", "category", "wheel_rear");
          frontTiresInWorld = getBodiesByCustomProperty(_this.refWorld, "string", "category", "wheel_front");
          dirJointsInWorld = getNamedJoints(_this.refWorld, "direction");
          carBody = filterElementsByCustomProperty(carsInWorld, 'int', 'loadingIndex', _this.resourceLoadingIndex)[0];
          carRearTires = filterElementsByCustomProperty(rearTiresInWorld, 'int', 'loadingIndex', _this.resourceLoadingIndex);
          carFrontTires = filterElementsByCustomProperty(frontTiresInWorld, 'int', 'loadingIndex', _this.resourceLoadingIndex);
          dirJoints = filterElementsByCustomProperty(dirJointsInWorld, 'int', 'loadingIndex', _this.resourceLoadingIndex);
          carSet = {
            carBody: carBody,
            rearTires: carRearTires,
            frontTires: carFrontTires,
            directionJoints: dirJoints
          };
          if (!_this.firstCarLoaded) {
            _this.playerCar = carSet;
            _this.firstCarLoaded = true;
          } else {
            _this.otherCars.push(carSet);
          }
        } else if (resourceNode.dataType === 'probeSystem') {
          probeSystemsInWorld = getBodiesByCustomProperty(_this.refWorld, "string", "category", "probeSystem");
          probeSystem = filterElementsByCustomProperty(probeSystemsInWorld, 'int', 'loadingIndex', _this.resourceLoadingIndex)[0];
          iaCarBody = _this.otherCars[_this.otherCars.length - 1].carBody;
          iaBoundDef = new b2.joints.b2DistanceJointDef();
          iaBoundDef.bodyA = probeSystem;
          iaBoundDef.bodyB = iaCarBody;
          iaBoundDef.collideConnected = false;
          iaBoundDef.length = 0;
          iaBoundDef.localAnchorB.SetV(new b2.cMath.b2Vec2(0, 0.25));
          joint = _this.refWorld.CreateJoint(iaBoundDef);
          _this.otherCars[_this.otherCars.length - 1].probeSystem = probeSystem;
        } else if (resourceNode.dataType === "track") {
          _this.trackWalls = getBodies(_this.refWorld);
          _this.trackStartPositions = getBodiesWithNamesStartingWith(_this.refWorld);
          _this.trackIaLine = getBodiesByCustomProperty(_this.refWorld, "string", "category", "iaLine")[0];
        }
        _this.resourceLoadingIndex++;
        if (resourceNode.next != null) {
          _this.loadResource(resourceNode.next);
        } else {
          _this.mainLoaderCallback.apply(null, [_this.trackWalls, _this.playerCar, _this.otherCars]);
        }
      };
    })(this));
  };

  WorldSetup.prototype.preprocessRube = function(parsedJson) {
    var fixture, index, joint, jsonBody, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    _ref = parsedJson.body;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      jsonBody = _ref[_i];
      if (jsonBody.position !== 0) {
        jsonBody.position.y = jsonBody.position.y * -1;
      }
      if (typeof jsonBody.fixture !== "undefined") {
        _ref1 = jsonBody.fixture;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          fixture = _ref1[_j];
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
      _ref2 = parsedJson.joint;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        joint = _ref2[_k];
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

  WorldSetup.prototype.loadJSON = function(filePath, callback) {
    var xobj;
    xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState === 4 && xobj.status === 200) {
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
  };

  return WorldSetup;

})();
