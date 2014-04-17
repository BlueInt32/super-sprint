function RealCar(consts, carIndex)
{
    this.CarConfig = Cars[carIndex];
    this.id = carIndex;
    this.METER = consts.METER;
    this.carBodyDef = new b2.dyn.b2BodyDef();
    this.b2Body = null;
    this.CAR_WIDTH_B2 = this.CarConfig.width / 2 / this.METER;
    this.CAR_HEIGHT_B2 = this.CarConfig.height / 2 / this.METER;
    this.Current_Drift_trigger = this.CarConfig.driftTrigger;
    this.DEGTORAD = 2 * Math.PI / 360;


    this.lockAngle = 30 * this.DEGTORAD;
    this.turnSpeedPerSec = 160 * this.DEGTORAD;//from lock to lock in 0.5 sec
    this.turnPerTimeStep = this.turnSpeedPerSec / 60;
    this.desiredAngle = 0;

    /* PIXI ! */
    this.pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(Cars[carIndex].sprite));
    this.pixiSprite.anchor.x  = 0.5;
    this.pixiSprite.anchor.y = 0.5;
    this.pixiSprite.scale.x = 1;
    this.pixiSprite.scale.y = 1;

    this.adherence = true;
    this.paddleEffect = 0;

    this.carFixture = new b2.dyn.b2FixtureDef();
    this.carFixture.shape = new b2.shapes.b2PolygonShape();
    this.carFixture.density = 1;
    this.carFixture.restitution = this.CarConfig.restitution;

    this.tires = [];
    this.directionJoints = [];


    this.vCurrentRightNormals = [];

    this.linearVelocities = []; // updated each turn (see updateData) this is the (vx, vy) vector in world ref for each tire
                                // 0 : front left, 1: front right, 2 :
    this.currentRightForwards = []; // updated each turn (see updateData) this is the 1-length vector in world ref, corresponding to the pilot look straight ahead.

    this.checkPointManager = null;
}

RealCar.prototype.SetBox2dData = function(box2dData)
{
    this.b2Body = box2dData.carBody;
    this.tires = box2dData.tires;
    this.directionJoints = box2dData.directionJoints;

    //console.log(this.directionJoints);
};

RealCar.prototype.updateData = function (keyboardData)
{
    //console.log(keyboardData);
    //compute velocity which is used several times per turn
    for (var i = 0; i < 4; i++) {
        this.linearVelocities[i] = this.GetLinearVelocity(i);
        this.currentRightForwards[i] = this.tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
        this.vCurrentRightNormals[i] = this.GetLateralVelocity(i);
    }
    //this.b2Body.GetWorldVector(new b2.cMath.b2Vec2(0, 1));

    if (keyboardData.accelerate) this.Accelerate();
    if (keyboardData.handbrake) this.HandBrake();
    else this.HandBrakeRelease();
    if(keyboardData.brake)
        this.Brake();


    // if (keyboardData.right && this.paddleEffect === 0) this.TurnRight();
    // else if (keyboardData.left && this.paddleEffect === 0) this.TurnLeft();

    //control steering
    if (keyboardData.right && this.paddleEffect === 0) this.desiredAngle =  this.lockAngle;
    else if (keyboardData.left && this.paddleEffect === 0) this.desiredAngle = -this.lockAngle;
    else this.desiredAngle = 0;

    var angleNow = this.directionJoints[0].GetJointAngle();

    var angleToTurn = this.desiredAngle - angleNow;
    angleToTurn = b2Math.Clamp( angleToTurn, -this.turnPerTimeStep, this.turnPerTimeStep );
    var newAngle = angleNow + angleToTurn;
    this.directionJoints[0].SetLimits( newAngle, newAngle );
    this.directionJoints[1].SetLimits( newAngle, newAngle );

    this.UpdateFriction();

    var position = this.b2Body.GetPosition();
    this.pixiSprite.position.x = position.x * this.METER;
    this.pixiSprite.position.y = position.y * this.METER;
    this.pixiSprite.rotation = this.b2Body.GetAngle();

    //this.previousKeyboardData = keyboardData;
};

RealCar.prototype.Accelerate = function ()
{
    for (var i = 0; i < 4; i++)
    {
        this.tires[i].ApplyForce(this.tires[i].GetWorldVector(new Box2D.Common.Math.b2Vec2(0, this.CarConfig.accelerationFactor)), this.tires[i].GetWorldCenter());
    }
};
RealCar.prototype.Brake = function ()
{
    for (var i = 0; i < 4; i++)
    {
        this.tires[i].ApplyForce(this.tires[i].GetWorldVector(new Box2D.Common.Math.b2Vec2(0,this.CarConfig.accelerationFactor / -3)), this.tires[i].GetWorldCenter());
    }
};

RealCar.prototype.HandBrake = function ()
{
    for (var i = 0; i < 4; i++)
    {
        this.tires[i].ApplyForce(this.tires[i].GetWorldVector(new Box2D.Common.Math.b2Vec2(0, this.CarConfig.accelerationFactor / -4)), this.tires[i].GetWorldCenter());
        this.Current_Drift_trigger = this.CarConfig.driftTriggerWithHandbrake;
    }
};
RealCar.prototype.HandBrakeRelease = function ()
{
    this.Current_Drift_trigger = this.CarConfig.driftTrigger;
};

RealCar.prototype.TurnLeft = function ()
{
    for (var i = 0; i < 4; i++)
    {
        this.tires[i].ApplyTorque(-this.CarConfig.rotateFactor * this.NegateTorque(i));
    }
};
RealCar.prototype.TurnRight = function ()
{
    for (var i = 0; i < 4; i++)
    {
        this.tires[i].ApplyTorque(this.NegateTorque(i) * this.CarConfig.rotateFactor);
    }
};

RealCar.prototype.NegateTorque = function(tireIndex)
{
    return b2.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
};

RealCar.prototype.GetLateralVelocity = function (tireIndex)
{
    var currentRightNormal = this.tires[tireIndex].GetWorldVector(new b2.cMath.b2Vec2(1, 0));
    var vCurrentRightNormal = b2.math.MulFV(b2.math.Dot(currentRightNormal, this.linearVelocities[tireIndex]), currentRightNormal);
    //if(tireIndex===0) console.log(vCurrentRightNormal);
    return vCurrentRightNormal;
};

RealCar.prototype.GetLinearVelocity = function(tireIndex)
{
     return this.tires[tireIndex].GetLinearVelocity();
}

RealCar.prototype.GetForwardVelocity = function (tireIndex)
{
    var vCurrentRightForward = b2.math.MulFV(b2.math.Dot(this.currentRightForwards[tireIndex], this.linearVelocities[tireIndex]), this.currentRightForwards[tireIndex]);
    return vCurrentRightForward;
};


RealCar.prototype.UpdateFriction = function ()
{
    for (var i = 0; i < 4; i++)
    {
        if(this.adherence)
        {
            // Prevent car from sliding. Let it slide where lateral velocity is high (drift);
            var impulse = b2.math.MulFV(-this.tires[i].GetMass(), this.vCurrentRightNormals[i]);

            //if(i === 0) console.log(this.vCurrentRightNormals[i]);
            if (impulse.Length() > this.Current_Drift_trigger)
                impulse  = b2.math.MulFV(this.Current_Drift_trigger / impulse.Length(), impulse);
            this.tires[i].ApplyImpulse(impulse, this.tires[i].GetWorldCenter());
        }
        var inertia = this.tires[i].GetInertia();
        var vel = this.tires[i].GetAngularVelocity();
        this.tires[i].ApplyAngularImpulse(0.1 * inertia * -vel);


        // natural friction against movement. This is a F = -kv type force.
        var currentForwardNormal = this.GetForwardVelocity(i);
        var currentForwardSpeed = currentForwardNormal.Normalize();
        var dragForceMagnitude = -this.CarConfig.natural_deceleration * currentForwardSpeed;
        this.tires[i].ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), this.tires[i].GetWorldCenter() );

        // here we update how the car behave when its paddleEffect is on (sliding on a paddle).
        if(this.paddleEffect !== 0)
        {
            this.tires[i].ApplyTorque(this.paddleEffect * this.RealCarConfig.rotateFactor);
        }
    }
};