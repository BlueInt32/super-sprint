var B2Helper = function ()
{
	this.world = new b2.dyn.b2World(new b2.cMath.b2Vec2(0, 0), true);
	this.baseFixture = new b2.dyn.b2FixtureDef();
	this.wallBodyDef = new b2.dyn.b2BodyDef();

	this.baseFixture.shape = new b2.shapes.b2PolygonShape();
	this.baseFixture.density = 1;
	this.baseFixture.restitution = 1;
	
	this.CreateWalls = function (stageWidth, stageHeight)
	{
		console.log(stageWidth, stageHeight);
		this.wallBodyDef.type = b2.shapes.b2_staticBody;
		//down
		this.baseFixture.shape.SetAsBox(19, 1);
		this.wallBodyDef.position.Set(stageWidth / 2, stageHeight + 1);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.baseFixture);

		//left
		this.baseFixture.shape.SetAsBox(1, 100);
		this.wallBodyDef.position.Set(-1, 0);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.baseFixture);

		//right
		this.wallBodyDef.position.Set(stageWidth + 1, 0);
		this.world.CreateBody(this.wallBodyDef).CreateFixture(this.baseFixture);

	}
}