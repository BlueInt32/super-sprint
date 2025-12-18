"use strict";

var B2WorldFacade = require('./b2WorldFacade.js');
var settings = require('./settings.js');
var PlayerCar = require('./PlayerCar.js');
var CheckpointManager = require('./CheckpointManager.js');

var Race = function(raceSpecs) {

  this.pixiFacade = raceSpecs.pixiFacade;
  this.b2WorldFacade = new B2WorldFacade(settings.technical.debugDraw);

  this.b2WorldFacade.addB2Element({
      id: 'track',
      type: 'track',
      data: settings.tracks[raceSpecs.trackId],
      onAddedAndPlaced: (trackBodySet) => {
        // Track sprite hidden - only showing Box2D wireframe
        // this.pixiFacade.createThenAddSprite({
        //   frameId: "track" + raceSpecs.trackId + ".png",
        //   anchor: 0
        // });
      }
    }
  );

  var playerCarId = 0;
  this.b2WorldFacade.addB2Element({
    id: 'playercar',
    type: 'car',
    data: settings.cars[playerCarId],
    onAddedAndPlaced: (carBodySet) => {
      if (!this.b2WorldFacade.playerCar) { // meaning the playerCar has not been added yet
        var playerCar = new PlayerCar(playerCarId, this.pixiFacade.container);
        playerCar.checkPointManager = new CheckpointManager(3);
        playerCar.setBox2dData(carBodySet);
        playerCar.name = 'player';
        this.b2WorldFacade.playerCar = playerCar;

      } else {
        this.b2WorldFacade.otherCars.push(carBodySet);
      }
    }
  });
};

Race.prototype.update = function() {
  this.b2WorldFacade.update();
};

module.exports = Race;
