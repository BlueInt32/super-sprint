var checkpoint_manager = function(nbCheckPoints) {

  var NbCheckPoints = nbCheckPoints;
  var CurrentCheckPointIndex = -1;
  var startLap = null;
  var LastLapTime = null;
  var BestLapTime = 0;
  var NbLaps = 0;
  document.getElementById("lapTime").innerHTML = "Lap : --- ";
  document.getElementById("bestLapTime").innerHTML = "Best : --- ";

  var step = function (checkpointIndex) {
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
};