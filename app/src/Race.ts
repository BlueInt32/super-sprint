import B2WorldFacade from './B2WorldFacade.ts';
import CheckpointManager from './CheckpointManager.ts';
import PixiFacade from './PixiFacade.ts';
import PlayerCar from './PlayerCar.ts';
import settings from './settings.ts';

type RaceSpecs = {
  trackId: number;
  pixiFacade: PixiFacade;
};

class Race {
  pixiFacade: PixiFacade;
  b2WorldFacade: B2WorldFacade;

  constructor(raceSpecs: RaceSpecs) {
    this.pixiFacade = raceSpecs.pixiFacade;
    this.b2WorldFacade = new B2WorldFacade(settings.technical.debugDraw);

    this.b2WorldFacade.addB2Element({
      id: 'track',
      type: 'track',
      data: settings.tracks[raceSpecs.trackId],
      onAddedAndPlaced: (trackBodySet) => {
        console.log('Adding track sprite, trackId:', raceSpecs.trackId);
        const trackSprite = this.pixiFacade.createThenAddSprite({
          frameId: "track" + raceSpecs.trackId + ".png",
          anchor: 0
        });
        trackSprite.position.set(0, 0);
        console.log('Track sprite created:', trackSprite);
      }
    });

    const playerCarId = 0;
    this.b2WorldFacade.addB2Element({
      id: 'playercar',
      type: 'car',
      data: settings.cars[playerCarId],
      onAddedAndPlaced: (carBodySet) => {
        if (!this.b2WorldFacade.playerCar) {
          const playerCar = new PlayerCar(playerCarId, this.pixiFacade.container);
          playerCar.checkPointManager = new CheckpointManager(3);
          playerCar.setBox2dData(carBodySet);
          playerCar.name = 'player';
          this.b2WorldFacade.playerCar = playerCar;
        } else {
          this.b2WorldFacade.otherCars.push(carBodySet);
        }
      }
    });
  }

  update(): void {
    this.b2WorldFacade.update();
  }
}

export default Race;
export type { RaceSpecs };
