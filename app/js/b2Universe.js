var B2Universe = function (consts)
{
	var me = this;
	//World & Gravity
	this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
	
	this.cars = [];
	this.consts = consts;

	var DEGTORAD  = 2 * Math.PI / 360;


//    /$$$$$$   /$$$$$$  /$$   /$$ /$$$$$$$$ /$$$$$$   /$$$$$$  /$$$$$$$$ /$$$$$$
//   /$$__  $$ /$$__  $$| $$$ | $$|__  $$__//$$__  $$ /$$__  $$|__  $$__//$$__  $$
//  | $$  \__/| $$  \ $$| $$$$| $$   | $$  | $$  \ $$| $$  \__/   | $$  | $$  \__/
//  | $$      | $$  | $$| $$ $$ $$   | $$  | $$$$$$$$| $$         | $$  |  $$$$$$
//  | $$      | $$  | $$| $$  $$$$   | $$  | $$__  $$| $$         | $$   \____  $$
//  | $$    $$| $$  | $$| $$\  $$$   | $$  | $$  | $$| $$    $$   | $$   /$$  \ $$
//  |  $$$$$$/|  $$$$$$/| $$ \  $$   | $$  | $$  | $$|  $$$$$$/   | $$  |  $$$$$$/
//   \______/  \______/ |__/  \__/   |__/  |__/  |__/ \______/    |__/   \______/

	this.HandleContact = function(contact, began)
	{

		 console.log(contact);
		var r = new Array(1, -1);
		if(began)
		{
			me.cars[0].adherence = false;
			me.cars[0].paddleEffect = r[Math.floor(Math.random()*2)];
		}
		else
		{
			me.cars[0].adherence = true;
			me.cars[0].paddleEffect = 0;
		}

	};
	var contactListener = new Box2D.Dynamics.b2ContactListener();
	contactListener.BeginContact = function(contact, manifold) {
		me.HandleContact(contact, true);
	};
	contactListener.EndContact = function(contact, manifold) {
		me.HandleContact(contact, false);
	};
	this.world.SetContactListener(contactListener);


//   /$$      /$$  /$$$$$$  /$$       /$$        /$$$$$$
//  | $$  /$ | $$ /$$__  $$| $$      | $$       /$$__  $$
//  | $$ /$$$| $$| $$  \ $$| $$      | $$      | $$  \__/
//  | $$/$$ $$ $$| $$$$$$$$| $$      | $$      |  $$$$$$
//  | $$$$_  $$$$| $$__  $$| $$      | $$       \____  $$
//  | $$$/ \  $$$| $$  | $$| $$      | $$       /$$  \ $$
//  | $$/   \  $$| $$  | $$| $$$$$$$$| $$$$$$$$|  $$$$$$/
//  |__/     \__/|__/  |__/|________/|________/ \______/

	this.CreateWalls = function ()
	{

		this.wallBodyDef = new b2.dyn.b2BodyDef();
		this.wallBodyDef.type = b2.dyn.b2Body.b2_staticBody;

		this.wallFixtureDef = new b2.dyn.b2FixtureDef();
		this.wallFixtureDef.shape = new b2.shapes.b2PolygonShape();
		this.wallFixtureDef.density = 1;
		this.wallFixtureDef.restitution = 0.4;

		this.wallThickness = 0.2;

		//down
		// note : bodydef positions are computed from their mass center (width/2, height/2) (and not top left as we would naturally expect)

		this.wallFixtureDef.shape.SetAsBox(this.consts.STAGE_WIDTH_B2 / 2, this.wallThickness);
		this.wallBodyDef.position.Set(this.consts.STAGE_WIDTH_B2 / 2, this.consts.STAGE_HEIGHT_B2 - this.wallThickness / 2);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixtureDef, 0);

		// top
		this.wallBodyDef.position.Set(this.consts.STAGE_WIDTH_B2 / 2, this.wallThickness / 2);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixtureDef, 0);

		//left
		this.wallFixtureDef.shape.SetAsBox(this.wallThickness, this.consts.STAGE_HEIGHT_B2 - 2 * this.wallThickness);
		this.wallBodyDef.position.Set(this.wallThickness, this.wallThickness);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixtureDef, 0);

		//right
		this.wallBodyDef.position.Set(this.consts.STAGE_WIDTH_B2 - this.wallThickness, this.wallThickness);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixtureDef, 0);
	};

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


	this.LoadTrack = function(trackIndex)
	{
		loader = new jsonB2Loader("/images/tracks/track"+trackIndex+".json", this.consts, this.world);
	}

};