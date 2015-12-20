"use strict";

var settings = require('./settings.js');
var player = require('./player.js');
var pixiFacade = require('./pixiFacade.js');
var Race = require('./Race.js');
var socketManager = require('./socketManager.js');
var StatsOverlay = require('./statsOverlay.js');
var playerCommand = require('./PlayerCommand.js');

var Game = function() {
  this.socketManager = new socketManager();
  this.currentRace = null;
  this.gameEvents = {
    frameStep: (timestamp) => {
      if (settings.technical.pixiActivated) {
        pixiFacade.step();
      }
      this.currentRace.update();
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    menuLoaded: () => {
      console.log('Pixi page loaded');
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    startRace: () => {
      console.log('Race creation !');
      this.currentRace = new Race(0);
      window.requestAnimationFrame(this.gameEvents.frameStep);
    }
  };

  pixiFacade.menu({
    onMenuLoaded: this.gameEvents.menuLoaded,
    onStartRace: this.gameEvents.startRace
  });

  document.onkeydown = function(event) { 
    playerCommand.handleKeyDown.apply(playerCommand, [event]); 
  };
  document.onkeyup = function(event) { 
	  playerCommand.handleKeyUp.apply(playerCommand, [event]); 
  };
  if (settings.technical.statsOverlay) {
    new StatsOverlay();
  }
};

var game = new Game();
