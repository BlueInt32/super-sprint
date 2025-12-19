"use strict";

var pixiFacade = require('./pixiFacade.js');
var PIXI = require('pixi.js');
var settings = require('./settings.js');

var Menu = function(specs) {
  this.pixiStage = specs.pixiStage;
  this.specs = specs;
  var self = this;

  // Get HTML elements
  this.menuContainer = document.getElementById('menuContainer');
  this.track0Button = document.getElementById('track0Button');
  this.track1Button = document.getElementById('track1Button');
  this.controlsElement = document.getElementById('controls');
  this.debugToggleButton = document.getElementById('debugToggleButton');

  // Setup track buttons
  if (this.track0Button) {
    this.track0Button.onclick = function() {
      self.hideTrackButtons();
      self.showMenuButton();
      self.showDebugToggleButton();
      self.showControls();
      specs.onStartRace(0);
    };
  }

  if (this.track1Button) {
    this.track1Button.onclick = function() {
      self.hideTrackButtons();
      self.showMenuButton();
      self.showDebugToggleButton();
      self.showControls();
      specs.onStartRace(1);
    };
  }

  // Create permanent menu button (top right corner)
  this.createMenuButton();

  // Create debug toggle button
  this.createDebugToggleButton();

  specs.onMenuLoaded();
};

Menu.prototype.hideTrackButtons = function() {
  if (this.menuContainer) {
    this.menuContainer.style.display = 'none';
  }
};

Menu.prototype.showTrackButtons = function() {
  if (this.menuContainer) {
    this.menuContainer.style.display = 'flex';
  }
};

Menu.prototype.createMenuButton = function() {
  // Use HTML button instead of Pixi button for better z-index control
  this.menuButton = document.getElementById('menuButton');
  if (this.menuButton) {
    this.menuButton.onclick = function() {
      // Simply reload the page to return to menu
      window.location.reload();
    };
  }
};

Menu.prototype.showMenuButton = function() {
  if (this.menuButton) {
    this.menuButton.style.display = 'block';
  }
};

Menu.prototype.hideMenuButton = function() {
  if (this.menuButton) {
    this.menuButton.style.display = 'none';
  }
};

Menu.prototype.showControls = function() {
  if (this.controlsElement) {
    this.controlsElement.style.display = 'flex';
  }
};

Menu.prototype.hideControls = function() {
  if (this.controlsElement) {
    this.controlsElement.style.display = 'none';
  }
};

Menu.prototype.createDebugToggleButton = function() {
  if (this.debugToggleButton) {
    this.debugToggleButton.onclick = function() {
      window.location.href = window.location.pathname + '?debug=' + (!settings.technical.debugDraw);
    };
  }
};

Menu.prototype.showDebugToggleButton = function() {
  if (this.debugToggleButton) {
    this.debugToggleButton.style.display = 'block';
    this.debugToggleButton.textContent = settings.technical.debugDraw ? 'SPRITES' : 'DEBUG';
  }
};

module.exports = Menu;
