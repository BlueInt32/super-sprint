/**
 * Created by Simon on 30/12/2015.
 * Updated for PixiJS v8 - Wrapper around native AnimatedSprite
 */

import * as PIXI from 'pixi.js';

// Wrapper qui adapte l'ancienne interface à la nouvelle API PixiJS v8
class CustomAnimatedSprite extends PIXI.AnimatedSprite {
  constructor(sequences, frameRate, firstSequence) {
    // Find the first sequence
    let currentSequence;
    if (firstSequence == undefined) {
      for (let key in sequences) {
        currentSequence = key;
        break;
      }
    } else {
      currentSequence = firstSequence;
    }

    // Get initial textures
    const initialTextures = Array.isArray(sequences[currentSequence])
      ? sequences[currentSequence]
      : [sequences[currentSequence]];

    // Call parent constructor with initial textures
    super(initialTextures);

    // Store sequences and current sequence
    this.sequences = sequences;
    this.currentSequence = currentSequence;

    // Set properties
    this.anchor.set(0.5, 0.5);
    this.animationSpeed = (frameRate || 60) / 60;
    this.onComplete = null;
  }

  // Override gotoAndPlay to work with sequence names
  gotoAndPlay(where) {
    if (typeof where === 'string') {
      if (this.currentSequence === where && this.playing) {
        return; // already playing this sequence
      }
      this.currentSequence = where;
      const textures = Array.isArray(this.sequences[where])
        ? this.sequences[where]
        : [this.sequences[where]];
      this.textures = textures;
      this.currentFrame = 0;
    } else {
      this.currentFrame = where;
    }
    this.play();
  }

  // Override gotoAndStop to work with sequence names
  gotoAndStop(where) {
    if (typeof where === 'string') {
      if (this.currentSequence === where && !this.playing) {
        return; // already stopped on this sequence
      }
      this.currentSequence = where;
      const textures = Array.isArray(this.sequences[where])
        ? this.sequences[where]
        : [this.sequences[where]];
      this.textures = textures;
      this.currentFrame = 0;
    } else {
      this.currentFrame = where;
    }
    this.stop();
  }
}

// Export our custom class
export default CustomAnimatedSprite;
