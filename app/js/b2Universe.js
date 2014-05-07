var B2Universe = function (consts)
{
	var me = this;
	//World & Gravity
	this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
	var contactListener = new Box2D.Dynamics.b2ContactListener();
	this.cars = [];
	this.consts = consts;
	var DEGTORAD  = 2 * Math.PI / 360;

	var carPlaced = 0;

	var puddleRandomDirectionArray = new Array(1, -1);

	var contactManager = new ContactManager(this.world, this.cars);



	this.CreatePuddles = function()
	{
		var bodyDef = new b2.dyn.b2BodyDef();
		bodyDef.position.Set(this.consts.STAGE_WIDTH_B2 / 4, this.consts.STAGE_HEIGHT_B2 / 2);
		var groundBody = this.world.CreateBody(bodyDef);

		var puddleFixtureDef = new b2.dyn.b2FixtureDef();
		puddleFixtureDef.shape = new b2.shapes.b2PolygonShape();
		puddleFixtureDef.isSensor = true;
		puddleFixtureDef.shape.SetAsBox( 1, 1, new b2.cMath.b2Vec2(-10,15), 20*DEGTORAD );


		var groundAreaFixture = groundBody.CreateFixture(puddleFixtureDef);
		groundAreaFixture.SetUserData( { friction:0.5 });
		// me.world.CreateBody(bodyDef).CreateFixture(groundAreaFixture, 0);

		// puddleFixtureDef.shape.SetAsBox( 9, 5, new b2.cMath.b2Vec2(5,20), -40*DEGTORAD );
		// groundAreaFixture = groundBody.CreateFixture(puddleFixtureDef);
		// groundAreaFixture.SetUserData( {friction:0.2} );
	};

	this.PositionTrack = function(trackWalls)
	{
		for (var i = trackWalls.length - 1; i >= 0; i--)
		{
			var position = trackWalls[i].GetPosition();
			trackWalls[i].SetPosition(b2.math.AddVV(this.consts.ScreenCenterVector, position));
		}

	};

	this.AddCar = function(carInstance, pixiStage)
	{
		carInstance.checkPointManager = new CheckPointManager(3);
		this.cars.push(carInstance);
		pixiStage.addChild(carInstance.pixiSprite);

		var startPositions = getBodiesWithNamesStartingWith(this.world, "start");
		//var pos = startPositions[carPlaced++].GetPosition();
		var pos = new b2.cMath.b2Vec2(0, 0);
		//console.log(carInstance);
		carInstance.setPosition(b2.math.AddVV(this.consts.ScreenCenterVector, pos));
		//console.log(this.cars);
	};

};