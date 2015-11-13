"use strict";

var universeMaker = require('./universeMaker.js');
var b2 = require('./utils/b2Helpers.js');
var urlHelper = require('./utils/urlHelper.js');
var PIXI = require('pixi');
var Stats = require('./libs/Stats.js');
var configs = require('./configs.js');
//var io = require('socket.io');

window.jQuery = require('jquery');
window.$ = window.jQuery;
require('signalr');


var superSprintGame = function () {
  var that = {};
  that.stats = new Stats();
  that.pixiStage = new PIXI.Stage(0xDDDDDD, true);
  that.queryParams = urlHelper.loadQueryConfig();
  that.universe = universeMaker(that.pixiStage, that.queryParams.track, that.queryParams.cars, function () {
    return that.stats.update();
  });
  that.settings = {
    debugDraw: true,
    pixi: false
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
    pixiLoader.onComplete = that.universe.loadBox2d;
    b2.debugDraw(that.universe);
    window.requestAnimationFrame(that.step);
    that.connect();
    return pixiLoader.load();
  };

  that.connect = function () {
    that.superSprintHub = $.connection.superSprintHub;
    that.superSprintHub.client.updateCar = function (model) {
      console.log(model);
      //$shape.animate(shapeModel, { duration: updateRate, queue: false });
    };
    $.connection.hub.start().done(function () {
      that.updateServer();
    });
  };

  that.updateServer = function () {
    that.superSprintHub.server.updateModel('hi ! ');
  }

  that.step = function (timestamp) {
    if (that.settings.pixi) {
      that.pixiRenderer.render(that.pixiStage);
    }
    window.requestAnimationFrame(that.step);
  }

  return that;
};
var game = superSprintGame();
window.onload = game.initPixi;

