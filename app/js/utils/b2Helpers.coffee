class b2
    @dyn: Box2D.Dynamics
    @shapes: Box2D.Collision.Shapes
    @cMath: Box2D.Common.Math
    @math : Box2D.Common.Math.b2Math
    @joints : Box2D.Dynamics.Joints

    @findCustomPropertyValue:(b2Body, cPropertyName, typeName)->
        if b2Body.customProperties?
            for property in b2Body.customProperties
                if property.name == cPropertyName then return property[typeName];

    @applyForceToCenter: (b2Body, vector2)->
        b2Body.ApplyForce(b2Body.GetWorldVector(vector2), b2Body.GetWorldCenter())