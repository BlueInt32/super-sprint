var B2Helper = function ()
{

	//World & Gravity
	this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
	var DEGTORAD  = 2 * Math.PI / 360;

//   /$$      /$$  /$$$$$$  /$$       /$$        /$$$$$$ 
//  | $$  /$ | $$ /$$__  $$| $$      | $$       /$$__  $$
//  | $$ /$$$| $$| $$  \ $$| $$      | $$      | $$  \__/
//  | $$/$$ $$ $$| $$$$$$$$| $$      | $$      |  $$$$$$ 
//  | $$$$_  $$$$| $$__  $$| $$      | $$       \____  $$
//  | $$$/ \  $$$| $$  | $$| $$      | $$       /$$  \ $$
//  | $$/   \  $$| $$  | $$| $$$$$$$$| $$$$$$$$|  $$$$$$/
//  |__/     \__/|__/  |__/|________/|________/ \______/ 
	
	this.CreateWalls = function (b2StageWidth, b2StageHeight)
	{

		this.wallBodyDef = new b2.dyn.b2BodyDef();
		this.wallBodyDef.type = b2.dyn.b2Body.b2_staticBody;

		this.wallFixture = new b2.dyn.b2FixtureDef();
		this.wallFixture.shape = new b2.shapes.b2PolygonShape();
		this.wallFixture.density = 1;
		this.wallFixture.restitution = 0.4;

		this.wallThickness = 0.2;

		//down
		// note : bodydef positions are computed from their mass center (width/2, height/2) (and not top left as we would naturally expect)

		this.wallFixture.shape.SetAsBox(b2StageWidth / 2, this.wallThickness);
		this.wallBodyDef.position.Set(b2StageWidth / 2, b2StageHeight - this.wallThickness / 2);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixture, 0);

		// top
		this.wallBodyDef.position.Set(b2StageWidth / 2, this.wallThickness / 2);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixture, 0);

		//left
		this.wallFixture.shape.SetAsBox(this.wallThickness, b2StageHeight - 2 * this.wallThickness);
		this.wallBodyDef.position.Set(this.wallThickness, this.wallThickness);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixture, 0);

		//right
		this.wallBodyDef.position.Set(b2StageWidth - this.wallThickness, this.wallThickness);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.wallFixture, 0);
	}

	// this.CreateFlaques = function(b2StageWidth, b2StageHeight)
	// {
	// 	var bodyDef;
	// 	m_groundBody = this.world.CreateBody( bodyDef );

	// 	this.flaqueFixtureDef = new b2.dyn.b2FixtureDef();
	// 	this.flaqueFixture.shape = new b2.shapes.b2PolygonShape();
	// 	this.flaqueFixtureDef.isSensor = true;

	// 	polygonShape.SetAsBox( 9, 7, b2Vec2(-10,15), 20*DEGTORAD );
	// 	b2Fixture* groundAreaFixture = groundBody->CreateFixture(&fixtureDef);
	// 	groundAreaFixture->SetUserData( new GroundAreaFUD( 0.5f, false ) );

	// 	polygonShape.SetAsBox( 9, 5, b2Vec2(5,20), -40*DEGTORAD );
	// 	groundAreaFixture = groundBody->CreateFixture(&fixtureDef);
	// 	groundAreaFixture->SetUserData( new GroundAreaFUD( 0.2f, false ) );
	// }

}