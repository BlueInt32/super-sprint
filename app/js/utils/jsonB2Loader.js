function jsonB2Loader(trackPath, consts, world)
{
	var me = this;
	this.trackData = null;
	this.world = world;
	this.loadJSON(trackPath	, function(response)
	{
		jsonresponse = JSON.parse(response);
		me.trackData = jsonresponse;

		me.setBodies(jsonresponse.box2d, consts.STAGE_WIDTH_B2, consts.STAGE_HEIGHT_B2);
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
		//| b2.dyn.b2DebugDraw.e_centerOfMassBit 
		//| b2.dyn.b2DebugDraw.e_aabbBit
	);
	this.world.SetDebugDraw(debugDrawer);
};

jsonB2Loader.prototype.setBodies = function(bodyEntities, canvasWidth, canvasHeight) 
{
	this.bodyDef = new b2.dyn.b2BodyDef();
	this.bodyDef.type = b2.dyn.b2Body.b2_staticBody;

	for(var i = 0, l = bodyEntities.bodies.body.length; i < l; i++)
	{
		var entity = bodyEntities.bodies.body[i];
		this.bodyDef.position.Set(entity.x/100 + canvasWidth / 2, entity.y/-100  + canvasHeight / 2);
		
	    this.bodyDef.userData = entity.name + i;

	    //console.log(entity.fixtures.fixture);
	    for(var j = 0, m = entity.fixtures.fixture.length; j < m; j++) 
		{
	    	var body = this.world.CreateBody(this.bodyDef);
			var fixture = entity.fixtures.fixture[j];
			//console.log(fixture);
			this.fixDef = new b2.dyn.b2FixtureDef();
			this.fixDef.shape = new b2.shapes.b2PolygonShape();
			this.fixDef.density = 1;
			this.fixDef.restitution = 0.4;
			for (var k = fixture.vertex.length - 1; k >= 0; k--) {
				fixture.vertex[k].x /= 100; 
				fixture.vertex[k].y /= -100;
			};
			this.fixDef.shape.SetAsArray(fixture.vertex, fixture.vertex.length);
			//var arrayVertices = fixture.vertex;
			var fix = body.CreateFixture(this.fixDef);
			//console.log(fix);
		}
	}
	this.ready = true;
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

