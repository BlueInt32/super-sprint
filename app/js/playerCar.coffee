class PlayerCar extends Car
    handleKeyboard:(keyboardData) ->
        if keyboardData.accelerate then @accelerate()
        if keyboardData.handbrake then @handBrake()
        else @handBrakeRelease()
        if keyboardData.brake then @brake()

        @updateSteering(keyboardData)
        return

    updateSteering:(keyboardData) ->
        if (keyboardData.right && !@puddleEffect)
            @desiredAngle =  @lockAngleDeg * @consts.DEGTORAD
        else if (keyboardData.left && !@puddleEffect)
            @desiredAngle = -@lockAngleDeg * @consts.DEGTORAD
        else @desiredAngle = 0;
        angleNow = @directionJoints[0].GetJointAngle()

        angleToTurn = @desiredAngle - angleNow
        if(Math.abs(angleNow) > @lockAngleDeg)
            angleToTurn = -angleNow
        else
            angleToTurn = b2Math.Clamp( angleToTurn, -@turnPerTimeStep, @turnPerTimeStep )
        newAngle = angleNow + angleToTurn
        @directionJoints[0].SetLimits(newAngle, newAngle)
        @directionJoints[1].SetLimits(newAngle, newAngle)

        @updateFriction()
        position = @b2Body.GetPosition()
        @pixiSprite.position.x = position.x * @consts.METER
        @pixiSprite.position.y = position.y * @consts.METER
        @pixiSprite.rotation = @b2Body.GetAngle()
        return

    accelerate: ->
        tires = @tires
        for i of tires
            b2.applyForceToCenter(tires[i], @localAccelerationVector)
        return

    brake: ->
        tires = @tires
        for i of tires
            b2.applyForceToCenter(tires[i], @localBrakeVector)
        return

    handBrake: ->
        tires = @tires
        for i of tires
            b2.applyForceToCenter(tires[i], @localHandBrakeVector)
            @drifting = true
        return

    handBrakeRelease: ->
        @drifting = false
        return