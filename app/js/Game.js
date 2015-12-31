"use strict";

var settings = require('./settings.js');
var player = require('./player.js');
var PixiFacade = require('./pixiFacade.js');
var Race = require('./Race.js');
var socketManager = require('./socketManager.js');
var StatsOverlay = require('./statsOverlay.js');
var playerCommand = require('./PlayerCommand.js');
var Menu = require('./Menu.js');

var Game = function() {
  this.socketManager = new socketManager();
  this.currentRace = null;
  this.pixiFacade = new PixiFacade();
  this.gameEvents = {
    frameStep: (timestamp) => {
      if (settings.technical.pixiActivated) {
        this.pixiFacade.step();
      }
      if(this.currentRace) {
        this.currentRace.update();
      }
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    menuLoaded: () => {
      console.log('Pixi page loaded');
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    startRace: () => {
      console.log('Race creation !');
      this.currentRace = new Race({trackId: 0, pixiFacade : this.pixiFacade});
      window.requestAnimationFrame(this.gameEvents.frameStep);
    }
  };

  this.pixiFacade.loadAtlas((loader, resources) => {
    console.log("Atlas loaded ", resources);
    new Menu({
      pixiStage: this.pixiFacade.container,
      onMenuLoaded: this.gameEvents.menuLoaded,
      onStartRace: this.gameEvents.startRace
    });
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