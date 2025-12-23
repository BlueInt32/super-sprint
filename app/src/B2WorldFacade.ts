import B2Helper from './utils/B2Helper.ts';
import B2Loader from './B2Loader.ts';
import playerCommand from './playerCommand.ts';
import ContactManager from './ContactManager.ts';

class B2WorldFacade {
  b2World: any;
  playerCar: any;
  otherCars: any[];
  trackBodySet: any;
  b2Loader: B2Loader;
  contactManager: ContactManager | null;
  debugDrawActive: boolean;

  constructor(debugDrawActive: boolean) {
    this.b2World = new B2Helper.dyn.b2World(new B2Helper.cMath.b2Vec2(0, 0), true);
    this.playerCar = null;
    this.otherCars = [];
    this.trackBodySet = {};
    this.b2Loader = new B2Loader(this);
    this.contactManager = null;
    this.debugDrawActive = debugDrawActive;
    if (debugDrawActive) {
      B2Helper.initDebugDraw(this.b2World);
    }
  }

  addB2Element(specs: any) {
    this.b2Loader.addElement(specs);
  }

  update() {
    if (!this.playerCar) {
      return;
    }
    this.b2World.Step(1 / 60, 3, 3);
    this.b2World.ClearForces();
    if (this.debugDrawActive) {
      this.b2World.DrawDebugData();
    }
    this.playerCar.updateData();
    this.playerCar.handleKeyboard(playerCommand.keys);
    this.playerCar.updateSpritePosition();
    if (!this.contactManager) {
      this.contactManager = new ContactManager(this.b2World, [this.playerCar]);
    }
    for (let j = 0; j < this.otherCars.length; j++) {
      const car = this.otherCars[j];
      car.updateData();
      car.updateFriction();
    }
  }

  toggleDebugDraw() {
    this.debugDrawActive = !this.debugDrawActive;

    // Initialize debug draw if it wasn't initialized before
    if (this.debugDrawActive && !this.b2World.m_debugDraw) {
      B2Helper.initDebugDraw(this.b2World);
    }

    // Show or hide the debug canvas
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.style.display = this.debugDrawActive ? 'block' : 'none';
    }
  }
}

export default B2WorldFacade;
