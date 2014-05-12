class ContactManager
    constructor:(@_world, @_playerCar) ->
        @playerCar = @_playerCar
        @world = @_world
        contactListener = new Box2D.Dynamics.b2ContactListener();

        contactListener.BeginContact = (contact) =>
            @handleContact(contact, true)
        contactListener.EndContact = (contact) =>
            @handleContact(contact, false)
        @world.SetContactListener(contactListener);

    extractContactType:(contact) ->
        aData = contact.GetFixtureA();
        bData = contact.GetFixtureB();

        if(aData.name == 'wallFixture' || bData.name == 'wallFixture')
            return {'type':'wall'};

        if(aData.name.indexOf('cp') == 0)
            return {'type':'cp', 'id':aData.name.substr(2, 3)};
        if(bData.name.indexOf('cp') == 0)
            return {'type':'cp', 'id':bData.name.substr(2, 3)};
        if(aData.name.indexOf('boost') == 0)
            return { 'type':'boost', 'boostVector':aData.customProperties[0].vec2 };
        if(bData.name.indexOf('boost') == 0)
            return { 'type':'boost', 'boostVector':bData.customProperties[0].vec2 };
        return { 'type': '' }

    handleContact: (contact, began) ->

        cInfo = @extractContactType(contact);
        if(cInfo.type == "wall")
            return
        if(began)
            switch cInfo.type
                when "cp" then @playerCar.checkPointManager.step(parseInt(cInfo.id))
                when "puddle"
                    @playerCar.adherence = false;
                    @playerCar.paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random()*2)]
                when "boost"
                    boostVector = new b2.cMath.b2Vec2(cInfo.boostVector.x, cInfo.boostVector.y)
                    @playerCar.applyImpulse(boostVector)
        else
            @playerCar.adherence = true;
            @playerCar.paddleEffect = 0;
