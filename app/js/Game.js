"use strict";

var settings = require('./settings.js');
var player = require('./player.js');
var PixiFacade = require('./pixiFacade.js');
var Race = require('./race.js');
// var socketManager = require('./socketManager.js');
var StatsOverlay = require('./statsOverlay.js');
var playerCommand = require('./playerCommand.js');
var Menu = require('./Menu.js');
var urlHelper = require('./utils/urlHelper.js');

var Game = function() {
  // this.socketManager = new socketManager();
  this.currentRace = null;
  this.menu = null;
  this.pixiFacade = new PixiFacade();
  this.gameEvents = {
    frameStep: () => {
      if(this.currentRace) {
        this.currentRace.update();
      }
      if (settings.technical.pixiActivated) {
        this.pixiFacade.step();
      }
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    menuLoaded: () => {
      console.log('Pixi page loaded');
      window.requestAnimationFrame(this.gameEvents.frameStep);
    },
    startRace: (trackId) => {
      console.log('Race creation !');
      var config = urlHelper.loadQueryConfig();
      console.log('URL config:', config);
      // Use trackId from menu button if provided, otherwise use URL config
      var selectedTrackId = (trackId !== undefined) ? trackId : config.track;
      console.log('Selected track:', selectedTrackId);
      this.currentRace = new Race({trackId: selectedTrackId, pixiFacade : this.pixiFacade});
      this.menu.showMenuButton();
      window.requestAnimationFrame(this.gameEvents.frameStep);
    }
  };

  this.pixiFacade.loadAtlas((loader, resources) => {
    console.log("Atlas loaded ", resources);
    this.menu = new Menu({
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