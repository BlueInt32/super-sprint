function jsonB2Loader(consts, world)
{
	var me = this;
	this.world = world;
	this.consts = consts;

}

jsonB2Loader.prototype.loadCar = function()
{


}


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
		me.bodyDef = new b2.dyn.b2BodyDef();
		me.fixDef = new b2.dyn.b2FixtureDef();
		me.fixDef.shape = new b2.shapes.b2PolygonShape();
		var checkPointIndex = 0;
		for(var i = 0, l = jsonData.bodies.body.length; i < l; i++)
		{
			var jsonBody = jsonData.bodies.body[i];
			me.bodyDef.position.Set(jsonBody.x/100 + me.consts.STAGE_WIDTH_B2 / 2, jsonBody.y/-100  + me.consts.STAGE_HEIGHT_B2 / 2);
			switch	(jsonBody.type)
			{
				case "dynamic":
				me.bodyDef.type = b2.dyn.b2Body.b2_dynamicBody; break;

				case "static":
				me.bodyDef.type = b2.dyn.b2Body.b2_staticBody; break;
				default:
				me.bodyDef.type = b2.dyn.b2Body.b2_staticBody; break;
			}
			me.bodyDef.userData = jsonBody.name + i;
			var body = me.world.CreateBody(me.bodyDef);

			for(var j = 0, m = jsonBody.fixtures.fixture.length; j < m; j++)
			{
				var fixture = jsonBody.fixtures.fixture[j];
				me.fixDef.isSensor = (jsonBody.type === "dynamic");// within a track, dynamic bodies have to be treated like checkpoints : sensors !

				me.fixDef.density = 1;
				me.fixDef.restitution = 0;

				var vertices = [];
				for (var k = fixture.vertex.length - 1; k >= 0; k--) {
					vertices.push(new b2.cMath.b2Vec2(fixture.vertex[k].x / 100,fixture.vertex[k].y / -100));
				}

				me.fixDef.shape.SetAsArray(vertices, 3);
				fixture = body.CreateFixture(me.fixDef, 0);
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

