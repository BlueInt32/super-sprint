function RealCar(consts, carIndex, b2Universe)
{
    // this.CarConfig = Cars[carIndex];

    // this.carBodyDef = new b2.dyn.b2BodyDef();
    // this.carBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

    // this.carBody = b2Universe.world.CreateBody(this.carBodyDef);

    // this.carFixtureDef = new b2.dyn.b2FixtureDef();
    // this.carFixtureDef.shape = new b2.shapes.b2PolygonShape();

    // var vertices = [];
    // vertices.push(new b2.cMath.b2Vec2(1.5, 0));
    // vertices.push(new b2.cMath.b2Vec2(3, 2.5));
    // vertices.push(new b2.cMath.b2Vec2(2.8, 5.5));

    // vertices.push(new b2.cMath.b2Vec2(1, 10));
    // vertices.push(new b2.cMath.b2Vec2(-1, 10));
    // vertices.push(new b2.cMath.b2Vec2(-2.8,5.5));
    // vertices.push(new b2.cMath.b2Vec2(-3, 2.5));
    // vertices.push(new b2.cMath.b2Vec2(-1.5, 0));

    // this.carFixtureDef.shape.SetAsArray(vertices, 8);
    // fixture = this.carBody.CreateFixture(this.carFixtureDef);

    var loader = new jsonB2Loader(consts, b2Universe.world);

    loader.loadCar(Cars[carIndex].json);
}