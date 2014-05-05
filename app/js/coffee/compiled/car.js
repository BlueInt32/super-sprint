(function() {
  var Car;

  Car = (function() {
    function Car(configuration) {
      this.configuration = configuration;
    }

    Car.prototype.setBox2dData = function(box2dData) {
      this.rearTires = box2dData.rearTires;
      this.frontTires = box2dData.frontTires;
      this.tires = this.rearTires.concat(this.frontTires);
      this.tiresCount = this.tires.length;
      this.directionJoints = box2dData.directionJoints;
      return this.b2Body = box2dData.carBody;
    };

    Car.prototype.setPosition = function(chosenPosition) {
      var temp;
      temp = chosenPosition.Copy();
      temp.Add(this.b2Body.GetPosition());
      return this.b2Body.SetPosition(temp);
    };

    Car.prototype.coucou = function() {};

    return Car;

  })();

}).call(this);
