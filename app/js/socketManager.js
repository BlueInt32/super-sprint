/**
 * Created by Simon on 15/11/2015.
 */
"use strict";

window.jQuery = require('jquery');
window.$ = window.jQuery;
require('signalr');

var SocketManager = function() {
  this.firstConnection = function() {
    this.superSprintHub = $.connection.superSprintHub;
    this.superSprintHub.client.updateCar = function(model) {
      //console.log(model);
      //$shape.animate(shapeModel, { duration: updateRate, queue: false });
    };
    $.connection.hub.start().done(function() {
      this.updateServer();
    });
  };

  this.updateServer = function () {
    this.superSprintHub.server.updateModel('hi ! ');
  }
};

module.exports = SocketManager;