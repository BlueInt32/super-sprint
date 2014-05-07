
/**
 * this class encapsulates the management of box2d contacts
 * @param {b2World} world in which the bodies evolve
 * @param {Cars[]} cars
 */
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

/**
 * This determines what kind of contact has been detected
 * contacts are established by fixture names
 * @param {[b2Contact]} contact
 */
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
    return { 'type': '' };
};

/**
 * Given a b2Contact and the boolean wheter it began or ended, it is the main manager logic.
 * @param {[b2Contact]} contact
 * @param {[bool]} began
 */
ContactManager.prototype.HandleContact = function(contact, began)
{
    var cInfo = this.ExtractContactType(contact);
    if(cInfo.type === "wall")
        return;
    if(began)
    {
        switch(cInfo.type)
        {
            case "cp":
                this.cars[0].checkPointManager.Step(parseInt(cInfo.id));
                break;
            case "puddle":
                this.cars[0].adherence = false;
                this.cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random()*2)];
                break;
            case "boost":
                var boostVector = new b2.cMath.b2Vec2(cInfo.boostVector.x, cInfo.boostVector.y);
                this.cars[0].ApplyImpulse(boostVector);
                break;
        }
    }
    else
    {
        this.cars[0].adherence = true;
        this.cars[0].paddleEffect = 0;
    }
};
