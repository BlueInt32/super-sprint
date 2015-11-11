'use strict';

var keyboardHandler = function () {

  var that = {};

  that.keyArray = [];
  that.keys = {
    accelerate: false,
    brake: false,
    left: false,
    right: false,
    handbrake: false
  };
  that.handledKeys = [37, 38, 39, 40, 32];

  that.handleKeyDown = function (event) {
    var key, knowkey;
    key = event.which;
    if (that.handledKeys.indexOf(key) > -1) {
      event.preventDefault();
    }
    if (that.keyArray.indexOf(key) > -1) {
      return;
    }
    knowkey = true;
    switch (key) {
      case 37:
        that.keys.left = true;
        break;
      case 38:
        that.keys.accelerate = true;
        break;
      case 39:
        that.keys.right = true;
        break;
      case 40:
        that.keys.brake = true;
        break;
      case 32:
        that.keys.handbrake = true;
        break;
      default:
        knowkey = false;
    }
    if (knowkey) {
      that.keyArray.push(key);
    }
  };

  that.handleKeyUp = function (event) {
    var i, key;
    key = event.which;
    i = that.keyArray.indexOf(key);
    if (i > -1) {
      that.keyArray.splice(i, 1);
    }
    switch (key) {
      case 37:
        that.keys.left = false;
        break;
      case 38:
        that.keys.accelerate = false;
        break;
      case 39:
        that.keys.right = false;
        break;
      case 40:
        that.keys.brake = false;
        break;
      case 32:
        that.keys.handbrake = false;
        break;
    }
  };

  return that;
};

module.exports = keyboardHandler();