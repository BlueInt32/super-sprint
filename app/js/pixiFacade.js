/**
 * Created by Simon on 15/11/2015.
 */

var PIXI = require('pixi');
var settings = require('./settings.js');

var pixiFacade = function() {
  var that = {};
  that.pixiStage = new PIXI.Stage(0xFFFFFF, true);
  that.pixiRenderer = PIXI.autoDetectRenderer(settings.consts.STAGE_WIDTH_PIXEL, settings.consts.STAGE_HEIGHT_PIXEL, void 0, false);
  document.getElementById('gameContainer').appendChild(that.pixiRenderer.view);

  that.menu = function(specs) {
    var pixiLoader;

    pixiLoader = new PIXI.AssetLoader([settings.sprites.buttons.createRace]);

    addButton({
      spritePath: settings.sprites.buttons.createRace,
      anchor: {
        x: 0.5,
        y: 0.5
      },
      position: {
        x: 100,
        y: 100
      },
      clickCallback: specs.onStartRace
    })

    pixiLoader.onComplete = specs.onMenuLoaded;

    pixiLoader.load();
  };

  that.initializeTrack = function(trackId, callBack) {
    var background, container, pixiLoader, pixiRenderer;

    that.pixiRenderer = PIXI.autoDetectRenderer(settings.consts.STAGE_WIDTH_PIXEL, settings.consts.STAGE_HEIGHT_PIXEL, void 0, false);
    //that.universe.pixiRenderer = pixiRenderer;
    document.getElementById('gameContainer').appendChild(that.pixiRenderer.view);
    background = PIXI.Sprite.fromImage(settings.tracks[trackId].imagePath);
    //that.pixiStage.addChild(background);
    pixiLoader = new PIXI.AssetLoader([settings.cars[settings.defaultSetup.carIds[0]].spritePath, settings.sprites.buttons.createRace]);

    pixiLoader.onComplete = callBack;

    pixiLoader.load();
  };

  that.step = function() {
    that.pixiRenderer.render(that.pixiStage);
  };

  function addButton(specs) {
    var button, buttonTexture;

    buttonTexture = PIXI.Texture.fromImage(specs.spritePath);
    button = new PIXI.Sprite(buttonTexture);

    button.anchor.x = specs.anchor.x;
    button.anchor.y = specs.anchor.y;

    button.position.x = specs.position.x;
    button.position.y = specs.position.y;

    button.setInteractive(true);

    // set the mousedown and touchstart callback..
    button.mousedown = button.touchstart = function(data) {

      this.isdown = true;
      this.alpha = 1;
    };

    // set the mouseup and touchend callback..
    button.mouseup = button.touchend = function(data) {
      this.isdown = false;
    };

    button.click = specs.clickCallback;

    button.tap = specs.clickCallback;

    that.pixiStage.addChild(button);
  }

  return that;
};

module.exports = pixiFacade;