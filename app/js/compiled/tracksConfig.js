var TrackModel_1, TrackModel_2, TracksConfig;

TrackModel_1 = (function() {
  function TrackModel_1() {
    this.id = 0;
    this.nbCheckpoints = 3;
    this.jsonPath = 'assets/tracks/track0.json';
    this.imagePath = 'assets/tracks/images/track1.png';
  }

  return TrackModel_1;

})();

TrackModel_2 = (function() {
  function TrackModel_2() {
    this.id = 1;
    this.nbCheckpoints = 3;
    this.json = 'assets/tracks/track1.json';
    this.imagePath = 'assets/tracks/images/track1.png';
  }

  return TrackModel_2;

})();

TracksConfig = [new TrackModel_1(), new TrackModel_2()];
