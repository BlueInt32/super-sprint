/* jshint -W001 */
Object.prototype.hasOwnProperty = function(property) {
    return typeof(this[property]) !== 'undefined';
};

var b2Color = Box2D.Common.b2Color,
      b2internal = Box2D.Common.b2internal,
      b2Settings = Box2D.Common.b2Settings,
      b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
      b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef,
      b2EdgeShape = Box2D.Collision.Shapes.b2EdgeShape,
      b2MassData = Box2D.Collision.Shapes.b2MassData,
      b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
      b2Shape = Box2D.Collision.Shapes.b2Shape,
      b2Mat22 = Box2D.Common.Math.b2Mat22,
      b2Mat33 = Box2D.Common.Math.b2Mat33,
      b2Math = Box2D.Common.Math.b2Math,
      b2Sweep = Box2D.Common.Math.b2Sweep,
      b2Transform = Box2D.Common.Math.b2Transform,
      b2Vec2 = Box2D.Common.Math.b2Vec2,
      b2Vec3 = Box2D.Common.Math.b2Vec3,
      b2Body = Box2D.Dynamics.b2Body,
      b2BodyDef = Box2D.Dynamics.b2BodyDef,
      b2ContactFilter = Box2D.Dynamics.b2ContactFilter,
      b2ContactImpulse = Box2D.Dynamics.b2ContactImpulse,
      b2ContactListener = Box2D.Dynamics.b2ContactListener,
      b2ContactManager = Box2D.Dynamics.b2ContactManager,
      b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
      b2DestructionListener = Box2D.Dynamics.b2DestructionListener,
      b2FilterData = Box2D.Dynamics.b2FilterData,
      b2Fixture = Box2D.Dynamics.b2Fixture,
      b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
      b2Island = Box2D.Dynamics.b2Island,
      b2TimeStep = Box2D.Dynamics.b2TimeStep,
      b2World = Box2D.Dynamics.b2World,
      b2AABB = Box2D.Collision.b2AABB,
      b2Bound = Box2D.Collision.b2Bound,
      b2BoundValues = Box2D.Collision.b2BoundValues,
      b2Collision = Box2D.Collision.b2Collision,
      b2ContactID = Box2D.Collision.b2ContactID,
      b2ContactPoint = Box2D.Collision.b2ContactPoint,
      b2Distance = Box2D.Collision.b2Distance,
      b2DistanceInput = Box2D.Collision.b2DistanceInput,
      b2DistanceOutput = Box2D.Collision.b2DistanceOutput,
      b2DistanceProxy = Box2D.Collision.b2DistanceProxy,
      b2DynamicTree = Box2D.Collision.b2DynamicTree,
      b2DynamicTreeBroadPhase = Box2D.Collision.b2DynamicTreeBroadPhase,
      b2DynamicTreeNode = Box2D.Collision.b2DynamicTreeNode,
      b2DynamicTreePair = Box2D.Collision.b2DynamicTreePair,
      b2Manifold = Box2D.Collision.b2Manifold,
      b2ManifoldPoint = Box2D.Collision.b2ManifoldPoint,
      b2Point = Box2D.Collision.b2Point,
      b2RayCastInput = Box2D.Collision.b2RayCastInput,
      b2RayCastOutput = Box2D.Collision.b2RayCastOutput,
      b2Segment = Box2D.Collision.b2Segment,
      b2SeparationFunction = Box2D.Collision.b2SeparationFunction,
      b2Simplex = Box2D.Collision.b2Simplex,
      b2SimplexCache = Box2D.Collision.b2SimplexCache,
      b2SimplexVertex = Box2D.Collision.b2SimplexVertex,
      b2TimeOfImpact = Box2D.Collision.b2TimeOfImpact,
      b2TOIInput = Box2D.Collision.b2TOIInput,
      b2WorldManifold = Box2D.Collision.b2WorldManifold,
      ClipVertex = Box2D.Collision.ClipVertex,
      Features = Box2D.Collision.Features,
      IBroadPhase = Box2D.Collision.IBroadPhase;

function loadBodyFromRUBE(bodyJso, world, loadingIndex) {

    if ( ! bodyJso.hasOwnProperty('type') ) {
        console.log("Body does not have a 'type' property");
        return null;
    }

    var bd = new b2BodyDef();
    if ( bodyJso.type == 2 )
        bd.type = b2.dyn.b2Body.b2_dynamicBody;
    else if ( bodyJso.type == 1 )
        bd.type = b2.dyn.b2Body.b2_kinematicBody;
    if ( bodyJso.hasOwnProperty('angle') )
        bd.angle = bodyJso.angle;
    if ( bodyJso.hasOwnProperty('angularVelocity') )
        bd.angularVelocity = bodyJso.angularVelocity;
    if ( bodyJso.hasOwnProperty('active') )
        bd.awake = bodyJso.active;
    if ( bodyJso.hasOwnProperty('fixedRotation') )
        bd.fixedRotation = bodyJso.fixedRotation;
    if ( bodyJso.hasOwnProperty('linearVelocity') && bodyJso.linearVelocity instanceof Object )
        bd.linearVelocity.SetV( bodyJso.linearVelocity );
    if ( bodyJso.hasOwnProperty('position') && bodyJso.position instanceof Object )
    {
        bd.position.y = bd.position.y;
        bd.position.SetV( bodyJso.position );
    }
    if ( bodyJso.hasOwnProperty('awake') )
        bd.awake = bodyJso.awake;
    else
        bd.awake = false;
    var body = world.CreateBody(bd);
    if ( bodyJso.hasOwnProperty('fixture') ) {
        for (k = 0; k < bodyJso.fixture.length; k++) {
            var fixtureJso = bodyJso.fixture[k];
            loadFixtureFromRUBE(body, fixtureJso);
        }
    }
    if ( bodyJso.hasOwnProperty('name') )
        body.name = bodyJso.name;
    if ( bodyJso.hasOwnProperty('customProperties') )
    {
        // add the loadingIndex if applicable
        setCustomProperty(bodyJso, 'int', 'loadingIndex', loadingIndex);

        body.customProperties = bodyJso.customProperties;
    }
    return body;
}

function loadFixtureFromRUBE(body, fixtureJso) {
    var fd = new b2FixtureDef();
    if (fixtureJso.hasOwnProperty('friction'))
        fd.friction = fixtureJso.friction;
    if (fixtureJso.hasOwnProperty('density'))
        fd.density = fixtureJso.density;
    if (fixtureJso.hasOwnProperty('restitution'))
        fd.restitution = fixtureJso.restitution;
    if (fixtureJso.hasOwnProperty('sensor'))
        fd.isSensor = fixtureJso.sensor;
    if ( fixtureJso.hasOwnProperty('filter-categoryBits') )
        fd.filter.categoryBits = fixtureJso['filter-categoryBits'];
    if ( fixtureJso.hasOwnProperty('filter-maskBits') )
        fd.filter.maskBits = fixtureJso['filter-maskBits'];
    if ( fixtureJso.hasOwnProperty('filter-groupIndex') )
        fd.filter.groupIndex = fixtureJso['filter-groupIndex'];
    var fixture;
    if (fixtureJso.hasOwnProperty('circle')) {
        fd.shape = new b2CircleShape();
        fd.shape.m_radius = fixtureJso.circle.radius;
        if ( fixtureJso.circle.center )
            fd.shape.m_p.SetV(fixtureJso.circle.center);
        fixture = body.CreateFixture(fd);
        if ( fixtureJso.name )
            fixture.name = fixtureJso.name;
    }
    else if (fixtureJso.hasOwnProperty('polygon')) {
        fd.shape = new b2PolygonShape();
        var verts = [];
        for (v = 0; v < fixtureJso.polygon.vertices.x.length; v++)
           verts.push( new b2Vec2( fixtureJso.polygon.vertices.x[v], fixtureJso.polygon.vertices.y[v]) );
        fd.shape.SetAsArray(verts, verts.length);
        fixture = body.CreateFixture(fd);
        if ( fixture && fixtureJso.name )
            fixture.name = fixtureJso.name;
    }
    else if (fixtureJso.hasOwnProperty('chain')) {
        fd.shape = new b2PolygonShape();
        var lastVertex = new b2Vec2();
        for (v = 0; v < fixtureJso.chain.vertices.x.length; v++) {
            var thisVertex = new b2Vec2( fixtureJso.chain.vertices.x[v], fixtureJso.chain.vertices.y[v] );
            if ( v > 0 ) {
                fd.shape.SetAsEdge( lastVertex, thisVertex );
                fixture = body.CreateFixture(fd);
                if ( fixtureJso.name )
                    fixture.name = fixtureJso.name;
            }
            lastVertex = thisVertex;
        }
    }
    else {
        console.log("Could not find shape type for fixture");
    }
    if (fixtureJso.hasOwnProperty('customProperties') )
    {
        fixture.customProperties = fixtureJso.customProperties;
    }
}

function getVectorValue(val) {
    if ( val instanceof Object )
    {
        return val;
    }
    else
        return { x:0, y:0 };
}

function loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex) {

    //jointJso
    //console.log(loadedBodies);
    jd.bodyA = loadedBodies[jointJso.bodyA];
    jd.bodyB = loadedBodies[jointJso.bodyB];
    jd.localAnchorA.SetV( getVectorValue(jointJso.anchorA) );
    jd.localAnchorB.SetV( getVectorValue(jointJso.anchorB) );
    if ( jointJso.collideConnected )
        jd.collideConnected = jointJso.collideConnected;

}

function loadJointFromRUBE(jointJso, world, loadedBodies, loadingIndex)
{
    if ( ! jointJso.hasOwnProperty('type') ) {
        console.log("Joint does not have a 'type' property");
        return null;
    }
    if ( jointJso.bodyA >= loadedBodies.length ) {
        console.log("Index for bodyA is invalid: " + jointJso.bodyA );
        return null;
    }
    if ( jointJso.bodyB >= loadedBodies.length ) {
        console.log("Index for bodyB is invalid: " + jointJso.bodyB );
        return null;
    }

    var joint = null;
    var jd;
    if ( jointJso.type == "revolute" ) {
        jd = new b2.joints.b2RevoluteJointDef();
        loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
        //console.log('jd : ', jd);
        if ( jointJso.hasOwnProperty('refAngle'))
            jd.referenceAngle = jointJso.refAngle;
        if ( jointJso.hasOwnProperty('lowerLimit'))
            jd.lowerAngle = jointJso.lowerLimit;
        if ( jointJso.hasOwnProperty('upperLimit'))
            jd.upperAngle = jointJso.upperLimit;
        if ( jointJso.hasOwnProperty('maxMotorTorque'))
            jd.maxMotorTorque = jointJso.maxMotorTorque;
        if ( jointJso.hasOwnProperty('motorSpeed'))
            jd.motorSpeed = jointJso.motorSpeed;
        if ( jointJso.hasOwnProperty('enableLimit'))
            jd.enableLimit = jointJso.enableLimit;
        if ( jointJso.hasOwnProperty('enableMotor'))
            jd.enableMotor = jointJso.enableMotor;

        jd.lowerAngle = 0;
        jd.upperAngle = 0;
        jd.referenceAngle = 0;


        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "distance" || jointJso.type == "rope" ) {
        if ( jointJso.type == "rope" )
            console.log("Replacing unsupported rope joint with distance joint!");
        jd = new b2DistanceJointDef();
        loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
        if ( jointJso.hasOwnProperty('length') )
            jd.length = jointJso.length;
        if ( jointJso.hasOwnProperty('dampingRatio') )
            jd.dampingRatio = jointJso.dampingRatio;
        if ( jointJso.hasOwnProperty('frequency') )
            jd.frequencyHz = jointJso.frequency;
        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "prismatic" ) {
        jd = new b2PrismaticJointDef();
        loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
        if ( jointJso.hasOwnProperty('localAxisA') )
            jd.localAxisA.SetV( getVectorValue(jointJso.localAxisA) );
        if ( jointJso.hasOwnProperty('refAngle') )
            jd.referenceAngle = jointJso.refAngle;
        if ( jointJso.hasOwnProperty('enableLimit') )
            jd.enableLimit = jointJso.enableLimit;
        if ( jointJso.hasOwnProperty('lowerLimit') )
            jd.lowerTranslation = jointJso.lowerLimit;
        if ( jointJso.hasOwnProperty('upperLimit') )
            jd.upperTranslation = jointJso.upperLimit;
        if ( jointJso.hasOwnProperty('enableMotor') )
            jd.enableMotor = jointJso.enableMotor;
        if ( jointJso.hasOwnProperty('maxMotorForce') )
            jd.maxMotorForce = jointJso.maxMotorForce;
        if ( jointJso.hasOwnProperty('motorSpeed') )
            jd.motorSpeed = jointJso.motorSpeed;
        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "wheel" ) {
        //Make a fake wheel joint using a line joint and a distance joint.
        //Return the line joint because it has the linear motor controls.
        //Use ApplyTorque on the bodies to spin the wheel...

        jd = new b2DistanceJointDef();
        loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
        jd.length = 0.0;
        if ( jointJso.hasOwnProperty('springDampingRatio') )
            jd.dampingRatio = jointJso.springDampingRatio;
        if ( jointJso.hasOwnProperty('springFrequency') )
            jd.frequencyHz = jointJso.springFrequency;
        world.CreateJoint(jd);

        jd = new b2LineJointDef();
        loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
        if ( jointJso.hasOwnProperty('localAxisA') )
            jd.localAxisA.SetV( getVectorValue(jointJso.localAxisA) );

        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "friction" ) {
        jd = new b2FrictionJointDef();
        loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
        if ( jointJso.hasOwnProperty('maxForce') )
            jd.maxForce = jointJso.maxForce;
        if ( jointJso.hasOwnProperty('maxTorque') )
            jd.maxTorque = jointJso.maxTorque;
        joint = world.CreateJoint(jd);
    }
    else if ( jointJso.type == "weld" ) {
        jd = new b2.joints.b2WeldJointDef();
        loadJointCommonProperties(jd, jointJso, loadedBodies, loadingIndex);
        if ( jointJso.hasOwnProperty('referenceAngle') )
            jd.referenceAngle = jointJso.referenceAngle;
        joint = world.CreateJoint(jd);
    }
    else {
        console.log("Unsupported joint type: " + jointJso.type);
        console.log(jointJso);
    }
    if ( joint && jointJso.name )
        joint.name = jointJso.name;


    if (jointJso.hasOwnProperty('customProperties') )
    {
        // add the loadingIndex if applicable
        setCustomProperty(jointJso, 'int', 'loadingIndex', loadingIndex);

        joint.customProperties = jointJso.customProperties;
    }

    //console.log(joint);
    return joint;
}

function makeClone(obj) {
  var newObj = (obj instanceof Array) ? [] : {};
  for (var i in obj) {
    if (obj[i] && typeof obj[i] == "object")
      newObj[i] = makeClone(obj[i]);
    else
        newObj[i] = obj[i];
  }
  return newObj;
}

function loadImageFromRUBE(imageJso, world, loadedBodies)
{
    var image = makeClone(imageJso);

    if ( image.hasOwnProperty('body') && image.body >= 0 )
        image.body = loadedBodies[image.body];//change index to the actual body
    else
        image.body = null;

    image.center = new b2Vec2();
    image.center.SetV( getVectorValue(imageJso.center) );

    return image;
}



//mainly just a convenience for the testbed - uses global 'world' variable
function loadSceneFromRUBE(worldJso) {
    return loadSceneIntoWorld(worldJso, world);
}

//load the scene into an already existing world variable
function loadSceneIntoWorld(worldJso, world, loadingIndex) {
    var success = true;
    var loadedBodies = [];
    if ( worldJso.hasOwnProperty('body') ) {
        for (var i = 0; i < worldJso.body.length; i++) {
            var bodyJso = worldJso.body[i];
            var body = loadBodyFromRUBE(bodyJso, world, loadingIndex);
            if ( body )
                loadedBodies.push( body );
            else
                success = false;
        }
    }

    var loadedJoints = [];
    if ( worldJso.hasOwnProperty('joint') ) {
        for (var j = 0; j < worldJso.joint.length; j++) {
            var jointJso = worldJso.joint[j];
            var joint = loadJointFromRUBE(jointJso, world, loadedBodies, loadingIndex);
            if ( joint )
                loadedJoints.push( joint );
            //else
            //    success = false;
        }
    }

    var loadedImages = [];
    if ( worldJso.hasOwnProperty('image') ) {
        for (var k = 0; k < worldJso.image.length; k++) {
            var imageJso = worldJso.image[k];
            var image = loadImageFromRUBE(imageJso, world, loadedBodies);
            if ( image )
                loadedImages.push( image );
            else
                success = false;
        }
        world.images = loadedImages;
    }

    return success;
}

//create a world variable and return it if loading succeeds
// loadingIndex should be filled in in bodies and joints elements loaded in order to track them in the
// case of multiple worlds imports
function loadWorldFromRUBE(worldJso, inputWorld, loadingIndex) {
    //console.log("LoadingIndex: ", loadingIndex);
    var gravity = new b2Vec2(0,0);
    if ( worldJso.hasOwnProperty('gravity') && worldJso.gravity instanceof Object )
        gravity.SetV( worldJso.gravity );
    var world;
    //typeof inputWorld
    if(typeof inputWorld !== "undefined" && inputWorld !== null)
    {
        world = inputWorld;
    }
    else
        world = new b2World( gravity );

    if ( ! loadSceneIntoWorld(worldJso, world, loadingIndex) )
        return false;
    return world;
}

function getNamedBodies(world, name) {
    var bodies = [];
    for (b = world.m_bodyList; b; b = b.m_next) {
        if ( b.name == name )
            bodies.push(b);
    }
    return bodies;
}


function getBodiesWithNamesStartingWith(world, startName) {
    var bodies = [];
    for (b = world.m_bodyList; b; b = b.m_next) {
        if (typeof b.name !== "undefined" && b.name.indexOf(startName) === 0)
            bodies.push(b);
    }
    return bodies;
}


function getBodies(world) {
    var bodies = [];
    for (b = world.m_bodyList; b; b = b.m_next) {
        bodies.push(b);
    }
    return bodies;
}

function getNamedFixtures(world, name) {
    var fixtures = [];
    for (b = world.m_bodyList; b; b = b.m_next) {
        for (f = b.m_fixtureList; f; f = f.m_next) {
            if ( f.name == name )
                fixtures.push(f);
        }
    }
    return fixtures;
}

function getNamedJoints(world, name) {
    var joints = [];
    for (j = world.m_jointList; j; j = j.m_next) {
        if ( j.name == name )
            joints.push(j);
    }
    return joints;
}

function getNamedImages(world, name) {
    var images = [];
    for (i = 0; i < world.images.length; i++) {
        if ( world.images[i].name == name )
            images.push(world.images[i].name);
    }
    return images;
}

//custom properties
function getBodiesByCustomProperty(world, propertyType, propertyName, valueToMatch) {
    var bodies = [];
    for (b = world.m_bodyList; b; b = b.m_next) {
        if ( !b.hasOwnProperty('customProperties'))
            continue;
        for (var i = 0; i < b.customProperties.length; i++) {
            if ( ! b.customProperties[i].hasOwnProperty("name") )
                continue;
            if ( ! b.customProperties[i].hasOwnProperty(propertyType) )
                continue;
            if ( b.customProperties[i].name == propertyName &&
                 b.customProperties[i][propertyType] == valueToMatch)
                bodies.push(b);
        }
    }
    return bodies;
}

//custom properties
function filterElementsByCustomProperty(inputElements, propertyType, propertyName, valueToMatch) {
    //console.log('inputElements : ', inputElements, 'searching for ', valueToMatch);
    var elements = [];
    for (var i in inputElements)
    {
        var b = inputElements[i];
        if ( !b.hasOwnProperty('customProperties'))
            continue;
        for (var i = 0; i < b.customProperties.length; i++) {
            if ( ! b.customProperties[i].hasOwnProperty("name") )
                continue;
            if ( ! b.customProperties[i].hasOwnProperty(propertyType) )
                continue;
            if ( b.customProperties[i].name == propertyName &&
                 b.customProperties[i][propertyType] == valueToMatch)
                elements.push(b);
        }
    }
    //console.log('I Found  : ', elements);
    return elements;
}


function hasCustomProperty(item, propertyType, propertyName) {
    if ( !item.hasOwnProperty('customProperties') )
        return false;
    for (var i = 0; i < item.customProperties.length; i++) {
        if ( ! item.customProperties[i].hasOwnProperty("name") )
            continue;
        if ( ! item.customProperties[i].hasOwnProperty(propertyType) )
            continue;
        return true;
    }
    return false;
}

function getCustomProperty(item, propertyType, propertyName, defaultValue) {
    if ( !item.hasOwnProperty('customProperties') )
        return defaultValue;
    for (var i = 0; i < item.customProperties.length; i++) {
        if ( ! item.customProperties[i].hasOwnProperty("name") )
            continue;
        if ( ! item.customProperties[i].hasOwnProperty(propertyType) )
            continue;
        if ( item.customProperties[i].name == propertyName )
            return item.customProperties[i][propertyType];
    }
    return defaultValue;
}

function setCustomProperty(item, propertyType, propertyName, value) {
    if ( !item.hasOwnProperty('customProperties') )
        return value;
    for (var i = 0; i < item.customProperties.length; i++) {
        if ( ! item.customProperties[i].hasOwnProperty("name") )
            continue;
        if ( ! item.customProperties[i].hasOwnProperty(propertyType) )
            continue;
        if ( item.customProperties[i].name == propertyName )
            item.customProperties[i][propertyType] = value;
    }
    return value;
}