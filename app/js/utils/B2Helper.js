"use strict";

var Box2D = require('../libs/box2dweb/Box2dWeb-2.1.a.3.js');
var settings = require('../settings.js');

function B2Helper() {
  this.dyn = Box2D.Dynamics;
  this.shapes = Box2D.Collision.Shapes;
  this.math = Box2D.Common.Math.b2Math;
  this.cMath = Box2D.Common.Math;
  this.joints = Box2D.Dynamics.Joints;

  this.STAGE_WIDTH_B2 = settings.consts.STAGE_WIDTH_PIXEL / settings.consts.METER;
  this.STAGE_HEIGHT_B2 = settings.consts.STAGE_HEIGHT_PIXEL / settings.consts.METER;
  this.ScreenCenterVector = new this.cMath.b2Vec2(this.STAGE_WIDTH_B2 / 2, this.STAGE_HEIGHT_B2 / 2);
};

B2Helper.prototype.findCustomPropertyValue = function (b2Body, cPropertyName, typeName) {
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

B2Helper.prototype.initDebugDraw = function (b2World) {
  var debugDrawer;

  var canvas = document.getElementById('canvas');
  canvas.width = settings.consts.STAGE_WIDTH_PIXEL;
  canvas.height = settings.consts.STAGE_HEIGHT_PIXEL;
  debugDrawer = new this.dyn.b2DebugDraw();
  debugDrawer.SetSprite(document.getElementById("canvas").getContext("2d"));
  debugDrawer.SetDrawScale(100.0);
  debugDrawer.SetFillAlpha(1);
  debugDrawer.SetLineThickness(2.0);
  debugDrawer.SetFlags(
    this.dyn.b2DebugDraw.e_shapeBit
    | this.dyn.b2DebugDraw.e_jointBit
    | this.dyn.b2DebugDraw.e_controllerBit
    | this.dyn.b2DebugDraw.e_pairBit
    // | this.dyn.b2DebugDraw.e_centerOfMassBit
    //| this.dyn.b2DebugDraw.e_aabbBit
    //| this.dyn.e_controllerBit
  );
  return b2World.SetDebugDraw(debugDrawer);
};

B2Helper.prototype.applyForceToCenter = function (b2Body, vector2) {
  return b2Body.ApplyForce(b2Body.GetWorldVector(vector2), b2Body.GetWorldCenter());
};

Box2D.Dynamics.b2Body.prototype.LogPosition = function () {
  var pos = this.GetPosition();
  console.log(this.name, "x:", pos.x, "y:", pos.y);
};

module.exports = new B2Helper();
