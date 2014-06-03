var iaCar,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

iaCar = (function(_super) {
  __extends(iaCar, _super);

  function iaCar() {
    var bd;
    bd = new b2BodyDef();
  }

  iaCar.prototype.doNothing = function() {
    return this.foo = 'foo';
  };

  return iaCar;

})(Car);
