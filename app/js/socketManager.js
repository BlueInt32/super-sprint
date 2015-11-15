/**
 * Created by Simon on 15/11/2015.
 */
"use strict";

window.jQuery = require('jquery');
window.$ = window.jQuery;
require('signalr');

var socketManager = function() {

  var that = {};

  that.firstConnection = function() {
    that.superSprintHub = $.connection.superSprintHub;
    that.superSprintHub.client.updateCar = function(model) {
      //console.log(model);
      //$shape.animate(shapeModel, { duration: updateRate, queue: false });
    };
    $.connection.hub.start().done(function() {
      that.updateServer();
    });
  };

  that.updateServer = function () {
    that.superSprintHub.server.updateModel('hi ! ');
  }
};

module.exports = socketManager;