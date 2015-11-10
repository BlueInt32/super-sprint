var Box2D = require('../libs/box2dweb/Box2dWeb-2.1.a.3.js');

var b2 = function () {
  var that = {};


  that.dyn = Box2D.Dynamics;

  that.shapes = Box2D.Collision.Shapes;

  that.cMath = Box2D.Common.Math;

  that.math = Box2D.Common.Math.b2Math;

  that.joints = Box2D.Dynamics.Joints;

  that.findCustomPropertyValue = function (b2Body, cPropertyName, typeName) {
    var i, len, property, ref;
    if (b2Body.customProperties != null) {
      ref = b2Body.customProperties;
      for (i = 0, len = ref.length; i < len; i++) {
        property = ref[i];
        if (property.name === cPropertyName) {
          return property[typeName];
        }
      }
    }
  };

  that.applyForceToCenter = function (b2Body, vector2) {
    return b2Body.ApplyForce(b2Body.GetWorldVector(vector2), b2Body.GetWorldCenter());
  };

  return that;
};

module.exports = b2();
