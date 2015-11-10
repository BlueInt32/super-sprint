"use strict";

var checkpointManagerMaker = function (nbCheckPoints) {
  var that = {},
    nbCheckPoints = nbCheckPoints,
    currentCheckPointIndex = -1,
    startLap = null,
    lastLapTime = null,
    bestLapTime = 0,
    nbLaps = 0;

  that.step = function (checkpointIndex) {
    var lapTime, now;
    if (currentCheckPointIndex % nbCheckPoints === checkpointIndex) {
      return;
    }
    if (checkpointIndex === 0) {
      if (currentCheckPointIndex === -1) {
        startLap = Date.now();
        currentCheckPointIndex = 0;
        that.updateLapTime(0);
      } else {
        now = Date.now();
        lapTime = now - startLap;
        lastLapTime = lapTime;
        startLap = now;
        if (bestLapTime === 0) {
          bestLapTime = lastLapTime;
        } else if (lastLapTime < bestLapTime) {
          bestLapTime = lastLapTime;
        }
        that.updateLapTime(lastLapTime);
        that.updateBestLapTime(bestLapTime);
      }
    }
    if (checkpointIndex === (currentCheckPointIndex + 1) % nbCheckPoints) {
      return currentCheckPointIndex++;
    }
  };

  that.updateLapTime = function (valueInMs) {
    var strValue = typeof valueInMs !== 'undefined' ? valueInMs / 1000 + "s" : "---";
    document.getElementById("lapTime").innerHTML = "Lap : " + strValue;
  };
  that.updateBestLapTime = function (valueInMs) {
    var strValue = typeof valueInMs !== 'undefined' ? valueInMs / 1000 + "s" : "---";
    document.getElementById("bestLapTime").innerHTML = "Best : " + strValue;
  };

  that.updateLapTime();
  that.updateBestLapTime();

  return that;
};

module.exports = checkpointManagerMaker;