var settings = {
  consts: {
    METER: 100,
    STAGE_WIDTH_PIXEL: 1000,
    STAGE_HEIGHT_PIXEL: 750,
    DEGTORAD: 2 * Math.PI / 360
  },

  tracks: [{
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
    }],

  cars: [{
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
  }],

  sprites: {
    buttons: {
      createRace: 'assets/buttons/create-race.gif'
    }
  },

  defaultSetup: {
    trackId: 0,
    carIds: [0, 0]
  },

  technical: {
    debugDraw: true,
    pixiActivated: false,
    statsOverlay: true
  }
}

module.exports = settings;
