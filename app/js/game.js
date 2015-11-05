"use strict";

var game_maker = function () {
  var that;

  var consts = config_maker();
  var stats = new Stats();
  var pixiStage = new PIXI.Stage(0xDDDDDD, true);
  var queryParams = this.loadQueryConfig();
  var universe = universe_maker(consts, pixiStage, queryParams.track, queryParams.cars, function () {
    return stats.update();
  });
  var canvas = document.getElementById('canvas');
  canvas.width = this.consts.STAGE_WIDTH_PIXEL;
  canvas.height = this.consts.STAGE_HEIGHT_PIXEL;

  that.initWindowAnimationFrame = function () {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
            return window.setTimeout(callback, 1000 / 60);
          };
      };
    }
    window.onload = this.initPixi;
  };

  that.initPixi = function () {
    var background, container, pixiLoader;
    container = document.createElement("div");
    document.body.appendChild(container);
    container.appendChild(this.stats.domElement);
    this.stats.domElement.style.position = "absolute";
    this.pixiRenderer = PIXI.autoDetectRenderer(this.consts.STAGE_WIDTH_PIXEL, this.consts.STAGE_HEIGHT_PIXEL, void 0, false);
    this.universe.setPixiRenderer(this.pixiRenderer);
    document.getElementById('gameContainer').appendChild(this.pixiRenderer.view);
    background = PIXI.Sprite.fromImage('assets/tracks/images/track0.png');
    this.pixiStage.addChild(background);
    pixiLoader = new PIXI.AssetLoader([CarsConfig[this.queryParams.cars[0]].spritePath]);
    pixiLoader.onComplete = this.loadUniverse;
    return pixiLoader.load();
  };

  that.loadUniverse = function () {
    return this.universe.loadBox2d();
  };

  that.debugDraw = function () {
    var debugDrawer;
    debugDrawer = new b2.dyn.b2DebugDraw();
    debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDrawer.SetDrawScale(100.0);
    debugDrawer.SetFillAlpha(0.5);
    debugDrawer.SetLineThickness(10.0);
    debugDrawer.SetFlags(b2.dyn.b2DebugDraw.e_shapeBit | b2.dyn.b2DebugDraw.e_jointBit | b2.dyn.b2DebugDraw.e_controllerBit | b2.dyn.b2DebugDraw.e_pairBit);
    return this.universe.world.SetDebugDraw(debugDrawer);
  };

  that.loadQueryConfig = function () {
    var queryParams, urlParams;
    urlParams = this.parseQueryString();
    queryParams = {};
    if (urlParams.hasOwnProperty('track')) {
      queryParams.track = urlParams.track;
    } else {
      queryParams.track = 0;
    }
    if (urlParams.hasOwnProperty('cars')) {
      queryParams.cars = urlParams.cars.split(',');
    } else {
      queryParams.cars = [0, 0];
    }
    return queryParams;
  };

  that.parseQueryString = function () {
    var assoc, decode, i, key, keyValues, len, val;
    assoc = {};
    keyValues = location.search.slice(1).split('&');
    decode = function (s) {
      return decodeURIComponent(s.replace(/\+/g, ' '));
    };
    for (i = 0, len = keyValues.length; i < len; i++) {
      val = keyValues[i];
      key = val.split('=');
      if (1 < key.length) {
        assoc[decode(key[0])] = decode(key[1]);
      }
    }
    return assoc;
  };


  that.debugDraw();
  that.initWindowAnimationFrame();

  return that;
};