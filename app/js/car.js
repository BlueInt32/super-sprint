'use strict';

var car_maker = function(_consts, _carIndex, _configuration) {
  var that = this,
    configuration = _configuration,
    consts = _consts,
  // B2
    frontTires = [],
    rearTires = [],
    tires = [],
    tiresCount = 0,
    directionJoints = [],
    probeSystem = null,

  // Car Behaviours
    driftTrigger = configuration.driftTrigger,
    accelerationFactor = configuration.accelerationFactor,
    localNormalVector = new b2.cMath.b2Vec2(1, 0),
    vCurrentRightNormals = [],
    linearVelocities = [],
    currentRightForwards = [],

  // Steering mgmt
    lockAngleDeg = configuration.wheelMaxAngle,

  //var  from lock to lock in 0.5 sec
    adherenceFactor = 1,

  //states
    adherence = true,
    drifting = false,
    puddleEffect = false,

  //for now checkPoints are relative to cars, they shouldn't...
    checkPointManager = null;

  //PIXI
  var pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(CarsConfig[_carIndex].spritePath));
  pixiSprite.anchor.x  = 0.5;
  pixiSprite.anchor.y = 0.5;
  pixiSprite.scale.x = 1;
  pixiSprite.scale.y = 1;

  that.setBox2dData= function(box2dData){
    console.log(box2dData);
    rearTires = box2dData.rearTires;
    frontTires = box2dData.frontTires;
    tires = rearTires.concat(frontTires);
    tiresCount = tires.length;
    directionJoints = box2dData.directionJoints;
    if(box2dData.hasOwnProperty("probeSystem")){
      var probeSystem = box2dData.probeSystem;
    }
    if(directionJoints[0]){
      directionJoints[0].SetLimits(0, 0);
    }
    else{
      directionJoints[1].SetLimits(0, 0);
    }
    b2Body = box2dData.carBody;
  };


  that.setPosition = function(chosenPosition){
    var temp = chosenPosition.Copy();
    temp.Add(b2Body.GetPosition());
    b2Body.SetPosition(temp);
    for(var i = 0;i< tires.length();i++){
      temp = chosenPosition.Copy();
      temp.Add(tires[i].GetPosition());
      tires[i].SetPosition(temp);
    }
    if(typeof probeSystem !== "undefined" && probeSystem !== null){
      temp = chosenPosition.Copy();
      temp.Add(probeSystem.GetPosition());
      probeSystem.SetPosition(temp);
    }
  };

  that.updateData = function(keyboardData){
    var localAccelerationVector = new b2.cMath.b2Vec2(0, -accelerationFactor);
    //tires = @tires
    for(var i = 0;i< tires.length();i++){
      console.log(linearVelocities);
      linearVelocities[i] = getLinearVelocity(i)
      currentRightForwards[i] = tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
      vCurrentRightNormals[i] = getLateralVelocity(i)
    }
  };

  that.negateTorque=function (tireIndex){
    return b2.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
  };

  that.getLateralVelocity=function (tireIndex){
    var currentRightNormal = tires[tireIndex].GetWorldVector(localNormalVector);
    var vCurrentRightNormal = b2.math.MulFV(
      b2.math.Dot(currentRightNormal, linearVelocities[tireIndex]),
      currentRightNormal
    );
    return vCurrentRightNormal;
  };

  that.getLinearVelocity =function (tireIndex){
    return tires[tireIndex].GetLinearVelocity();
  };

  that.getForwardVelocity=function  (tireIndex){
    var vCurrentRightForward = b2.math.MulFV(
      b2.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]),
      currentRightForwards[tireIndex]
    );
    return vCurrentRightForward;
  };

  that.applyImpulse=function (vec2){
    //tires = @tires
    for(var i = 0;i< tires.length();i++){
      b2.applyForceToCenter(tires[i], vec2);
    }
  };

  that.updateFriction=function  (vec2){
    //tires = @tires
    for(var i = 0; i < tires.length(); i++){

      if(adherence){
        var tireType = b2.findCustomPropertyValue(tires[i], 'category', 'string')
        if(tireType == 'wheel_rear' && drifting)
        {
          adherenceFactor = 0.2
        }
        else
        {
          adherenceFactor = 1
        }
        var impulse = b2.math.MulFV(- adherenceFactor * tires[i].GetMass(), vCurrentRightNormals[i]);
        if(impulse.Length() > driftTrigger){
          impulse  = b2.math.MulFV(driftTrigger / impulse.Length(), impulse);
        }
        tires[i].ApplyImpulse(impulse, tires[i].GetWorldCenter());
      }
      // this has some effect on how the car turns
      var inertia = tires[i].GetInertia()
      var vel = tires[i].GetAngularVelocity();
      tires[i].ApplyAngularImpulse(10 * inertia * -vel);

      // natural friction against movement. This is a F = -kv type force.
      var currentForwardNormal = getForwardVelocity(i);
      var currentForwardSpeed = currentForwardNormal.Normalize();
      var dragForceMagnitude = -configuration.natural_deceleration * currentForwardSpeed;
      tires[i].ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), tires[i].GetWorldCenter() );

      // here we update how the car behave when its puddleEffect is on (sliding on a paddle).
      if(puddleEffect){
        tires[i].ApplyTorque((puddleEffect ? 1:0) * configuration.puddleFactor);
      }
    }
  };

  return that;
}