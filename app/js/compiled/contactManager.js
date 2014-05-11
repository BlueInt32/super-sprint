var ContactManager;

ContactManager = (function() {
  function ContactManager(world, cars) {
    var contactListener;
    this.cars = cars;
    this.world = world;
    contactListener = new Box2D.Dynamics.b2ContactListener();
    contactListener.BeginContact = (function(_this) {
      return function(contact) {
        return _this.handleContact(contact, true);
      };
    })(this);
    contactListener.EndContact = (function(_this) {
      return function(contact) {
        return _this.handleContact(contact, false);
      };
    })(this);
    this.world.SetContactListener(contactListener);
  }

  ContactManager.prototype.extractContactType = function(contact) {
    var aData, bData;
    aData = contact.GetFixtureA();
    bData = contact.GetFixtureB();
    if (aData.name === 'wallFixture' || bData.name === 'wallFixture') {
      return {
        'type': 'wall'
      };
    }
    if (aData.name.indexOf('cp') === 0) {
      return {
        'type': 'cp',
        'id': aData.name.substr(2, 3)
      };
    }
    if (bData.name.indexOf('cp') === 0) {
      return {
        'type': 'cp',
        'id': bData.name.substr(2, 3)
      };
    }
    if (aData.name.indexOf('boost') === 0) {
      return {
        'type': 'boost',
        'boostVector': aData.customProperties[0].vec2
      };
    }
    if (bData.name.indexOf('boost') === 0) {
      return {
        'type': 'boost',
        'boostVector': bData.customProperties[0].vec2
      };
    }
    return {
      'type': ''
    };
  };

  ContactManager.prototype.handleContact = function(contact, began) {
    var boostVector, cInfo;
    cInfo = this.extractContactType(contact);
    if (cInfo.type === "wall") {
      return;
    }
    if (began) {
      switch (cInfo.type) {
        case "cp":
          return this.cars[0].checkPointManager.step(parseInt(cInfo.id));
        case "puddle":
          this.cars[0].adherence = false;
          return this.cars[0].paddleEffect = puddleRandomDirectionArray[Math.floor(Math.random() * 2)];
        case "boost":
          boostVector = new b2.cMath.b2Vec2(cInfo.boostVector.x, cInfo.boostVector.y);
          return this.cars[0].applyImpulse(boostVector);
      }
    } else {
      this.cars[0].adherence = true;
      return this.cars[0].paddleEffect = 0;
    }
  };

  return ContactManager;

})();
