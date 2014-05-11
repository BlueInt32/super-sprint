var b2;

b2 = (function() {
  function b2() {}

  b2.dyn = Box2D.Dynamics;

  b2.shapes = Box2D.Collision.Shapes;

  b2.cMath = Box2D.Common.Math;

  b2.math = Box2D.Common.Math.b2Math;

  b2.joints = Box2D.Dynamics.Joints;

  b2.findCustomPropertyValue = function(b2Body, cPropertyName, typeName) {
    var property, _i, _len, _ref;
    if (b2Body.customProperties != null) {
      _ref = b2Body.customProperties;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        property = _ref[_i];
        if (property.name === cPropertyName) {
          return property[typeName];
        }
      }
    }
  };

  b2.applyForceToCenter = function(b2Body, vector2) {
    return b2Body.ApplyForce(b2Body.GetWorldVector(vector2), b2Body.GetWorldCenter());
  };

  return b2;

})();
