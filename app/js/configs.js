var config_maker = function () {
  var that = {};

  that.consts = {
    METER: 100,
    STAGE_WIDTH_PIXEL: 1000,
    STAGE_HEIGHT_PIXEL: 750,
    DEGTORAD: 2 * Math.PI / 360
  };
  that.consts.STAGE_WIDTH_B2 = that.consts.STAGE_WIDTH_PIXEL / that.consts.METER;
  that.consts.STAGE_HEIGHT_B2 = that.consts.STAGE_HEIGHT_PIXEL / that.consts.METER;
  that.consts.ScreenCenterVector = new b2.cMath.b2Vec2(that.consts.STAGE_WIDTH_B2 / 2, that.consts.STAGE_HEIGHT_B2 / 2);

  that.tracks = [];
  that.tracks[0] = {
    id: 0,
    nbCheckpoints: 3,
    jsonPath: 'assets/tracks/track0.json',
    imagePath: 'assets/tracks/images/track1.png'
  };
  that.tracks[1] = {
    id: 1,
    nbCheckpoints: 3,
    jsonPath: 'assets/tracks/track1.json',
    imagePath: 'assets/tracks/images/track1.png'
  };

  that.cars = [];
  that.cars[0] = {
    width: 40, // px unit
    height: 25, // px unit
    spritePath: 'assets/cars/images/Voiture_03.png',
    jsonPath: 'assets/cars/car0.json',
    probesSystemPath: 'assets/cars/probeSystem0.json',
    // physics properties
    accelerationFactor: 0.1,
    driftTrigger: 0.003,
    driftTriggerWithHandbrake: 0.001,
    natural_deceleration: 0.01,
    steeringWheelSpeed: 200,
    wheelMaxAngle: 30,
    // car body
    restitution: 0.1,
    puddleFactor: 0.005
  };

  return that;
};