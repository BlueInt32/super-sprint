class TrackModel_1
	constructor:()->
		@id=0
		@nbCheckpoints=3
		@jsonPath= 'assets/tracks/track0.json'
		@imagePath= 'assets/tracks/images/track1.png'
class TrackModel_2
	constructor:()->
		@id=1
		@nbCheckpoints=3
		@json= 'assets/tracks/track1.json'
		@imagePath= 'assets/tracks/images/track1.png'

TracksConfig = [new TrackModel_1(),new TrackModel_2()];