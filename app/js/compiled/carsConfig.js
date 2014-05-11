var CarModel_1, CarsConfig;

CarModel_1 = (function() {
  function CarModel_1() {
    this.width = 40;
    this.height = 25;
    this.spritePath = 'assets/cars/images/Voiture_03.png';
    this.jsonPath = 'assets/cars/car0.json';
    this.accelerationFactor = 0.1;
    this.driftTrigger = 0.003;
    this.driftTriggerWithHandbrake = 0.001;
    this.natural_deceleration = 0.01;
    this.steeringWheelSpeed = 200;
    this.wheelMaxAngle = 30;
    this.restitution = 0.1;
    this.puddleFactor = 0.005;
  }

  return CarModel_1;

})();

CarsConfig = [new CarModel_1()];
