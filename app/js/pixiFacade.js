/**
 * Created by Simon on 15/11/2015.
 */

var PIXI = require('pixi');
var settings = require('./settings.js');

var pixiFacade = function() {
  var that = {};
  that.pixiStage = new PIXI.Stage(0xDDDDDD, true);

  that.initializePage = function(callBack) {
    var background, container, pixiLoader, pixiRenderer;


    that.pixiRenderer = PIXI.autoDetectRenderer(settings.consts.STAGE_WIDTH_PIXEL, settings.consts.STAGE_HEIGHT_PIXEL, void 0, false);
    //that.universe.pixiRenderer = pixiRenderer;
    document.getElementById('gameContainer').appendChild(that.pixiRenderer.view);
    background = PIXI.Sprite.fromImage('assets/tracks/images/track0.png');
    that.pixiStage.addChild(background);
    pixiLoader = new PIXI.AssetLoader([settings.cars[settings.defaultSetup.carIds[0]].spritePath]);

    pixiLoader.onComplete = callBack;

    pixiLoader.load();
  };

  that.step = function() {
    that.pixiRenderer.render(that.pixiStage);
  };

  return that;
};

module.exports = pixiFacade;