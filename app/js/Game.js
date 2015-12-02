"use strict";

var settings = require('./settings.js');
var player = require('./player.js');
var pixiFacade = require('./pixiFacade.js');
var Race = require('./Race.js');
var socketManager = require('./socketManager.js');
var showStatsOverlay = require('./statsOverlay.js');

var Game = function() {
  this.socketManager = new socketManager();

  this.gameEvents = {
    frameStep: function(timestamp){
      if (settings.technical.pixiActivated) {
        pixiFacade.step();
      }
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    menuLoaded: function() {
      console.log('Pixi page loaded');
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    startRace: function() {
      console.log('Race creation !');
      var newRace = new Race(0);
    }
  };

  pixiFacade.menu({
    onMenuLoaded: this.gameEvents.menuLoaded,
    onStartRace: this.gameEvents.startRace
  });
  if (settings.technical.statsOverlay) {
    showStatsOverlay();
  }
};

var game = new Game();