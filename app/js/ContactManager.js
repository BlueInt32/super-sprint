
/// this class encapsulates the management of box2d contacts
var ContactManager = function(world, cars)
{
    var me = this;
    this.cars = cars;
    this.world = world;
    var contactListener = new Box2D.Dynamics.b2ContactListener();

    contactListener.BeginContact = function(contact)
    {
        me.HandleContact(contact, true);
    };
    contactListener.EndContact = function(contact) {
        me.HandleContact(contact, false);
    };
    this.world.SetContactListener(contactListener);

};


/// this determines what kind of contact has been detected
/// contacts are established by fixture names
ContactManager.prototype.ExtractContactType = function(contact)
{
    aData = contact.GetFixtureA();
    bData = contact.GetFixtureB();

    if(aData.name === 'wallFixture' || bData.name === 'wallFixture')
        return {'type':'wall'};

    if(aData.name.indexOf('cp') === 0)
        return {'type':'cp', 'id':aData.name.substr(2, 3)};
    if(bData.name.indexOf('cp') === 0)
        return {'type':'cp', 'id':bData.name.substr(2, 3)};
    if(aData.name.indexOf('boost') === 0)
        return { 'type':'boost', 'boostVector':aData.customProperties[0].vec2 };
    if(bData.name.indexOf('boost') === 0)
        return { 'type':'boost', 'boostVector':bData.customProperties[0].vec2 };
    return { 'type': '' }
};


ContactManager.prototype.HandleContact = function(contact, began)
{
    var contactInfo = this.ExtractContactType(contact);
    if(contactInfo.type === "wall")
        return;
    if(began)
    {
        switch(contactInfo.type)
        {
            case "cp": this.cars[0].checkPointManager.Step(parseInt(contactInfo.id)); break;
            case "puddle":this.cars[0].adherence = false; this.cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random()*2)];break;
            case "boost": var boostVector = new b2.cMath.b2Vec2(contactInfo.boostVector.x, contactInfo.boostVector.y);  this.cars[0].ApplyImpulse(boostVector); break;
        }
    }
    else
    {
        this.cars[0].adherence = true;
        this.cars[0].paddleEffect = 0;
    }
};
