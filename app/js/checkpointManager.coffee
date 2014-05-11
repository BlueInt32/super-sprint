class CheckPointManager
    constructor: (nbCheckPoints) ->
        @NbCheckPoints = nbCheckPoints
        @CurrentCheckPointIndex = -1
        @startLap = null
        @LastLapTime = null
        @BestLapTime = 0
        @NbLaps = 0
        document.getElementById("lapTime").innerHTML = "Lap : --- ";
        document.getElementById("bestLapTime").innerHTML = "Best : --- ";

    step: (checkpointIndex) ->
        if @CurrentCheckPointIndex % @NbCheckPoints == checkpointIndex
            return; # this breakPoint has already been touched, we do nothing
        if(checkpointIndex == 0)
            if(@CurrentCheckPointIndex == -1)
                @TotalTime = new Date()
                @startLap = Date.now()
                @CurrentCheckPointIndex = 0;
                document.getElementById("lapTime").innerHTML = "Lap : 0.0s"
            else
                now = Date.now()
                lapTime = now - @startLap
                @LastLapTime = lapTime
                @startLap = now
                if(@BestLapTime == 0)
                    @BestLapTime = @LastLapTime
                else if(@LastLapTime < @BestLapTime)
                    @BestLapTime = @LastLapTime
                document.getElementById("lapTime").innerHTML = "Lap : " + @LastLapTime / 1000 + "s"
                document.getElementById("bestLapTime").innerHTML = "Best : " + @BestLapTime / 1000 + "s"
        if(checkpointIndex == (@CurrentCheckPointIndex + 1)%@NbCheckPoints)
            @CurrentCheckPointIndex++