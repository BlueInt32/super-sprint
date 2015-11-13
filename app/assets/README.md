## Creating resources for SuperSprint
The easiest way to create objects for the game is to use the excellent box2d editor : [R.U.B.E](https://www.iforce2d.net/rube/)
This app lets you export json files containing everything we need to recreate the objects inside the game world (except some details such as y axis inversion and center coords).

One important thing to note though is that jsons export an entire world, whereas we want to use one json file per game object: 1 track and several cars.
This means we have to inject the content of each json file to our unique world, and *in the right place*.


### Creating a track

A track is composed of walls, checkpoints, start positions and boosts.

_Size_ : Tracks have to be about 10 rube units wide and 8 rube units tall.

####Elements
- *Walls* have to be static bodies (that's all, no particular name needed)
- *Checkpoints* fixtures have to be set as sensors and named "cp#" (to handle contact correctly) with # starting from 0. There has to be at least 3 checkpoints for the timer to work properly.
- *Start* points have to be bodies without fixture and be named start# with # starting from 0
- *Boosts* fixtures have to be set as sensors, named starting with "boost" and provided with a custom property called boostVector(vec2) which would be the boost direction vector

### Creating a car
#### Size and position
Cars have to be about 0.3 units wide (0.1 units are blue dotted in Rube) and 0.5 units tall. The car has to be as centered as possible, because this center will be translated to one of the track start positions.

#### MetaData
A car contains at least one main body and wheels, each of which having a particular name property
- the main body has its name set to 'car_body'
- the wheels have their name starting with 'wheel_rear' for rear wheels and 'wheel_front' for front wheels

There has to be 4 joints with bodyA set to the car_body and bodyB set to each wheel (bodyA of joints always has to be the car body, it's simpler). Joints have their anchors positionned to wheels centers.
The two joints for front wheels are revolute joints, and have to be provided a custom property 'direction'(bool) set to true.

