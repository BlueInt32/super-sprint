var CheckPointManager;

CheckPointManager = (function() {
  function CheckPointManager(nbCheckPoints) {
    this.NbCheckPoints = nbCheckPoints;
    this.CurrentCheckPointIndex = -1;
    this.startLap = null;
    this.LastLapTime = null;
    this.BestLapTime = 0;
    this.NbLaps = 0;
    document.getElementById("lapTime").innerHTML = "Lap : --- ";
    document.getElementById("bestLapTime").innerHTML = "Best : --- ";
  }

  CheckPointManager.prototype.step = function(checkpointIndex) {
    var lapTime, now;
    if (this.CurrentCheckPointIndex % this.NbCheckPoints === checkpointIndex) {
      return;
    }
    if (checkpointIndex === 0) {
      if (this.CurrentCheckPointIndex === -1) {
        this.TotalTime = new Date();
        this.startLap = Date.now();
        this.CurrentCheckPointIndex = 0;
        document.getElementById("lapTime").innerHTML = "Lap : 0.0s";
      } else {
        now = Date.now();
        lapTime = now - this.startLap;
        this.LastLapTime = lapTime;
        this.startLap = now;
        if (this.BestLapTime === 0) {
          this.BestLapTime = this.LastLapTime;
        } else if (this.LastLapTime < this.BestLapTime) {
          this.BestLapTime = this.LastLapTime;
        }
        document.getElementById("lapTime").innerHTML = "Lap : " + this.LastLapTime / 1000 + "s";
        document.getElementById("bestLapTime").innerHTML = "Best : " + this.BestLapTime / 1000 + "s";
      }
    }
    if (checkpointIndex === (this.CurrentCheckPointIndex + 1) % this.NbCheckPoints) {
      return this.CurrentCheckPointIndex++;
    }
  };

  return CheckPointManager;

})();
