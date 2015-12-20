"use strict";

var CheckpointManager = function(nbCheckPoints) {

  this.nbCheckPoints = nbCheckPoints;
  this.currentCheckPointIndex = -1;
  this.startLap = null;
  this.lastLapTime = null;
  this.bestLapTime = 0;
  this.nbLaps = 0;

   
  this.updateLapTime();
  this.updateBestLapTime();
};

CheckpointManager.prototype.step = function(checkpointIndex) {
  var lapTime, now;
  if (currentCheckPointIndex % nbCheckPoints === checkpointIndex) {
    return;
  }
  if (checkpointIndex === 0) {
    if (currentCheckPointIndex === -1) {
      this.startLap = Date.now();
      this.currentCheckPointIndex = 0;
      that.updateLapTime(0);
    } else {
      now = Date.now();
      lapTime = now - startLap;
      this.lastLapTime = lapTime;
      this.startLap = now;
      if (bestLapTime === 0) {
        this.bestLapTime = lastLapTime;
      } else if (lastLapTime < bestLapTime) {
        this.bestLapTime = lastLapTime;
      }
      that.updateLapTime(lastLapTime);
      that.updateBestLapTime(bestLapTime);
    }
  }
  if (checkpointIndex === (currentCheckPointIndex + 1) % nbCheckPoints) {
    return currentCheckPointIndex++;
  }
};

CheckpointManager.prototype.updateLapTime = function(valueInMs) {
  var strValue = typeof valueInMs !== 'undefined' ? valueInMs / 1000 + "s" : "---";
  document.getElementById("lapTime").innerHTML = "Lap : " + strValue;
};
CheckpointManager.prototype.updateBestLapTime = function(valueInMs) {
  var strValue = typeof valueInMs !== 'undefined' ? valueInMs / 1000 + "s" : "---";
  document.getElementById("bestLapTime").innerHTML = "Best : " + strValue;
};

module.exports = CheckpointManager;
