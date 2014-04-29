var Car0Config = function()
{
    this.width = 40; // px unit
    this.height= 25; // px unit
    this.sprite= "assets/cars/images/Voiture_03.png";
    this.json= "assets/cars/car0.json";

    // physics properties
    this.accelerationFactor= 0.1;
    this.driftTrigger= 0.003;
    this.driftTriggerWithHandbrake= 0.001;
    this.natural_deceleration= 0.01;

    this.steeringWheelSpeed = 200;
    this.wheelMaxAngle= 30;

    // car body
    this.restitution= 0.1;
    this.puddleFactor= 0.005;
};

var Cars = [new Car0Config()];