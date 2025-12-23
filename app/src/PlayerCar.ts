import B2Helper from './utils/B2Helper.ts';
import settings from './settings.ts';
import Car from './Car.ts';
import SpriteManager from './SpriteManager.ts';

class PlayerCar extends Car {
  localBrakeVector: any;
  localHandBrakeVector: any;
  desiredAngle: number;
  lockAngleDeg: number;
  turnSpeedPerSec: number;
  turnPerTimeStep: number;
  spriteManager: SpriteManager;

  constructor(carIndex: number, pixiContainer: any) {
    super();
    this.carConfig = settings.cars[carIndex];
    this.accelerationFactor = this.carConfig.accelerationFactor;
    this.localAccelerationVector = new B2Helper.cMath.b2Vec2(0, -this.accelerationFactor);
    this.localBrakeVector = B2Helper.math.MulFV(-0.5, this.localAccelerationVector);
    this.localHandBrakeVector = B2Helper.math.MulFV(-0.5, this.localAccelerationVector);
    this.desiredAngle = 0;
    this.lockAngleDeg = this.carConfig.wheelMaxAngle;
    this.driftTrigger = this.carConfig.driftTrigger;
    this.turnSpeedPerSec = settings.cars[carIndex].steeringWheelSpeed * settings.consts.DEGTORAD;
    this.turnPerTimeStep = this.turnSpeedPerSec / 60;

    this.spriteManager = new SpriteManager({
      'spriteType': 'ship',
      'index': carIndex,
      'pixiContainer': pixiContainer
    });
  }

  handleKeyboard(keyboardData: any) {
    if (keyboardData.accelerate) {
      this.accelerate();
    }
    if (keyboardData.handbrake) {
      this.handBrake();
    } else {
      this.handBrakeRelease();
    }
    if (keyboardData.brake) {
      this.brake();
    }
    this.updateSteering(keyboardData);
  }

  updateSteering(keyboardData: any) {
    let angleNow: number, angleToTurn: number, newAngle: number;
    if (keyboardData.right && !this.puddleEffect) {
      this.spriteManager.setState('turnRight');
      this.desiredAngle = this.lockAngleDeg * settings.consts.DEGTORAD;
    } else if (keyboardData.left && !this.puddleEffect) {
      this.spriteManager.setState('turnLeft');
      this.desiredAngle = -this.lockAngleDeg * settings.consts.DEGTORAD;
    } else {
      this.desiredAngle = 0;
      this.spriteManager.setState('still');
    }
    angleNow = this.directionJoints[0].GetJointAngle();
    angleToTurn = this.desiredAngle - angleNow;
    if (Math.abs(angleNow) > this.lockAngleDeg) {
      angleToTurn = -angleNow;
    } else {
      angleToTurn = B2Helper.math.Clamp(angleToTurn, -this.turnPerTimeStep, this.turnPerTimeStep);
    }
    newAngle = angleNow + angleToTurn;
    this.directionJoints[0].SetLimits(newAngle, newAngle);
    this.directionJoints[1].SetLimits(newAngle, newAngle);
    this.updateFriction();
  }

  updateSpritePosition() {
    const position = this.b2Body.GetPosition();
    this.spriteManager.sprite.position.x = position.x * settings.consts.METER;
    this.spriteManager.sprite.position.y = position.y * settings.consts.METER;
    this.spriteManager.sprite.rotation = this.b2Body.GetAngle();
  }

  accelerate() {
    for (const i in this.tires) {
      B2Helper.applyForceToCenter(this.tires[i], this.localAccelerationVector);
    }
  }

  brake() {
    for (const i in this.tires) {
      B2Helper.applyForceToCenter(this.tires[i], this.localBrakeVector);
    }
  }

  handBrake() {
    for (const i in this.tires) {
      B2Helper.applyForceToCenter(this.tires[i], this.localHandBrakeVector);
      this.drifting = true;
    }
  }

  handBrakeRelease() {
    this.drifting = false;
  }
}

export default PlayerCar;
