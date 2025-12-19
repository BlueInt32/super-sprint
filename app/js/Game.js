"use strict";

import settings from './settings.js';
import player from './player.js';
import PixiFacade from './pixiFacade.js';
import Race from './race.js';
// import socketManager from './socketManager.js';
import StatsOverlay from './statsOverlay.js';
import playerCommand from './playerCommand.js';
import Menu from './Menu.js';
import urlHelper from './utils/urlHelper.js';

var Game = function() {
  // this.socketManager = new socketManager();

  // Check URL for debug parameter
  var config = urlHelper.loadQueryConfig();
  if (config.debug !== undefined) {
    settings.technical.debugDraw = (config.debug === 'true' || config.debug === true);
  }

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
      this.menu.setCurrentRace(this.currentRace);
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