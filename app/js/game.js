"use strict";

var universeMaker = require('./universeMaker.js');
var b2 = require('./utils/b2Helpers.js');
var urlHelper = require('./utils/urlHelper.js');
var PIXI = require('pixi');
var Stats = require('./libs/Stats.js');
var configs =  require('./configs.js');

var superSprintGame = function () {
  var that = {};

  that.stats = new Stats();
  that.pixiStage = new PIXI.Stage(0xDDDDDD, true);
  that.queryParams = urlHelper.loadQueryConfig();
  that.universe = universeMaker(that.pixiStage, that.queryParams.track, that.queryParams.cars, function () {
    return that.stats.update();
  });

  var canvas = document.getElementById('canvas');
  canvas.width = configs.consts.STAGE_WIDTH_PIXEL;
  canvas.height = configs.consts.STAGE_HEIGHT_PIXEL;

  that.initWindowAnimationFrame = function () {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function () {
        return window.requestAnimationFrame
          || window.webkitRequestAnimationFrame
          || window.mozRequestAnimationFrame
          || window.oRequestAnimationFrame
          || window.msRequestAnimationFrame
          || function (callback, element) {
            return window.setTimeout(callback, 1000 / 60);
          };
      };
    }
    window.onload = that.initPixi;
  };

  that.initPixi = function () {
    var background, container, pixiLoader;
    container = document.createElement("div");
    document.body.appendChild(container);
    container.appendChild(that.stats.domElement);
    that.stats.domElement.style.position = "absolute";
    that.pixiRenderer = PIXI.autoDetectRenderer(configs.consts.STAGE_WIDTH_PIXEL, configs.consts.STAGE_HEIGHT_PIXEL, void 0, false);
    that.universe.setPixiRenderer(that.pixiRenderer);
    document.getElementById('gameContainer').appendChild(that.pixiRenderer.view);
    background = PIXI.Sprite.fromImage('assets/tracks/images/track0.png');
    that.pixiStage.addChild(background);
    pixiLoader = new PIXI.AssetLoader([configs.cars[that.queryParams.cars[0]].spritePath]);
    pixiLoader.onComplete = that.loadUniverse;
    return pixiLoader.load();
  };

  that.loadUniverse = function () {
    return that.universe.loadBox2d();
  };

  that.debugDraw = function () {
    var debugDrawer;
    debugDrawer = new b2.dyn.b2DebugDraw();
    debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDrawer.SetDrawScale(100.0);
    debugDrawer.SetFillAlpha(0.5);
    debugDrawer.SetLineThickness(10.0);
    debugDrawer.SetFlags(b2.dyn.b2DebugDraw.e_shapeBit | b2.dyn.b2DebugDraw.e_jointBit | b2.dyn.b2DebugDraw.e_controllerBit | b2.dyn.b2DebugDraw.e_pairBit);
    return that.universe.world.SetDebugDraw(debugDrawer);
  };

  that.startGame = function () {
    that.debugDraw();
    that.initWindowAnimationFrame();
  };

  return that;
};

var game = superSprintGame();
game.startGame();