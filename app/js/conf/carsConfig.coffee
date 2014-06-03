class CarModel_1
    constructor:()->
        @width = 40; # px unit
        @height= 25; # px unit
        @spritePath= 'assets/cars/images/Voiture_03.png';
        @jsonPath= 'assets/cars/car0.json';
        @probesSystemPath = 'assets/cars/probeSystem0.json';

        # physics properties
        @accelerationFactor= 0.1;
        @driftTrigger= 0.003;
        @driftTriggerWithHandbrake= 0.001;
        @natural_deceleration= 0.01;

        @steeringWheelSpeed = 200;
        @wheelMaxAngle= 30;

        # car body
        @restitution= 0.1;
        @puddleFactor= 0.005;

CarsConfig = [new CarModel_1()];