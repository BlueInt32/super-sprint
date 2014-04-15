function jsonB2Loader(consts, world)
{
	var me = this;
	this.world = world;
	this.consts = consts;
	this.car = null;
}

jsonB2Loader.prototype.loadCar = function(carDescriptorPath)
{
	var me = this;
	this.loadJSON(carDescriptorPath, function(response)
	{
		var jsonData = JSON.parse(response).box2d;
		me.carBodyDef = new b2.dyn.b2BodyDef();
		me.carFixtureDef = new b2.dyn.b2FixtureDef();
		me.carFixtureDef.shape = new b2.shapes.b2PolygonShape();

		// Bodies
		var b2Bodies = [];
		for(var i = 0, l = jsonData.bodies.body.length; i < l; i++)
		{
			var jsonBody = jsonData.bodies.body[i];
			me.carBodyDef.position.Set(jsonBody.x/me.consts.METER + me.consts.STAGE_WIDTH_B2 / 2, jsonBody.y/-me.consts.METER  + me.consts.STAGE_HEIGHT_B2 / 2);

			var body = me.world.CreateBody(me.carBodyDef);
			b2Bodies[jsonBody.name] = body;

			for(var j = 0, m = jsonBody.fixtures.fixture.length; j < m; j++)
			{
				var fixture = jsonBody.fixtures.fixture[j];
				if(fixture.shapeType === "edgeShape")
					continue;
				me.carFixtureDef.density = 1;
				me.carFixtureDef.restitution = 0;

				var vertices = [];
				console.log(fixture);
				console.log(fixture.vertex.length);
				for (var k = 0, n = fixture.vertex.length; k < n; k++) {
					vertices.push(new b2.cMath.b2Vec2(fixture.vertex[k].x / me.consts.METER,fixture.vertex[k].y / -me.consts.METER));
				}

				me.carFixtureDef.shape.SetAsArray(vertices, fixture.vertex.length);
				fixture = body.CreateFixture(me.carFixtureDef, 0);
				body.SetUserData("carData "+ i + " " + j);
			}
		}

		// Joints
		for(o = 0, p = jsonData.joints.joint.length; o < p; o++)
		{
			var jsonJoint = jsonData.joints.joint[o];
			var jointDef = new b2.joints.b2RevoluteJointDef();
			jointDef.bodyA = b2Bodies[jsonJoint.bodyA];
			jointDef.bodyB = b2Bodies[jsonJoint.bodyB];
			enableMotor = jsonJoint.enableMotor;
			enableLimit = jsonJoint.enableLimit;
			jointDef.localAnchorB.SetZero(); // in FizzX, I've set bodyA to the car body, and bodyB to the wheel.

			var joint = me.world.CreateJoint(jointDef);
		}
	});
};


jsonB2Loader.prototype.debugDraw = function()
{
	var debugDrawer = new b2.dyn.b2DebugDraw();
	//console.log(document.getElementById("canvas"));
	debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
	debugDrawer.SetDrawScale(100);
	debugDrawer.SetFillAlpha(0.5);
	debugDrawer.SetLineThickness(1);
	debugDrawer.SetFlags(
		b2.dyn.b2DebugDraw.e_shapeBit
		| b2.dyn.b2DebugDraw.e_jointBit
		| b2.dyn.b2DebugDraw.e_centerOfMassBit
		//| b2.dyn.b2DebugDraw.e_aabbBit
	);
	this.world.SetDebugDraw(debugDrawer);
};

jsonB2Loader.prototype.loadTrack = function(trackDescriptorPath)
{
	var me = this;
	this.loadJSON(trackDescriptorPath, function(response)
	{
		var jsonData = JSON.parse(response).box2d;
		me.trackBodyDef = new b2.dyn.b2BodyDef();
		me.trackFixtureDef = new b2.dyn.b2FixtureDef();
		me.trackFixtureDef.shape = new b2.shapes.b2PolygonShape();
		var checkPointIndex = 0;
		for(var i = 0, l = jsonData.bodies.body.length; i < l; i++)
		{
			var jsonBody = jsonData.bodies.body[i];
			me.trackBodyDef.position.Set(jsonBody.x/me.consts.METER + me.consts.STAGE_WIDTH_B2 / 2, jsonBody.y/-me.consts.METER  + me.consts.STAGE_HEIGHT_B2 / 2);
			switch	(jsonBody.type)
			{
				case "dynamic":
				me.trackBodyDef.type = b2.dyn.b2Body.b2_dynamicBody; break;
				case "static":
				me.trackBodyDef.type = b2.dyn.b2Body.b2_staticBody; break;
				default:
				me.trackBodyDef.type = b2.dyn.b2Body.b2_staticBody; break;
			}
			me.trackBodyDef.userData = jsonBody.name + i;
			var body = me.world.CreateBody(me.trackBodyDef);

			for(var j = 0, m = jsonBody.fixtures.fixture.length; j < m; j++)
			{
				var fixture = jsonBody.fixtures.fixture[j];
				me.trackFixtureDef.isSensor = (jsonBody.type === "dynamic");// within a track, dynamic bodies have to be treated like checkpoints : sensors !

				me.trackFixtureDef.density = 1;
				me.trackFixtureDef.restitution = 0;

				var vertices = [];
				for (var k = fixture.vertex.length - 1; k >= 0; k--) {
					vertices.push(new b2.cMath.b2Vec2(fixture.vertex[k].x / me.consts.METER,fixture.vertex[k].y / -me.consts.METER));
				}

				me.trackFixtureDef.shape.SetAsArray(vertices, 3);
				fixture = body.CreateFixture(me.trackFixtureDef, 0);
				//if(jsonBody.type === "dynamic")
				switch(jsonBody.type)
				{
					case "dynamic":
					fixture.SetUserData(jsonBody.name);break;
					case "static":
					fixture.SetUserData("wall");break;
				}

				body.SetUserData("trackData "+ i + " " + j);
			}
		}
	});
};

jsonB2Loader.prototype.loadJSON = function (filePath, callback)
{
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', filePath, true);
	xobj.onreadystatechange = function ()
	{
		if (xobj.readyState == 4 && xobj.status == "200")
		{
			// .open will NOT return a value but simply returns undefined in async mode so use a callback
			callback(xobj.responseText);
		}
	};
	xobj.send(null);

};

