'use strict';

var keyboard_handler = function () {
  var that,
    keyarray = [],
    keys = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      handbrake: false
    },
    handledkeys = [37, 38, 39, 40, 32];

  that.handlekeydown = function (event) {
    var key, knowkey;
    key = event.which;
    if (handledkeys.indexof(key) > -1) {
      event.preventdefault();
    }
    if (keyarray.indexof(key) > -1) {
      return;
    }
    knowkey = true;
    switch (key) {
      case 37:
        keys.left = true;
        break;
      case 38:
        keys.accelerate = true;
        break;
      case 39:
        keys.right = true;
        break;
      case 40:
        keys.brake = true;
        break;
      case 32:
        keys.handbrake = true;
        break;
      default:
        knowkey = false;
    }
    if (knowkey) {
      keyarray.push(key);
    }
  };

  that.handlekeyup = function (event) {
    var i, key;
    key = event.which;
    i = keyarray.indexof(key);
    if (i > -1) {
      keyarray.splice(i, 1);
    }
    switch (key) {
      case 37:
        keys.left = false;
        break;
      case 38:
        keys.accelerate = false;
        break;
      case 39:
        keys.right = false;
        break;
      case 40:
        keys.brake = false;
        break;
      case 32:
        keys.handbrake = false;
        break;
    }
  };

  return that;
};
