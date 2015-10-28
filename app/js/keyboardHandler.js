var keyboard_handler  = function() {
    var keyArray = [];
    var keys = { accelerate: false, brake: false, left: false, right: false, handbrake: false };
    var handledKeys = [37, 38, 39, 40, 32];

    var handleKeyDown = function(event) {
        var key, knowKey;
        key = event.which;
        if (handledKeys.indexOf(key) > -1) {
            event.preventDefault();
        }
        if (keyArray.indexOf(key) > -1) {
            return;
        }
        knowKey = true;
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
                knowKey = false;
        }
        if (knowKey) {
            keyArray.push(key);
        }
    };

    var handleKeyUp = function(event) {
        var i, key;
        key = event.which;
        i = keyArray.indexOf(key);
        if (i > -1) {
            keyArray.splice(i, 1);
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
};