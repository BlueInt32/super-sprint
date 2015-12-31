/**
 * Created by Simon on 30/12/2015.
 */
  /** Taken from http://www.html5gamedevs.com/topic/704-multiple-sequences-sprite-constructor-that-might-be-useful-to-you/ **/

var PIXI = require('pixi.js');

PIXI.AnimatedSprite = function(sequences, frameRate, firstSequence) {
  this.sequences = sequences;
  if (firstSequence == undefined) {
    for (var key in sequences) {
      this.currentSequence = key;
      break;
    }
  }
  else {
    this.currentSequence = firstSequence;
  }
  PIXI.Sprite.call(this, this.sequences[this.currentSequence][0]);
  this.anchor.x = this.anchor.y = .5;
  this.frameRate = frameRate || 60;
  this.onComplete = null;
  this.currentFrame = 0;
  this.playing = false;
  this.loop = false;
};
//animatedSprite
PIXI.AnimatedSprite.constructor = PIXI.AnimatedSprite;
PIXI.AnimatedSprite.prototype = Object.create(PIXI.Sprite.prototype);

PIXI.AnimatedSprite.prototype.gotoAndPlay = function(where) {
  if(this.currentSequence === where) // already playing
    return;
  if (Object.prototype.toString.call(where) == '[object String]') {
    this.currentFrame = 0;
    this.currentSequence = where;
  }
  else {
    this.currentFrame = where;
  }
  this.playing = true;
};

PIXI.AnimatedSprite.prototype.gotoAndStop = function(where) {

  if(this.currentSequence === where && this.playing) // already playing
    return;
  if (Object.prototype.toString.call(where) == '[object String]') {
    this.currentFrame = 0;
    this.currentSequence = where;
  }
  else {
    this.currentFrame = where;
  }
  this.texture = this.sequences[this.currentSequence][this.currentFrame];

  this.playing = false;
};
PIXI.AnimatedSprite.prototype.updateTransform = function(){
  PIXI.Sprite.prototype.updateTransform.call(this);
  this.advanceTime();
};
PIXI.AnimatedSprite.prototype.play = function() {
  this.playing = true;
};

PIXI.AnimatedSprite.prototype.stop = function() {
  this.playing = false;
};


PIXI.AnimatedSprite.prototype.advanceTime = function(dt) {

  if (typeof dt == "undefined") {
    dt = 1 / 60;
  }

  if (this.playing) {
    this.currentFrame += this.frameRate * dt;

    var constrainedFrame = Math.floor(Math.min(this.currentFrame, this.sequences[this.currentSequence].length - 1));
    this.texture = this.sequences[this.currentSequence][constrainedFrame];

    if (this.currentFrame >= this.sequences[this.currentSequence].length) {

      if (this.loop) {
        this.gotoAndPlay(0);
      }
      else {
        this.stop();
      }
      if (this.onComplete) {
        console.log('looping ?', this.loop);
        this.onComplete(this.currentSequence);
      }
    }
  }
};

//module.exports = PIXI_AnimatedSprite;