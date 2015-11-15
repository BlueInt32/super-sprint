var Box2D = require('../libs/box2dweb/Box2dWeb-2.1.a.3.js');
var configs = require('../configs.js');

var b2 = function () {
  var that = {};


  that.dyn = Box2D.Dynamics;
  that.shapes = Box2D.Collision.Shapes;
  that.cMath = Box2D.Common.Math;
  that.math = Box2D.Common.Math.b2Math;
  that.joints = Box2D.Dynamics.Joints;


  that.STAGE_WIDTH_B2 = configs.consts.STAGE_WIDTH_PIXEL / configs.consts.METER;
  that.STAGE_HEIGHT_B2 = configs.consts.STAGE_HEIGHT_PIXEL / configs.consts.METER;
  that.ScreenCenterVector = new that.cMath.b2Vec2(that.STAGE_WIDTH_B2 / 2, that.STAGE_HEIGHT_B2 / 2);


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

  that.debugDraw = function (universe) {
    var debugDrawer;

    var canvas = document.getElementById('canvas');
    canvas.width = configs.consts.STAGE_WIDTH_PIXEL;
    canvas.height = configs.consts.STAGE_HEIGHT_PIXEL;
    debugDrawer = new that.dyn.b2DebugDraw();
    debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDrawer.SetDrawScale(100.0);
    debugDrawer.SetFillAlpha(1);
    debugDrawer.SetLineThickness(2.0);
    debugDrawer.SetFlags(
      that.dyn.b2DebugDraw.e_shapeBit
      | that.dyn.b2DebugDraw.e_jointBit
      | that.dyn.b2DebugDraw.e_controllerBit
      | that.dyn.b2DebugDraw.e_pairBit
      | that.dyn.b2DebugDraw.e_centerOfMassBit
      | that.dyn.b2DebugDraw.e_aabbBit
      | that.dyn.e_controllerBit
    );
    return universe.world.SetDebugDraw(debugDrawer);
  };

  that.applyForceToCenter = function (b2Body, vector2) {
    return b2Body.ApplyForce(b2Body.GetWorldVector(vector2), b2Body.GetWorldCenter());
  };

  return that;
};

Box2D.Dynamics.b2Body.prototype.LogPosition = function () {
  var pos = this.GetPosition();
  console.log(this.name, "x:", pos.x, "y:", pos.y);
};

module.exports = b2();
