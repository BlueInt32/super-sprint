/**
 * Created by Simon on 15/11/2015.
 */

var PIXI = require('pixi.js');
var settings = require('./settings.js');

var PixiFacade = function() {
  this.pixiRenderer = PIXI.autoDetectRenderer(settings.consts.STAGE_WIDTH_PIXEL, settings.consts.STAGE_HEIGHT_PIXEL, {backgroundColor: 0x333333}, false);
  document.getElementById('gameContainer').appendChild(this.pixiRenderer.view);
  this.container = new PIXI.Container();
  this.container.sortableChildren = true; // Enable z-index sorting
  console.log('Pixi stage created');
};


PixiFacade.prototype.loadAtlas = function(callBack) {
  PIXI.loader
    .add('atlas', settings.atlas)
    .load(callBack);
};

PixiFacade.prototype.createThenAddSprite = function(spriteCreationSpecs) {
  var texture, sprite;
  texture = PIXI.Texture.fromFrame(spriteCreationSpecs.frameId);
  sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(typeof spriteCreationSpecs.anchor !== 'undefined' ? spriteCreationSpecs.anchor : 0.5);
  this.container.addChild(sprite);
  return sprite;
};



PixiFacade.prototype.step = function() {
  this.pixiRenderer.render(this.container);
};



module.exports = PixiFacade;
