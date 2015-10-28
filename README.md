SUPERSPRINT WEB
===============
SuperSprint is an attempt to recreate the famous game I've been playing for hours when I was a kid on our good old Atari ST 520 ([What did SuperSprint look like actually ?](https://www.youtube.com/watch?v=RdVAUCpVv4o)), on the web. I would really like to make this a multiplayer game (using websockets ?), this is _the_ milestone I'd like to reach.

I'm using the following javascript technologies  : 
 - Box2dweb physics engine : I've tried several javascript physics engines so far, but none of them contained half the documentation, the stackoverflow-answer base, features and/or helpers box2dweb has. 
 - Pixi JS : pixi seems to be the 2D rendering engine that has this great WebGL with canvas fallback, plus the community is very dynamic as far as I can tell.
 - NodeJS : very handy self-contained webserver, and their seems not to be much to set up for socket.io in the near future.

I Hope you like it !! 
  
 
HOW TO START THE GAME
---------------------
In the app/ folder, you'll find a node server ([node_server.js](https://github.com/BlueInt32/super-sprint/blob/master/app/node_server.js)) you can start using the command `node node_server.js` (you have to install nodeJS first !). After that just `start chrome localhost:8000` and point to app/index.html.

HOW TO CODE
---------------------

######url params
You can call different tracks using url params: 
`http://localhost:8000/index.html?track=1&cars=0,0`
This url loads : 
- track 1 of those contained in TracksConfig array (see [tracksConfig.coffee](https://github.com/BlueInt32/super-sprint/blob/master/app/js/conf/tracksConfig.coffee))

- 2 instances of the 0th car config (find it [here] (https://github.com/BlueInt32/super-sprint/blob/master/app/js/conf/carsConfig.coffee))

Note : the first car index provided corresponds to the player's car. 

######game process starting point
The main game process is situated in game.coffee

######Box2D and Pixi fighting for canvas space
You can  show/hide box2d debugging info by un/commenting this line in game.coffee
`@universe.world.SetDebugDraw(debugDrawer)`

You can show/hide pixi sprites by un/commenting the following line in universe.coffee (I agree this is weird)
`@pixiRenderer.render(@pixiStage);`

CREATING TRACKS AND CARS
------------------------
All the infos for creating assets are (or will be) in the [assets folder](https://github.com/BlueInt32/super-sprint/tree/master/app/assets)