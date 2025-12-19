/**
* Created by Simon on 15/11/2015.
*/
"use strict";

var PlayerCommand = function () {
  this.keyArray = [];
  this.keys = {
    accelerate: false,
    brake: false,
    left: false,
    right: false,
    handbrake: false
  };
  this.handledKeys = [
    37, // left key
    38, // up key
    39, // right key
    40, // down key
    32 // space key
  ];
};

PlayerCommand.prototype.handleKeyDown = function (event) {
  var key, knowkey;
  key = event.which;
  if (this.handledKeys.indexOf(key) > -1) {
    event.preventDefault();
  }
  if (this.keyArray.indexOf(key) > -1) {
    return;
  }
  knowkey = true;
  switch (key) {
    case 37: // left key
    this.keys.left = true;
    break;
    case 38:
    this.keys.accelerate = true;
    break;
    case 39:
    this.keys.right = true;
    break;
    case 40:
    this.keys.brake = true;
    break;
    case 32:
    this.keys.handbrake = true;
    break;
    default:
    knowkey = false;
  }
  if (knowkey) {
    this.keyArray.push(key);
  }
};

PlayerCommand.prototype.handleKeyUp = function (event) {

  var i, key;
  key = event.which;
  i = this.keyArray.indexOf(key);
  if (i > -1) {
    this.keyArray.splice(i, 1);
  }
  switch (key) {
    case 37:
    this.keys.left = false;
    break;
    case 38:
    this.keys.accelerate = false;
    break;
    case 39:
    this.keys.right = false;
    break;
    case 40:
    this.keys.brake = false;
    break;
    case 32:
    this.keys.handbrake = false;
    break;
  }
};

export default new PlayerCommand();
