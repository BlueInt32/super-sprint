/**
 * Created by Simon on 15/11/2015.
 * Updated for PixiJS v8
 */

import * as PIXI from 'pixi.js';
import settings from './settings.js';

var PixiFacade = function() {
  // PixiJS v8 utilise une nouvelle API Application
  this.app = new PIXI.Application();

  // Initialisation asynchrone
  this.app.init({
    width: settings.consts.STAGE_WIDTH_PIXEL,
    height: settings.consts.STAGE_HEIGHT_PIXEL,
    backgroundColor: 0x333333
  }).then(() => {
    document.getElementById('gameContainer').appendChild(this.app.canvas);
    console.log('Pixi stage created');
  });

  this.container = new PIXI.Container();
  this.container.sortableChildren = true;
  this.app.stage.addChild(this.container);
};


PixiFacade.prototype.loadAtlas = function(callBack) {
  // PixiJS v8 utilise Assets au lieu de loader
  PIXI.Assets.load(settings.atlas).then((spritesheet) => {
    callBack(null, { atlas: spritesheet });
  });
};

PixiFacade.prototype.createThenAddSprite = function(spriteCreationSpecs) {
  var texture, sprite;
  // PixiJS v8 utilise Texture.from au lieu de fromFrame
  texture = PIXI.Texture.from(spriteCreationSpecs.frameId);
  sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(typeof spriteCreationSpecs.anchor !== 'undefined' ? spriteCreationSpecs.anchor : 0.5);
  this.container.addChild(sprite);
  return sprite;
};



PixiFacade.prototype.step = function() {
  // Dans PixiJS v8 avec Application, le render est automatique
  // Mais on peut forcer un render si nécessaire
  this.app.renderer.render(this.app.stage);
};

PixiFacade.prototype.setVisible = function(visible) {
  this.app.canvas.style.display = visible ? 'block' : 'none';
};



export default PixiFacade;
