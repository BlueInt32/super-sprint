#Car class
class Car
    constructor: (@configuration) ->

    setBox2dData: (box2dData) ->
        @rearTires = box2dData.rearTires
        @frontTires = box2dData.frontTires
        @tires = @rearTires.concat(@frontTires)
        @tiresCount = @tires.length
        @directionJoints = box2dData.directionJoints
        @b2Body = box2dData.carBody

    setPosition:(chosenPosition) ->
        temp = chosenPosition.Copy()
        temp.Add(@b2Body.GetPosition())
        @b2Body.SetPosition(temp)

    coucou: ->