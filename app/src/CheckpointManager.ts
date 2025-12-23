class CheckpointManager {
  nbCheckPoints: number;
  currentCheckPointIndex: number;
  startLap: number | null;
  lastLapTime: number | null;
  bestLapTime: number;
  nbLaps: number;

  constructor(nbCheckPoints: number) {
    this.nbCheckPoints = nbCheckPoints;
    this.currentCheckPointIndex = -1;
    this.startLap = null;
    this.lastLapTime = null;
    this.bestLapTime = 0;
    this.nbLaps = 0;

    this.updateLapTime();
    this.updateBestLapTime();
  }

  step(checkpointIndex: number): number | undefined {
    if (this.currentCheckPointIndex % this.nbCheckPoints === checkpointIndex) {
      return;
    }
    if (checkpointIndex === 0) {
      if (this.currentCheckPointIndex === -1) {
        this.startLap = Date.now();
        this.currentCheckPointIndex = 0;
        this.updateLapTime(0);
      } else {
        const now = Date.now();
        const lapTime = now - this.startLap!;
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
  }

  updateLapTime(valueInMs?: number): void {
    const strValue = typeof valueInMs !== 'undefined' ? (valueInMs / 1000).toFixed(2) + "s" : "---";
    const element = document.getElementById("lapTime");
    if (element) {
      element.innerHTML = "<span style='color: #AAA;'>Lap:</span> " + strValue;
    }
  }

  updateBestLapTime(valueInMs?: number): void {
    const strValue = typeof valueInMs !== 'undefined' ? (valueInMs / 1000).toFixed(2) + "s" : "---";
    const element = document.getElementById("bestLapTime");
    if (element) {
      element.innerHTML = "<span style='color: #AAA;'>Best:</span> " + strValue;
    }
  }
}

export default CheckpointManager;
