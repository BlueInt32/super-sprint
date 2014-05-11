class KeyboardHandler
    constructor:()->
        @keyArray = []
        @keys = { accelerate: false, brake: false, left: false, right: false, handbrake:false }

    handleKeyDown:(event) ->
        key = event.which

        if @keyArray.indexOf(key) > -1 then return
        knowKey = true
        switch (key)
            when 37
                @keys.left = true
                break
            when 38
                @keys.accelerate = true
                break
            when 39
                @keys.right = true
                break
            when 40
                @keys.brake = true
                break
            when 32
                @keys.handbrake = true
                break
            else knowKey = false
        if (knowKey) then @keyArray.push(key)
        return

    handleKeyUp:(event) ->
        key = event.which
        i = @keyArray.indexOf(key)
        if i > -1 then @keyArray.splice(i, 1)

        switch (key)
            when 37
                @keys.left = false
                break
            when 38
                @keys.accelerate = false
                break
            when 39
                @keys.right = false
                break
            when 40
                @keys.brake = false
                break
            when 32
                @keys.handbrake = false
                break

        return