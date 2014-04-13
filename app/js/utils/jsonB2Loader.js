function jsonB2Loader(trackPath, consts, world)
{
	var me = this;
	this.trackData = null;
	this.world = world;
	this.consts = consts;
	this.loadJSON(trackPath	, function(response)
	{
		jsonresponse = JSON.parse(response);
		me.trackData = jsonresponse;

		me.loadTrack(jsonresponse.box2d, me.consts.STAGE_WIDTH_B2, me.consts.STAGE_HEIGHT_B2);
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

jsonB2Loader.prototype.loadTrack = function(bodyEntities) 
{
	this.bodyDef = new b2.dyn.b2BodyDef();
	this.fixDef = new b2.dyn.b2FixtureDef();
	this.fixDef.shape = new b2.shapes.b2PolygonShape();
	var checkPointIndex = 0;
	for(var i = 0, l = bodyEntities.bodies.body.length; i < l; i++)
	{
		var jsonBody = bodyEntities.bodies.body[i];
		this.bodyDef.position.Set(jsonBody.x/100 + this.consts.STAGE_WIDTH_B2 / 2, jsonBody.y/-100  + this.consts.STAGE_HEIGHT_B2 / 2);
		switch	(jsonBody.type)
		{
			case "dynamic":
			this.bodyDef.type = b2.dyn.b2Body.b2_dynamicBody; break; 

			case "static":
			this.bodyDef.type = b2.dyn.b2Body.b2_staticBody; break;
			default:
			this.bodyDef.type = b2.dyn.b2Body.b2_staticBody; break;
		}
		
	    this.bodyDef.userData = jsonBody.name + i;
	    var body = this.world.CreateBody(this.bodyDef);

	    for(var j = 0, m = jsonBody.fixtures.fixture.length; j < m; j++) 
		{
			var fixture = jsonBody.fixtures.fixture[j];
			this.fixDef.isSensor = (jsonBody.type === "dynamic");// within a track, dynamic bodies have to be treated like checkpoints : sensors !

			this.fixDef.density = 1;
			this.fixDef.restitution = 0;

			var vertices = [];
			for (var k = fixture.vertex.length - 1; k >= 0; k--) {
				vertices.push(new b2.cMath.b2Vec2(fixture.vertex[k].x / 100,fixture.vertex[k].y / -100));
			};

			this.fixDef.shape.SetAsArray(vertices, 3);
			var fixture = body.CreateFixture(this.fixDef, 0);
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
	}
	xobj.send(null);

};

