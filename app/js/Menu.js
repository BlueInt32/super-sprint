"use strict";

var pixiFacade = require('./pixiFacade.js');
var PIXI = require('pixi.js');
var settings = require('./settings.js');

var Menu = function(specs) {
  this.pixiStage = specs.pixiStage;
  this.addButton({
    spriteAtlasId: settings.spritesMapping.buttons.createRace,
    position: { x: 100, y: 100 },
    clickCallback: specs.onStartRace
  });
  specs.onMenuLoaded();
};

Menu.prototype.addButton = function(specs) {
  var button, buttonTexture;

  buttonTexture = PIXI.Texture.fromFrame(specs.spriteAtlasId);
  button = new PIXI.Sprite(buttonTexture);

  button.anchor.x = typeof specs.anchor !== 'undefined' ? specs.anchor.x : 0.5;
  button.anchor.y = typeof specs.anchor !== 'undefined' ? specs.anchor.y : 0.5;

  button.position.x = specs.position.x;
  button.position.y = specs.position.y;

  button.interactive = true;
  //
  //// set the mousedown and touchstart callback..
  //button.mousedown = button.touchstart = function(data) {
  //
  //  this.isdown = true;
  //  this.alpha = 1;
  //};
  //
  //// set the mouseup and touchend callback..
  //button.mouseup = button.touchend = function(data) {
  //  this.isdown = false;
  //};

  button.click = specs.clickCallback;
  this.pixiStage.addChild(button);
};


module.exports = Menu;
