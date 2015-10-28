
var car_maker = function(_consts, _carIndex, _configuration) {
	var configuration = _configuration;
	var consts = _consts;
	// B2
	var frontTires = [];
	var rearTires = [];
	var tires = [];
	var tiresCount = 0;
	var directionJoints = [];
	var probeSystem = null;

	// Car Behaviours
	var driftTrigger = configuration.driftTrigger;
	var accelerationFactor = configuration.accelerationFactor;
	var localAccelerationVector = new b2.cMath.b2Vec2(0, -accelerationFactor);
	var localBrakeVector = b2.math.MulFV(-0.5 , localAccelerationVector);
	var localHandBrakeVector = b2.math.MulFV(-0.5, localAccelerationVector);
	var localNormalVector = new b2.cMath.b2Vec2(1, 0);
	var vCurrentRightNormals = [];
	var linearVelocities = [];
	console.log(linearVelocities);
	var currentRightForwards = [];

	// Steering mgmt
	var lockAngleDeg = configuration.wheelMaxAngle;

	//var  from lock to lock in 0.5 sec
	var turnSpeedPerSec = configuration.steeringWheelSpeed * consts.DEGTORAD;
	var turnPerTimeStep = turnSpeedPerSec / 60;
	var desiredAngle = 0;
	var adherenceFactor = 1;

	//states
	var adherence = true;
	var drifting = false;
	var puddleEffect = false;

	//for now checkPoints are relative to cars, they shouldn't...
	var checkPointManager = null;

	//PIXI
	var pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame(CarsConfig[_carIndex].spritePath));
	pixiSprite.anchor.x  = 0.5;
	pixiSprite.anchor.y = 0.5;
	pixiSprite.scale.x = 1;
	pixiSprite.scale.y = 1;

	var setBox2dData= function(box2dData){
		console.log(box2dData);
		var rearTires = box2dData.rearTires;
		var frontTires = box2dData.frontTires;
		var tires = rearTires.concat(frontTires);
		var tiresCount = tires.length;
		var directionJoints = box2dData.directionJoints;
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


	var setPosition = function(chosenPosition){
		var temp = chosenPosition.Copy();
		temp.Add(b2Body.GetPosition());
		b2Body.SetPosition(temp);
		//tires = tires
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

	var updateData = function(keyboardData){
		var localAccelerationVector = new b2.cMath.b2Vec2(0, -accelerationFactor);
		//tires = @tires
		for(var i = 0;i< tires.length();i++){
			console.log(linearVelocities);
			linearVelocities[i] = getLinearVelocity(i)
			currentRightForwards[i] = tires[i].GetWorldVector(new b2.cMath.b2Vec2(0, 1));
			vCurrentRightNormals[i] = getLateralVelocity(i)
		}
	};

	var negateTorque=function (tireIndex){
		return b2.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]) < -0.01 ? -1 : 1;
	};

	var getLateralVelocity=function (tireIndex){
		var currentRightNormal = tires[tireIndex].GetWorldVector(localNormalVector);
		var vCurrentRightNormal = b2.math.MulFV(
			b2.math.Dot(currentRightNormal, linearVelocities[tireIndex]),
			currentRightNormal
		);
		return vCurrentRightNormal;
	};

	var getLinearVelocity =function (tireIndex){
		return tires[tireIndex].GetLinearVelocity();
	};

	var getForwardVelocity=function  (tireIndex){
		vCurrentRightForward = b2.math.MulFV(
			b2.math.Dot(currentRightForwards[tireIndex], linearVelocities[tireIndex]),
			currentRightForwards[tireIndex]
		);
		return vCurrentRightForward;
	};

	var applyImpulse=function (vec2){
		//tires = @tires
		for(var i = 0;i< tires.length();i++){
			b2.applyForceToCenter(tires[i], vec2);
		}
	};

	var updateFriction=function  (vec2){
		//tires = @tires
		for(var i = 0; i < tires.length(); i++){

			if(adherence){
				tireType = b2.findCustomPropertyValue(tires[i], 'category', 'string')
				if(tireType == 'wheel_rear' && drifting)
				{
					adherenceFactor = 0.2
				}
				else
				{
					adherenceFactor = 1
				}
				impulse = b2.math.MulFV(- adherenceFactor * tires[i].GetMass(), vCurrentRightNormals[i]);
				if(impulse.Length() > driftTrigger){
					impulse  = b2.math.MulFV(driftTrigger / impulse.Length(), impulse);
				}
				tires[i].ApplyImpulse(impulse, tires[i].GetWorldCenter());
			}
			// this has some effect on how the car turns
			inertia = tires[i].GetInertia()
			vel = tires[i].GetAngularVelocity();
			tires[i].ApplyAngularImpulse(10 * inertia * -vel);

			// natural friction against movement. This is a F = -kv type force.
			currentForwardNormal = getForwardVelocity(i);
			currentForwardSpeed = currentForwardNormal.Normalize();
			dragForceMagnitude = -configuration.natural_deceleration * currentForwardSpeed;
			tires[i].ApplyForce( b2.math.MulFV(dragForceMagnitude, currentForwardNormal), tires[i].GetWorldCenter() );

			// here we update how the car behave when its puddleEffect is on (sliding on a paddle).
			if(puddleEffect){
				tires[i].ApplyTorque((puddleEffect ? 1:0) * configuration.puddleFactor);
			}
		}
	};

}