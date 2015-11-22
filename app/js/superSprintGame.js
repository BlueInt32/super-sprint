"use strict";

//var universeMaker = require('./universeMaker.js');
var b2 = require('./utils/b2Helpers.js');
var urlHelper = require('./utils/urlHelper.js');
//var PIXI = require('pixi');
var settings = require('./settings.js');
var player = require('./player.js');
var pixiFacade = require('./pixiFacade.js');
var b2WorldFacade = require('./b2WorldFacade.js');
var race = require('./race.js');
var socketManager = require('./socketManager.js');
var showStatsOverlay = require('./statsOverlay.js');


var superSprintGame = function() {
  var that = {};

  that.player = player();
  that.pixiFacade = pixiFacade();
  that.socketManager = socketManager();

  that.gameEvents = {
    frameStep: function(timestamp){
      if (settings.technical.pixiActivated) {
        that.pixiFacade.step();
      }
      window.requestAnimationFrame(that.gameEvents.frameStep);
    },
    menuLoaded: function() {
      console.log('Pixi page loaded');
      window.requestAnimationFrame(that.gameEvents.frameStep);

    },
    startRace: function() {
      console.log('Race creation !');

      var newRace = race(0);
    }
  }

  that.pixiFacade.menu({
    onMenuLoaded: that.gameEvents.menuLoaded,
    onStartRace: that.gameEvents.startRace
  });
  if (settings.technical.statsOverlay) {
    showStatsOverlay();
  }

  return that;
};

var game = superSprintGame();