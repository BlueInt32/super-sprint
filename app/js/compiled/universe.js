var Universe;

Universe = (function() {
  function Universe(consts) {
    var contactListener, contactManager, puddleRandomDirectionArray;
    this.consts = consts;
    this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
    contactListener = new Box2D.Dynamics.b2ContactListener();
    this.cars = [];
    this.consts = consts;
    puddleRandomDirectionArray = new Array(1, -1);
    contactManager = new ContactManager(this.world, this.cars);
  }

  Universe.prototype.positionTrack = function(trackWalls) {
    var position, trackWall, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = trackWalls.length; _i < _len; _i++) {
      trackWall = trackWalls[_i];
      position = trackWall.GetPosition();
      _results.push(trackWall.SetPosition(b2.math.AddVV(this.consts.ScreenCenterVector, position)));
    }
    return _results;
  };

  Universe.prototype.addCar = function(carInstance, pixiStage) {
    var pos, startPositions;
    carInstance.checkPointManager = new CheckPointManager(3);
    this.cars.push(carInstance);
    pixiStage.addChild(carInstance.pixiSprite);
    startPositions = getBodiesWithNamesStartingWith(this.world, "start");
    pos = new b2.cMath.b2Vec2(0, 0);
    return carInstance.setPosition(b2.math.AddVV(this.consts.ScreenCenterVector, pos));
  };

  return Universe;

})();
