var KeyboardHandler;

KeyboardHandler = (function() {
  function KeyboardHandler() {
    this.keyArray = [];
    this.keys = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      handbrake: false
    };
  }

  KeyboardHandler.prototype.handleKeyDown = function(event) {
    var key, knowKey;
    key = event.which;
    if (this.keyArray.indexOf(key) > -1) {
      event.preventDefault();
      return false;
    }
    knowKey = true;
    switch (key) {
      case 37:
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
        knowKey = false;
    }
    if (knowKey) {
      this.keyArray.push(key);
    }
    event.preventDefault();
    return false;
  };

  KeyboardHandler.prototype.handleKeyUp = function(event) {
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
    event.preventDefault();
    return false;
  };

  return KeyboardHandler;

})();
