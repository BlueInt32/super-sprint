import B2Helper from './utils/B2Helper.ts';

class Car {
  frontTires: any[];
  rearTires: any[];
  tires: any[];
  tiresCount: number;
  localNormalVector: any;
  vCurrentRightNormals: any[];
  linearVelocities: any[];
  currentRightForwards: any[];
  adherenceFactor: number;
  adherence: boolean;
  drifting: boolean;
  puddleEffect: any;
  checkPointManager: any;
  directionJoints: any[];
  localAccelerationVector: any;
  accelerationFactor: any;
  b2Body: any;
  carConfig: any;
  driftTrigger: any;

  constructor() {
    // B2
    this.frontTires = [];
    this.rearTires = [];
    this.tires = [];
    this.tiresCount = 0;

    this.localNormalVector = new B2Helper.cMath.b2Vec2(1, 0);
    this.vCurrentRightNormals = [];
    this.linearVelocities = [];
    this.currentRightForwards = [];
    this.adherenceFactor = 1;

    //states
    this.adherence = true;
    this.drifting = false;
    this.puddleEffect = false;

    //fornow checkPoints are relative to cars, they shouldn't...
    this.checkPointManager = null;

    // Steering mgmt
    this.directionJoints = [];
  }

  setBox2dData(box2dData: any) {
    this.rearTires = box2dData.rearTires;
    this.frontTires = box2dData.frontTires;
    this.tires = this.rearTires.concat(this.frontTires);
    this.tiresCount = this.tires.length;
    this.directionJoints = box2dData.directionJoints;
    this.b2Body = box2dData.carBody;
    return this.b2Body;
  }

  setPosition(chosenPosition: any) {
    this.b2Body.SetPosition(chosenPosition);
    this.foreachTire((tire: any, tireIndex: number) => {
      tire.SetPosition(chosenPosition);
    });
  }

  updateData() {
    this.localAccelerationVector = new B2Helper.cMath.b2Vec2(0, -this.accelerationFactor);
    this.foreachTire((tire: any, tireIndex: number) => {
      this.linearVelocities[tireIndex] = this.getLinearVelocity(tireIndex);
      this.currentRightForwards[tireIndex] = tire.GetWorldVector(new B2Helper.cMath.b2Vec2(0, 1));
      this.vCurrentRightNormals[tireIndex] = this.getLateralVelocity(tireIndex);
    });
  }

  negateTorque(tireIndex: number) {
    return B2Helper.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
  }

  getLateralVelocity(tireIndex: number) {
    const currentRightNormal = this.tires[tireIndex].GetWorldVector(this.localNormalVector);
    const vCurrentRightNormal = B2Helper.math.MulFV(
      B2Helper.math.Dot(currentRightNormal, this.linearVelocities[tireIndex]),
      currentRightNormal
    );
    return vCurrentRightNormal;
  }

  getLinearVelocity(tireIndex: number) {
    return this.tires[tireIndex].GetLinearVelocity();
  }

  getForwardVelocity(tireIndex: number) {
    const vCurrentRightForward = B2Helper.math.MulFV(
      B2Helper.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]),
      this.currentRightForwards[tireIndex]
    );
    return vCurrentRightForward;
  }

  applyImpulse(vec2: any) {
    this.foreachTire((tire: any, tireIndex: number) => {
      B2Helper.applyForceToCenter(tire, vec2);
    });
  }

  updateFriction() {
    this.foreachTire((tire: any, tireIndex: number) => {
      if (this.adherence) {
        const tireType = B2Helper.findCustomPropertyValue(tire, 'category', 'string');
        if (tireType == 'wheel_rear' && this.drifting) {
          this.adherenceFactor = this.carConfig.driftAdherenceFactor;
        }
        else {
          this.adherenceFactor = this.carConfig.normalAdherenceFactor;
        }
        let impulse = B2Helper.math.MulFV(-this.adherenceFactor * tire.GetMass(), this.vCurrentRightNormals[tireIndex]);
        //console.log(impulse.Length() - this.driftTrigger);
        if (impulse.Length() > this.driftTrigger) {
          impulse = B2Helper.math.MulFV(this.driftTrigger / impulse.Length(), impulse);
        }
        tire.ApplyImpulse(impulse, tire.GetWorldCenter());
      }
      // this has some effect on how the car turns
      const inertia = tire.GetInertia();
      const vel = tire.GetAngularVelocity();
      tire.ApplyAngularImpulse(10 * inertia * -vel);

      // natural friction against movement. This is a F = -kv type force.
      const currentForwardNormal = this.getForwardVelocity(tireIndex);
      const currentForwardSpeed = currentForwardNormal.Normalize();
      const dragForceMagnitude = -this.carConfig.natural_deceleration * currentForwardSpeed;
      tire.ApplyForce(B2Helper.math.MulFV(dragForceMagnitude, currentForwardNormal), tire.GetWorldCenter());

      // here we update how the car behave when its puddleEffect is on (sliding on a paddle).
      if (this.puddleEffect) {
        tire.ApplyTorque((this.puddleEffect ? 1 : 0) * this.carConfig.puddleFactor);
      }
    });
  }

  foreachTire(perTireAction: (tire: any, tireIndex: number) => void) {
    for (let i = 0; i < this.tires.length; i++) {
      perTireAction.call(this, this.tires[i], i);
    }
  }
}

export default Car;
