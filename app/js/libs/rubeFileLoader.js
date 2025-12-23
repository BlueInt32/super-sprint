/*eslint no-undef: 2*/

import Box2D from './box2dweb/Box2dWeb-2.1.a.3.js';
import b2 from '../../src/utils/B2Helper.ts';

// Removed "use strict" and Object.prototype override to fix TypeError
// Objects have native hasOwnProperty method
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
  b2Vec2 = Box2D.Common.Math.b2Vec2,
  b2BodyDef = Box2D.Dynamics.b2BodyDef,
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
  b2World = Box2D.Dynamics.b2World;

var RubeFileLoader = function() {
};

RubeFileLoader.prototype.loadBodyFromRUBE = function(bodyJso, world, loadingIndex) {

  if (!bodyJso.hasOwnProperty('type')) {
    console.log("Body does not have a 'type' property");
    return null;
  }

  var bd = new b2BodyDef();
  if (bodyJso.type == 2)
    bd.type = b2.dyn.b2Body.b2_dynamicBody;
  else if (bodyJso.type == 1)
    bd.type = b2.dyn.b2Body.b2_kinematicBody;
  if (bodyJso.hasOwnProperty('angle'))
    bd.angle = bodyJso.angle;
  if (bodyJso.hasOwnProperty('angularVelocity'))
    bd.angularVelocity = bodyJso.angularVelocity;
  if (bodyJso.hasOwnProperty('active'))
    bd.awake = bodyJso.active;
  if (bodyJso.hasOwnProperty('fixedRotation'))
    bd.fixedRotation = bodyJso.fixedRotation;
  if (bodyJso.hasOwnProperty('linearVelocity') && bodyJso.linearVelocity instanceof Object)
    bd.linearVelocity.SetV(bodyJso.linearVelocity);
  if (bodyJso.hasOwnProperty('position') && bodyJso.position instanceof Object) {
    bd.position.SetV(bodyJso.position);
  }
  if (bodyJso.hasOwnProperty('awake'))
    bd.awake = bodyJso.awake;
  else
    bd.awake = false;
  var body = world.CreateBody(bd);
  if (bodyJso.hasOwnProperty('fixture')) {
    for (var k = 0; k < bodyJso.fixture.length; k++) {
      var fixtureJso = bodyJso.fixture[k];
      this.loadFixtureFromRUBE(body, fixtureJso);
    }
  }
  if (bodyJso.hasOwnProperty('name'))
    body.name = bodyJso.name;
  if (bodyJso.hasOwnProperty('customProperties')) {
    // add the loadingIndex if applicable
    this.setCustomProperty(bodyJso, 'int', 'loadingIndex', loadingIndex);

    body.customProperties = bodyJso.customProperties;
  }
  return body;
};

RubeFileLoader.prototype.loadFixtureFromRUBE = function(body, fixtureJso) {
  var fd = new b2FixtureDef();
  if (fixtureJso.hasOwnProperty('friction'))
    fd.friction = fixtureJso.friction;
  if (fixtureJso.hasOwnProperty('density'))
    fd.density = fixtureJso.density;
  if (fixtureJso.hasOwnProperty('restitution'))
    fd.restitution = fixtureJso.restitution;
  if (fixtureJso.hasOwnProperty('sensor'))
    fd.isSensor = fixtureJso.sensor;
  if (fixtureJso.hasOwnProperty('filter-categoryBits'))
    fd.filter.categoryBits = fixtureJso['filter-categoryBits'];
  if (fixtureJso.hasOwnProperty('filter-maskBits'))
    fd.filter.maskBits = fixtureJso['filter-maskBits'];
  if (fixtureJso.hasOwnProperty('filter-groupIndex'))
    fd.filter.groupIndex = fixtureJso['filter-groupIndex'];
  var fixture;
  if (fixtureJso.hasOwnProperty('circle')) {
    fd.shape = new b2CircleShape();
    fd.shape.m_radius = fixtureJso.circle.radius;
    if (fixtureJso.circle.center)
      fd.shape.m_p.SetV(fixtureJso.circle.center);
    fixture = body.CreateFixture(fd);
    if (fixtureJso.name)
      fixture.name = fixtureJso.name;
  }
  else if (fixtureJso.hasOwnProperty('polygon')) {
    fd.shape = new b2PolygonShape();
    var verts = [];
    for (var v = 0; v < fixtureJso.polygon.vertices.x.length; v++)
      verts.push(new b2Vec2(fixtureJso.polygon.vertices.x[v], fixtureJso.polygon.vertices.y[v]));
    fd.shape.SetAsArray(verts, verts.length);
    fixture = body.CreateFixture(fd);
    if (fixture && fixtureJso.name)
      fixture.name = fixtureJso.name;
  }
  else if (fixtureJso.hasOwnProperty('chain')) {
    fd.shape = new b2PolygonShape();
    var lastVertex = new b2Vec2();
    for (var v = 0; v < fixtureJso.chain.vertices.x.length; v++) {
      var thisVertex = new b2Vec2(fixtureJso.chain.vertices.x[v], fixtureJso.chain.vertices.y[v]);
      if (v > 0) {
        fd.shape.SetAsEdge(lastVertex, thisVertex);
        fixture = body.CreateFixture(fd);
        if (fixtureJso.name)
          fixture.name = fixtureJso.name;
      }
      lastVertex = thisVertex;
    }
  }
  else {
    console.log("Could not find shape type for fixture");
  }
  if (fixtureJso.hasOwnProperty('customProperties')) {
    fixture.customProperties = fixtureJso.customProperties;
  }
};

RubeFileLoader.prototype.getVectorValue = function(val) {
  if (val instanceof Object) {
    return val;
  }
  else
    return {
      x: 0,
      y: 0
    };
};

RubeFileLoader.prototype.loadJointCommonProperties = function(jd, jointJso, loadedBodies, loadingIndex) {

  jd.bodyA = loadedBodies[jointJso.bodyA];
  jd.bodyB = loadedBodies[jointJso.bodyB];
  jd.localAnchorA.SetV(this.getVectorValue(jointJso.anchorA));
  jd.localAnchorB.SetV(this.getVectorValue(jointJso.anchorB));
  if (jointJso.collideConnected)
    jd.collideConnected = jointJso.collideConnected;
};

RubeFileLoader.prototype.loadJointFromRUBE = function(jointJso, world, loadedBodies, loadingIndex) {
  if (!jointJso.hasOwnProperty('type')) {
    console.log("Joint does not have a 'type' property");
    return null;
  }
  if (jointJso.bodyA >= loadedBodies.length) {
    console.log("Index for bodyA is invalid: " + jointJso.bodyA);
    return null;
  }
  if (jointJso.bodyB >= loadedBodies.length) {
    console.log("Index for bodyB is invalid: " + jointJso.bodyB);
    return null;
  }

  var joint = null;
  var jd;
  if (jointJso.type == "revolute") {
    jd = new b2.joints.b2RevoluteJointDef();
    this.loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
    //console.log('jd : ', jd);
    if (jointJso.hasOwnProperty('refAngle'))
      jd.referenceAngle = jointJso.refAngle;
    if (jointJso.hasOwnProperty('lowerLimit'))
      jd.lowerAngle = jointJso.lowerLimit;
    if (jointJso.hasOwnProperty('upperLimit'))
      jd.upperAngle = jointJso.upperLimit;
    if (jointJso.hasOwnProperty('maxMotorTorque'))
      jd.maxMotorTorque = jointJso.maxMotorTorque;
    if (jointJso.hasOwnProperty('motorSpeed'))
      jd.motorSpeed = jointJso.motorSpeed;
    if (jointJso.hasOwnProperty('enableLimit'))
      jd.enableLimit = jointJso.enableLimit;
    if (jointJso.hasOwnProperty('enableMotor'))
      jd.enableMotor = jointJso.enableMotor;

    jd.lowerAngle = 0;
    jd.upperAngle = 0;
    jd.referenceAngle = 0;


    joint = world.CreateJoint(jd);
  }
  else if (jointJso.type == "distance" || jointJso.type == "rope") {
    if (jointJso.type == "rope")
      console.log("Replacing unsupported rope joint with distance joint!");
    jd = new b2DistanceJointDef();
    this.loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
    if (jointJso.hasOwnProperty('length'))
      jd.length = jointJso.length;
    if (jointJso.hasOwnProperty('dampingRatio'))
      jd.dampingRatio = jointJso.dampingRatio;
    if (jointJso.hasOwnProperty('frequency'))
      jd.frequencyHz = jointJso.frequency;
    joint = world.CreateJoint(jd);
  }
  else if (jointJso.type == "prismatic") {
    jd = new b2PrismaticJointDef();
    this.loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
    if (jointJso.hasOwnProperty('localAxisA'))
      jd.localAxisA.SetV(this.getVectorValue(jointJso.localAxisA));
    if (jointJso.hasOwnProperty('refAngle'))
      jd.referenceAngle = jointJso.refAngle;
    if (jointJso.hasOwnProperty('enableLimit'))
      jd.enableLimit = jointJso.enableLimit;
    if (jointJso.hasOwnProperty('lowerLimit'))
      jd.lowerTranslation = jointJso.lowerLimit;
    if (jointJso.hasOwnProperty('upperLimit'))
      jd.upperTranslation = jointJso.upperLimit;
    if (jointJso.hasOwnProperty('enableMotor'))
      jd.enableMotor = jointJso.enableMotor;
    if (jointJso.hasOwnProperty('maxMotorForce'))
      jd.maxMotorForce = jointJso.maxMotorForce;
    if (jointJso.hasOwnProperty('motorSpeed'))
      jd.motorSpeed = jointJso.motorSpeed;
    joint = world.CreateJoint(jd);
  }
  else if (jointJso.type == "wheel") {
    //Make a fake wheel joint using a line joint and a distance joint.
    //Return the line joint because it has the linear motor controls.
    //Use ApplyTorque on the bodies to spin the wheel...

    jd = new b2DistanceJointDef();
    this.loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
    jd.length = 0.0;
    if (jointJso.hasOwnProperty('springDampingRatio'))
      jd.dampingRatio = jointJso.springDampingRatio;
    if (jointJso.hasOwnProperty('springFrequency'))
      jd.frequencyHz = jointJso.springFrequency;
    world.CreateJoint(jd);

    jd = new b2LineJointDef();
    this.loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
    if (jointJso.hasOwnProperty('localAxisA'))
      jd.localAxisA.SetV(this.getVectorValue(jointJso.localAxisA));

    joint = world.CreateJoint(jd);
  }
  else if (jointJso.type == "friction") {
    jd = new b2FrictionJointDef();
    this.loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
    if (jointJso.hasOwnProperty('maxForce'))
      jd.maxForce = jointJso.maxForce;
    if (jointJso.hasOwnProperty('maxTorque'))
      jd.maxTorque = jointJso.maxTorque;
    joint = world.CreateJoint(jd);
  }
  else if (jointJso.type == "weld") {
    jd = new b2.joints.b2WeldJointDef();
    this.loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
    if (jointJso.hasOwnProperty('referenceAngle'))
      jd.referenceAngle = jointJso.referenceAngle;
    joint = world.CreateJoint(jd);
  }
  else {
    console.log("Unsupported joint type: " + jointJso.type);
  }
  if (joint && jointJso.name)
    joint.name = jointJso.name;


  if (jointJso.hasOwnProperty('customProperties')) {
    // add the loadingIndex if applicable
    this.setCustomProperty(jointJso, 'int', 'loadingIndex', loadingIndex);

    joint.customProperties = jointJso.customProperties;
  }

  //console.log(joint);
  return joint;
};

RubeFileLoader.prototype.makeClone = function(obj) {
  var newObj = (obj instanceof Array) ? [] : {};
  for (var i in obj) {
    if (obj[i] && typeof obj[i] == "object")
      newObj[i] = this.makeClone(obj[i]);
    else
      newObj[i] = obj[i];
  }
  return newObj;
};

RubeFileLoader.prototype.loadImageFromRUBE = function(imageJso, world, loadedBodies) {
  var image = this.makeClone(imageJso);

  if (image.hasOwnProperty('body') && image.body >= 0)
    image.body = loadedBodies[image.body];//change index to the actual body
  else
    image.body = null;

  image.center = new b2Vec2();
  image.center.SetV(this.getVectorValue(imageJso.center));

  return image;
};

//mainly just a convenience for the testbed - uses global 'world' variable
RubeFileLoader.prototype.loadSceneFromRUBE = function(worldJso) {
  return this.loadSceneIntoWorld(worldJso, world);
};

//load the scene into an already existing world variable
RubeFileLoader.prototype.loadSceneIntoWorld = function(worldJso, world, loadingIndex) {
  var success = true;
  var loadedBodies = [];
  if (worldJso.hasOwnProperty('body')) {
    for (var i = 0; i < worldJso.body.length; i++) {
      var bodyJso = worldJso.body[i];
      var body = this.loadBodyFromRUBE(bodyJso, world, loadingIndex);
      if (body)
        loadedBodies.push(body);
      else
        success = false;
    }
  }

  var loadedJoints = [];
  if (worldJso.hasOwnProperty('joint')) {
    for (var j = 0; j < worldJso.joint.length; j++) {
      var jointJso = worldJso.joint[j];
      var joint = this.loadJointFromRUBE(jointJso, world, loadedBodies, loadingIndex);
      if (joint)
        loadedJoints.push(joint);
      //else
      //    success = false;
    }
  }

  var loadedImages = [];
  if (worldJso.hasOwnProperty('image')) {
    for (var k = 0; k < worldJso.image.length; k++) {
      var imageJso = worldJso.image[k];
      var image = this.loadImageFromRUBE(imageJso, world, loadedBodies);
      if (image)
        loadedImages.push(image);
      else
        success = false;
    }
    world.images = loadedImages;
  }

  return success;
};

//create a world variable and return it if loading succeeds
// loadingIndex should be filled in in bodies and joints elements loaded in order to track them in the
// case of multiple worlds imports
RubeFileLoader.prototype.loadWorldFromRUBE = function(injectedWorld, mainWorld, loadingIndex) {
  //console.log("LoadingIndex: ", loadingIndex);
  var gravity = new b2Vec2(0, 0);
  if (injectedWorld.hasOwnProperty('gravity') && injectedWorld.gravity instanceof Object)
    gravity.SetV(injectedWorld.gravity);
  var world;
  //typeof mainWorld
  if (typeof mainWorld !== "undefined" && mainWorld !== null) {
    world = mainWorld;
  }
  else
    world = new b2World(gravity);

  if (!this.loadSceneIntoWorld(injectedWorld, world, loadingIndex))
    throw {
      "ErrorCode": "RUBE_LOADING_ERROR",
      "ErrorMessage": "Could not load subworld"
    };
  return world;
};

RubeFileLoader.prototype.getNamedBodies = function(world, name) {
  var bodies = [];
  for (var b = world.m_bodyList; b; b = b.m_next) {
    if (b.name == name)
      bodies.push(b);
  }
  return bodies;
};

RubeFileLoader.prototype.getBodiesWithNamesStartingWith = function(world, startName) {
  var bodies = [];
  for (var b = world.m_bodyList; b; b = b.m_next) {
    if (typeof b.name !== "undefined" && b.name.indexOf(startName) === 0) {
      bodies.push(b);
    }
  }

  bodies.sort(function(a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });

  return bodies;
};

RubeFileLoader.prototype.getBodies = function(world) {
  var bodies = [];
  for (var b = world.m_bodyList; b; b = b.m_next) {
    bodies.push(b);
  }
  return bodies;
};

RubeFileLoader.prototype.getNamedFixtures = function(world, name) {
  var fixtures = [];
  for (var b = world.m_bodyList; b; b = b.m_next) {
    for (var f = b.m_fixtureList; f; f = f.m_next) {
      if (f.name == name)
        fixtures.push(f);
    }
  }
  return fixtures;
};

RubeFileLoader.prototype.getNamedJoints = function(world, name) {
  var joints = [];
  for (var j = world.m_jointList; j; j = j.m_next) {
    if (j.name == name)
      joints.push(j);
  }
  return joints;
};

RubeFileLoader.prototype.getNamedImages = function(world, name) {
  var images = [];
  for (var i = 0; i < world.images.length; i++) {
    if (world.images[i].name == name)
      images.push(world.images[i].name);
  }
  return images;
};

//custom properties
RubeFileLoader.prototype.getBodiesByCustomProperty = function(world, propertyType, propertyName, valueToMatch) {
  var bodies = [];
  for (var b = world.m_bodyList; b; b = b.m_next) {
    if (!b.hasOwnProperty('customProperties'))
      continue;
    for (var i = 0; i < b.customProperties.length; i++) {
      if (!b.customProperties[i].hasOwnProperty("name"))
        continue;
      if (!b.customProperties[i].hasOwnProperty(propertyType))
        continue;
      if (b.customProperties[i].name == propertyName &&
        b.customProperties[i][propertyType] == valueToMatch)
        bodies.push(b);
    }
  }
  return bodies;
};

//custom properties
RubeFileLoader.prototype.filterElementsByCustomProperty = function(inputElements, propertyType, propertyName, valueToMatch) {
  //console.log('inputElements : ', inputElements, 'searching for ', valueToMatch);
  var elements = [];
  for (var i in inputElements) {
    var b = inputElements[i];
    if (!b.hasOwnProperty('customProperties'))
      continue;
    for (var i = 0; i < b.customProperties.length; i++) {
      if (!b.customProperties[i].hasOwnProperty("name"))
        continue;
      if (!b.customProperties[i].hasOwnProperty(propertyType))
        continue;
      if (b.customProperties[i].name == propertyName &&
        b.customProperties[i][propertyType] == valueToMatch)
        elements.push(b);
    }
  }
  //console.log('I Found  : ', elements);
  return elements;
};

RubeFileLoader.prototype.hasCustomProperty = function(item, propertyType, propertyName) {
  if (!item.hasOwnProperty('customProperties'))
    return false;
  for (var i = 0; i < item.customProperties.length; i++) {
    if (!item.customProperties[i].hasOwnProperty("name"))
      continue;
    if (!item.customProperties[i].hasOwnProperty(propertyType))
      continue;
    return true;
  }
  return false;
};

RubeFileLoader.prototype.getCustomProperty = function(item, propertyType, propertyName, defaultValue) {
  if (!item.hasOwnProperty('customProperties'))
    return defaultValue;
  for (var i = 0; i < item.customProperties.length; i++) {
    if (!item.customProperties[i].hasOwnProperty("name"))
      continue;
    if (!item.customProperties[i].hasOwnProperty(propertyType))
      continue;
    if (item.customProperties[i].name == propertyName)
      return item.customProperties[i][propertyType];
  }
  return defaultValue;
};

RubeFileLoader.prototype.setCustomProperty = function(item, propertyType, propertyName, value) {
  if (!item.hasOwnProperty('customProperties'))
    return value;
  for (var i = 0; i < item.customProperties.length; i++) {
    if (!item.customProperties[i].hasOwnProperty("name"))
      continue;
    if (!item.customProperties[i].hasOwnProperty(propertyType))
      continue;
    if (item.customProperties[i].name == propertyName)
      item.customProperties[i][propertyType] = value;
  }
  return value;
};

RubeFileLoader.prototype.preprocessRube = function(parsedJson) {
  var fixture, i, index, j, joint, jsonBody, k, len, len1, len2, ref, ref1, ref2;
  ref = parsedJson.body;
  for (i = 0, len = ref.length; i < len; i++) {
    jsonBody = ref[i];
    if (jsonBody.position !== 0) {
      jsonBody.position.y = jsonBody.position.y * -1;
    }
    if (typeof jsonBody.fixture !== "undefined") {
      ref1 = jsonBody.fixture;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        fixture = ref1[j];
        if (fixture.hasOwnProperty("polygon")) {
          for (index in fixture.polygon.vertices.y) {
            fixture.polygon.vertices.y[index] = -fixture.polygon.vertices.y[index];
          }
          fixture.polygon.vertices.x.reverse();
          fixture.polygon.vertices.y.reverse();
        }
        if (fixture.hasOwnProperty("chain")) {
          for (index in fixture.chain.vertices.y) {
            fixture.chain.vertices.y[index] = -fixture.chain.vertices.y[index];
          }
          fixture.chain.vertices.x.reverse();
          fixture.chain.vertices.y.reverse();
        }
      }
    }
  }
  if (parsedJson.hasOwnProperty("joint")) {
    ref2 = parsedJson.joint;
    for (k = 0, len2 = ref2.length; k < len2; k++) {
      joint = ref2[k];
      if (joint.anchorA !== 0) {
        joint.anchorA.y = joint.anchorA.y * -1;
      }
      if (joint.anchorB !== 0) {
        joint.anchorB.y = joint.anchorB.y * -1;
      }
      joint.upperLimit = 0;
      joint.lowerLimit = 0;
    }
  }
  return parsedJson;
};

export default RubeFileLoader;