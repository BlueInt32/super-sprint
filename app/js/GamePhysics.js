'use strict';


/// Encapsulation de toute la logique physique
function GamePhysics(viewWidth, viewHeight)
{
	var square = [{x: 0, y: 50},{x: 50, y: 50},{x: 50, y: 0},{x: 0, y: 0}];

	var me = this;
	this.world = Physics(function(world)
	{

		var box = Physics.body('convex-polygon', {
			vertices: square,
			x: viewWidth / 2,
			y: viewHeight / 2,
			restitution: 0.9,
			angle: Math.random()
		});

		console.log(box);

		// add the circle to the world
		world.add(box);
		var gravity = Physics.behavior('constant-acceleration', {
			acc: { x: 0, y: 0.0004 } // this is the default
		});
		world.add(gravity);

		//var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

		//world.add(Physics.behavior('edge-collision-detection', {
		//	aabb: viewportBounds
		//}));
		//// ensure objects bounce when edge collision is detected
		//world.add(Physics.behavior('body-impulse-response'));

	});

	this.i = 0;
	// subscribe to the ticker
	Physics.util.ticker.subscribe(function (time, dt)
	{
		me.i++;
		if (me.i == 10)
		{
			console.log(me.world);
		}
		me.world.step(time);
		// Note: FPS ~= 1/dt
	});
	// start the ticker
	Physics.util.ticker.start();
}