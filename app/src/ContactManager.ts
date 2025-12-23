import B2Helper from './utils/B2Helper.ts';

const puddleRandomDirectionArray = [-1, 1];

class ContactManager {
  cars: any[];

  constructor(world: any, cars: any[]) {
    this.cars = cars;
    const contactListener = new B2Helper.dyn.b2ContactListener();
    contactListener.BeginContact = (contact: any) => {
      this.HandleContact(contact, true);
    };

    contactListener.EndContact = (contact: any) => {
      this.HandleContact(contact, false);
    };

    world.SetContactListener(contactListener);
  }

  HandleContact(contact: any, began: boolean) {
    const cInfo = this.ExtractContactType(contact);
    if (cInfo.type === "wall")
      return;
    if (began) {
      switch (cInfo.type) {
        case "cp":
          this.cars[0].checkPointManager.step(parseInt(cInfo.id));
          break;
        case "puddle":
          this.cars[0].adherence = false;
          this.cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random() * 2)];
          break;
        case "boost":
          const boostVector = new B2Helper.cMath.b2Vec2(cInfo.boostVector.x, cInfo.boostVector.y);
          this.cars[0].applyImpulse(boostVector);
          break;
      }
    }
    else {
      this.cars[0].adherence = true;
      this.cars[0].paddleEffect = 0;
    }
  }

  ExtractContactType(contact: any) {
    const aData = contact.GetFixtureA();
    const bData = contact.GetFixtureB();

    if (aData.name === 'wallFixture' || bData.name === 'wallFixture')
      return { 'type': 'wall' };

    if (aData.name.indexOf('cp') === 0)
      return {
        'type': 'cp',
        'id': aData.name.substr(2, 3)
      };
    if (bData.name.indexOf('cp') === 0)
      return {
        'type': 'cp',
        'id': bData.name.substr(2, 3)
      };
    if (aData.name.indexOf('boost') === 0)
      return {
        'type': 'boost',
        'boostVector': aData.customProperties[0].vec2
      };
    if (bData.name.indexOf('boost') === 0)
      return {
        'type': 'boost',
        'boostVector': bData.customProperties[0].vec2
      };
    return { 'type': '' };
  }
}

export default ContactManager;
