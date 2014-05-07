var b2 = {
	dyn: Box2D.Dynamics,
	shapes: Box2D.Collision.Shapes,
	cMath: Box2D.Common.Math,
	math : Box2D.Common.Math.b2Math,
	joints : Box2D.Dynamics.Joints,

    findCustomPropertyValue: function(b2Body, cPropertyName, typeName)
    {
        if(b2Body.customProperties !== null)
        {
            for (var i = b2Body.customProperties.length - 1; i >= 0; i--) {
                if(b2Body.customProperties[i].name === cPropertyName)
                    return b2Body.customProperties[i][typeName];
            };
        }
    },
    applyForceToCenter: function(b2Body, vector2)
    {
        console.log('b2Body', b2Body);
        b2Body.ApplyForce(b2Body.GetWorldVector(vector2), b2Body.GetWorldCenter())
    }
};
