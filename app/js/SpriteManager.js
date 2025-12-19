"use strict";


var settings = require('./settings.js');
var PIXI = require('pixi.js');
require('./utils/AnimatedSprite.js');

var SpriteManager = function(specs) {

  this.spriteType = specs.spriteType;
  this.texturesMapping = null;
  this.sprite = null;
  this.sequences = {};
  this.pixiContainer = specs.pixiContainer;

  switch (this.spriteType) {
    case 'ship':
      this.texturesMapping = settings.spritesMapping.ships[specs.index];
      this.buildMovingObjectSequences();
      this.sprite = new PIXI.AnimatedSprite(this.sequences);
      this.sprite.zIndex = 10; // Put car above track
      this.pixiContainer.addChild(this.sprite);
      this.sprite.gotoAndStop('still');
      this.sprite.visible = true; // Show the sprite now that debugDraw is off
      console.log('Car sprite created');
      break;
  }
};

SpriteManager.prototype.setState = function(sequenceName){
  this.sprite.gotoAndPlay(sequenceName);
};

SpriteManager.prototype.buildMovingObjectSequences = function() {
  var i, val;
  this.sequences.still = [PIXI.Texture.fromFrame(this.texturesMapping.still)];
  var turnRightTextures = [];

  for (i = 1; i <= this.texturesMapping.turnRight.frames; i++) {
    val = i + this.texturesMapping.turnRight.offset;
    val = val < 10 ? '0' + val : val;

    turnRightTextures.push(PIXI.Texture.fromFrame('right.0' + val + '.png'));
  }
  this.sequences.turnRight = turnRightTextures;

  var turnLeftTextures = [];

  for (i = 0; i < this.texturesMapping.turnLeft.frames; i++) {
    val = i + this.texturesMapping.turnLeft.offset;
    val = val < 10 ? '0' + val : val;
    turnLeftTextures.push(PIXI.Texture.fromFrame('left.0' + val + '.png'));
  }
  this.sequences.turnLeft = turnLeftTextures;

};

module.exports = SpriteManager;