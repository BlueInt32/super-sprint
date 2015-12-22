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
  if (this.currentCheckPointIndex % this.nbCheckPoints === checkpointIndex) {
    return;
  }
  if (checkpointIndex === 0) {
    if (this.currentCheckPointIndex === -1) {
      this.startLap = Date.now();
      this.currentCheckPointIndex = 0;
      this.updateLapTime(0);
    } else {
      now = Date.now();
      lapTime = now - this.startLap;
      this.lastLapTime = lapTime;
      this.startLap = now;
      if (this.bestLapTime === 0) {
        this.bestLapTime = this.lastLapTime;
      } else if (this.lastLapTime < this.bestLapTime) {
        this.bestLapTime = this.lastLapTime;
      }
      this.updateLapTime(this.lastLapTime);
      this.updateBestLapTime(this.bestLapTime);
    }
  }
  if (checkpointIndex === (this.currentCheckPointIndex + 1) % this.nbCheckPoints) {
    return this.currentCheckPointIndex++;
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
