var Game, game,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Game = (function() {
  function Game() {
    this.loadUniverse = __bind(this.loadUniverse, this);
    this.initPixi = __bind(this.initPixi, this);
    this.consts = new ConstsDef();
    this.stats = new Stats();
    this.pixiStage = new PIXI.Stage(0xDDDDDD, true);
    this.queryParams = this.loadQueryConfig();
    this.universe = new Universe(this.consts, this.pixiStage, this.queryParams.track, this.queryParams.cars, (function(_this) {
      return function() {
        return _this.stats.update();
      };
    })(this));
    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.consts.STAGE_WIDTH_PIXEL;
    this.canvas.height = this.consts.STAGE_HEIGHT_PIXEL;
    this.debugDraw();
    this.initWindowAnimationFrame();
  }

  Game.prototype.initWindowAnimationFrame = function() {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
          return window.setTimeout(callback, 1000 / 60);
        };
      };
    }
    window.onload = this.initPixi;
  };

  Game.prototype.initPixi = function() {
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

  Game.prototype.loadUniverse = function() {
    return this.universe.loadBox2d();
  };

  Game.prototype.debugDraw = function() {
    var debugDrawer;
    debugDrawer = new b2.dyn.b2DebugDraw();
    debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDrawer.SetDrawScale(100.0);
    debugDrawer.SetFillAlpha(0.5);
    debugDrawer.SetLineThickness(10.0);
    debugDrawer.SetFlags(b2.dyn.b2DebugDraw.e_shapeBit | b2.dyn.b2DebugDraw.e_jointBit | b2.dyn.b2DebugDraw.e_controllerBit | b2.dyn.b2DebugDraw.e_pairBit);
    return this.universe.world.SetDebugDraw(debugDrawer);
  };

  Game.prototype.loadQueryConfig = function() {
    var queryParams, urlParams;
    urlParams = this.parseQueryString();
    console.log(urlParams);
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

  Game.prototype.parseQueryString = function() {
    var assoc, decode, key, keyValues, val, _i, _len;
    assoc = {};
    keyValues = location.search.slice(1).split('&');
    decode = function(s) {
      return decodeURIComponent(s.replace(/\+/g, ' '));
    };
    for (_i = 0, _len = keyValues.length; _i < _len; _i++) {
      val = keyValues[_i];
      key = val.split('=');
      if (1 < key.length) {
        assoc[decode(key[0])] = decode(key[1]);
      }
    }
    return assoc;
  };

  return Game;

})();

game = new Game();
