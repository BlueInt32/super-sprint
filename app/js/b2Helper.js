var B2Helper = function ()
{
	this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
	this.baseFixture = new b2.dyn.b2FixtureDef();
	this.wallBodyDef = new b2.dyn.b2BodyDef();

	this.baseFixture.shape = new b2.shapes.b2PolygonShape();
	this.baseFixture.density = 1;
	this.baseFixture.restitution = 0.7;

	this.CreateWorld = function ()
	{

	}


	this.CreateWalls = function (b2World)
	{
		this.wallBodyDef.type = b2.shapes.b2_staticBody;
		//down
		this.baseFixture.shape.SetAsBox(10, 1);
		this.wallBodyDef.position.Set(9, Consts.STAGE_HEIGHT_B2 + 1);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.baseFixture);

		//left
		this.baseFixture.shape.SetAsBox(1, 100);
		this.wallBodyDef.position.Set(-1, 0);
		this.world.CreateBody(bodyDef).CreateFixture(this.baseFixture);

		//right
		this.wallBodyDef.position.Set(Consts.STAGE_WIDTH_B2 + 1, 0);
		this.world.CreateBody(bodyDef).CreateFixture(this.baseFixture);

	}

	this.CreateCar = function ()
	{
	}


}