var b2 = require('./utils/b2Helpers.js');

var settings = function() {
  var that = {};

  that.consts = {
    METER: 100,
    STAGE_WIDTH_PIXEL: 1000,
    STAGE_HEIGHT_PIXEL: 750,
    DEGTORAD: 2 * Math.PI / 360
  };



  that.tracks = [{
    id: 0,
    nbCheckpoints: 3,
    jsonPath: 'assets/tracks/track0.json',
    imagePath: 'assets/tracks/images/track0.png'
  },
  {
    id: 1,
    nbCheckpoints: 3,
    jsonPath: 'assets/tracks/track1.json',
    imagePath: 'assets/tracks/images/track1.png'
  }];

  that.cars = [{
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
  }];

  that.sprites = {
    buttons: {
      createRace : 'assets/buttons/create-race.gif'
    }
  };

  that.defaultSetup = {
    trackId: 0,
    carIds: [0, 0]
  };

  that.technical = {
    debugDraw: true,
    pixiActivated: true,
    statsOverlay: true
  };

  return that;
};

module.exports = settings();