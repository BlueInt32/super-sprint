"use strict";

var B2WorldFacade = require('./B2WorldFacade.js');
var settings = require('./settings.js');

var Race = function (trackId) {

  this.worldFacade = new B2WorldFacade(settings.technical.debugDraw);

  this.worldFacade.addB2Element({
      type:'track',
      data: settings.tracks[trackId]
    }
  );
  this.worldFacade.addB2Element({
    type:'car',
    data: settings.cars[0]
  });

};
Race.prototype.update = function(){
  this.worldFacade.update();
};
module.exports = Race;
