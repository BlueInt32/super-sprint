class Car
    constructor: (@configuration) ->

    setBox2dData: (box2dData) ->
        @rearTires = box2dData.rearTires
        @frontTires = box2dData.frontTires
        @tires = @rearTires.concat(@frontTires)
        return @b2Body = box2dData.carBody
