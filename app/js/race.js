

var b2WorldFacade = require('./b2WorldFacade.js');
var settings = require('./settings.js');

var race = function (trackId) {
  var that = {};
  var worldFacade = b2WorldFacade(settings.technical.debugDraw);

  worldFacade.addB2Element({
      type:'track',
      data: settings.tracks[trackId]
    }
  );
  worldFacade.addB2Element({
    type:'car',
    data: settings.cars[0]
  });
};

module.exports = race;