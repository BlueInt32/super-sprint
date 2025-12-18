"use strict";

var pixiFacade = require('./pixiFacade.js');
var PIXI = require('pixi.js');
var settings = require('./settings.js');

var Menu = function(specs) {
  this.pixiStage = specs.pixiStage;
  this.button = null;
  var self = this;
  this.addButton({
    spriteAtlasId: settings.spritesMapping.buttons.createRace,
    position: { x: 100, y: 100 },
    clickCallback: function() {
      self.hideButton();
      specs.onStartRace();
    }
  });
  specs.onMenuLoaded();
};

Menu.prototype.addButton = function(specs) {
  var button, buttonText;

  // Create a visible text-based button instead of the dark sprite
  var graphics = new PIXI.Graphics();
  graphics.beginFill(0x00FF00); // Green fill
  graphics.lineStyle(2, 0xFFFFFF); // White border
  graphics.drawRoundedRect(0, 0, 200, 60, 10);
  graphics.endFill();

  button = new PIXI.Container();
  button.addChild(graphics);

  // Add text to the button
  buttonText = new PIXI.Text('START RACE', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0x000000,
    align: 'center'
  });
  buttonText.anchor.set(0.5);
  buttonText.position.x = 100;
  buttonText.position.y = 30;
  button.addChild(buttonText);

  button.position.x = specs.position.x;
  button.position.y = specs.position.y;

  button.interactive = true;
  button.buttonMode = true;

  button.click = specs.clickCallback;
  button.tap = specs.clickCallback; // For touch devices

  this.pixiStage.addChild(button);
  this.button = button; // Store reference to the button
};

Menu.prototype.hideButton = function() {
  if (this.button) {
    this.pixiStage.removeChild(this.button);
    this.button = null;
  }
};

module.exports = Menu;
