#### Create a car
Cars have to be about 0.3 units wide (0.1 units are blue dotted in Rube) and 0.5 units tall.
A car has to contain 1 main body with a custom property 'category'(string) named 'car_body' and 4 wheels with category set to 'wheel'
Rear wheels have to be set a custom property 'isBackWheel'(bool) set to true.
There has to be 4 joints with bodyA set to the car_body and bodyB set to each wheel (bodyA of joints always has to be the car body, it's simpler). Joints have their anchors to wheels centers.
The two joints for front wheels are revolute joints, and have to be provided a custom property 'direction'(bool) set to true.

#### Create a track
Tracks have to be about 10 rube units wide and 8 rube units tall. 

- Walls have to be static bodies (that's all).
- Checkpoints fixtures have to be set as sensors and named "cp#" (to handle contact correctly) with # starting from 0. There has to be at least 3 checkpoints for the timer to work properly.
- Start points have to be bodies without fixture and be named start# with # starting from 0
- Boosts fixtures have to be set as sensors, named starting with "boost" and provided with a custom property called boostVector(vec2) which would be the boost direction vector


