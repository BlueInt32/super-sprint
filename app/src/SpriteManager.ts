"use strict";


import settings from './settings.ts';
import * as PIXI from 'pixi.js';
import CustomAnimatedSprite from './utils/AnimatedSprite.ts';

var SpriteManager = function(specs) {

  this.spriteType = specs.spriteType;
  this.texturesMapping = null;
  this.sprite = null;
  this.sequences = {};
  this.pixiContainer = specs.pixiContainer;
  this.currentDirection = 'still'; // Track the current turn state
  this.isTransitioning = false; // Track if we're playing a transition animation

  switch (this.spriteType) {
    case 'ship':
      this.texturesMapping = settings.spritesMapping.ships[specs.index];
      this.buildMovingObjectSequences();
      this.sprite = new CustomAnimatedSprite(this.sequences);
      this.sprite.zIndex = 10; // Put car above track
      this.pixiContainer.addChild(this.sprite);
      this.sprite.gotoAndStop('still');
      this.sprite.visible = true; // Show the sprite now that debugDraw is off
      console.log('Car sprite created');
      break;
  }
};

SpriteManager.prototype.setState = function(sequenceName){
  // Don't do anything if we're already in the requested state or transitioning
  if (this.currentDirection === sequenceName || this.isTransitioning) {
    return;
  }

  // If transitioning from turn to still, play the reverse animation
  if (sequenceName === 'still' && this.currentDirection !== 'still') {
    this.isTransitioning = true;
    if (this.currentDirection === 'turnRight') {
      this.sprite.setOnComplete(() => {
        this.sprite.gotoAndStop('still');
        this.sprite.clearOnComplete();
        this.isTransitioning = false;
      });
      this.sprite.gotoAndPlay('turnRightReverse');
    } else if (this.currentDirection === 'turnLeft') {
      this.sprite.setOnComplete(() => {
        this.sprite.gotoAndStop('still');
        this.sprite.clearOnComplete();
        this.isTransitioning = false;
      });
      this.sprite.gotoAndPlay('turnLeftReverse');
    }
    this.currentDirection = sequenceName;
  } else {
    this.sprite.gotoAndPlay(sequenceName);
    this.currentDirection = sequenceName;
  }
};

SpriteManager.prototype.buildMovingObjectSequences = function() {
  var i, val;
  // PixiJS v8 utilise Texture.from au lieu de fromFrame
  this.sequences.still = [PIXI.Texture.from(this.texturesMapping.still)];
  var turnRightTextures = [];

  for (i = 1; i <= this.texturesMapping.turnRight.frames; i++) {
    val = i + this.texturesMapping.turnRight.offset;
    val = val < 10 ? '0' + val : val;

    turnRightTextures.push(PIXI.Texture.from('right.0' + val + '.png'));
  }
  this.sequences.turnRight = turnRightTextures;
  // Create reversed sequence for returning to still
  this.sequences.turnRightReverse = turnRightTextures.slice().reverse();

  var turnLeftTextures = [];

  for (i = 0; i < this.texturesMapping.turnLeft.frames; i++) {
    val = i + this.texturesMapping.turnLeft.offset;
    val = val < 10 ? '0' + val : val;
    turnLeftTextures.push(PIXI.Texture.from('left.0' + val + '.png'));
  }
  this.sequences.turnLeft = turnLeftTextures;
  // Create reversed sequence for returning to still
  this.sequences.turnLeftReverse = turnLeftTextures.slice().reverse();

};

export default SpriteManager;