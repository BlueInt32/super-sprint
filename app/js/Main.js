

(function Main()
{
	var bodies = [],
		keyboardHandler = new KeyboardHandler(),
		stage,
		renderer,
		world,
		mouseJoint,
		isBegin,
		stats,
		Consts = new ConstsDef(),
		pixiSprite;

	var b2Math = Box2D.Common.Math.b2Math;

	(function init()
	{
		if (!window.requestAnimationFrame)
		{
			window.requestAnimationFrame = (function ()
			{
				return window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback)
				{
					window.setTimeout(callback, 1000 / 60);
				};
			})();
		}

		window.onload = onLoad;
	})();

	function onLoad()
	{
		const container = document.createElement("div");
		document.body.appendChild(container);

		stats = new Stats();
		container.appendChild(stats.domElement);
		stats.domElement.style.position = "absolute";

		stage = new PIXI.Stage(0xDDDDDD, true);
		console.log(Consts.STAGE_WIDTH_PIXEL);
		renderer = PIXI.autoDetectRenderer(Consts.STAGE_WIDTH_PIXEL, Consts.STAGE_HEIGHT_PIXEL, undefined, false);
		document.body.appendChild(renderer.view);

		const loader = new PIXI.AssetLoader(["Content/images/car.png"]);
		loader.onComplete = onLoadAssets;
		loader.load();
	}

	function onLoadAssets()
	{
		world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 0), true);

		const polyFixture = new Box2D.Dynamics.b2FixtureDef();
		polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		polyFixture.density = 1;

		const circleFixture = new Box2D.Dynamics.b2FixtureDef();
		circleFixture.shape = new Box2D.Collision.Shapes.b2CircleShape();
		circleFixture.density = 1;
		circleFixture.restitution = 0.7;

		const bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;

		//down
		polyFixture.shape.SetAsBox(10, 1);
		bodyDef.position.Set(9, Consts.STAGE_HEIGHT_B2 + 1);
		world.CreateBody(bodyDef).CreateFixture(polyFixture);

		//left
		polyFixture.shape.SetAsBox(1, 100);
		bodyDef.position.Set(-1, 0);
		world.CreateBody(bodyDef).CreateFixture(polyFixture);

		//right
		bodyDef.position.Set(Consts.STAGE_WIDTH_B2 + 1, 0);
		world.CreateBody(bodyDef).CreateFixture(polyFixture);
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

		console.log(Consts.STAGE_WIDTH_B2);
		bodyDef.position.Set(Consts.STAGE_WIDTH_B2 / 2, Consts.STAGE_HEIGHT_B2 / 2);
		bodyDef.angle = 0;
		//body.ApplyImpulse(impulse, body.GetWorldCenter());

		var body = world.CreateBody(bodyDef);
		var s = MathUtil.rndRange(50, 100);
		polyFixture.shape.SetAsBox(Consts.CAR_WIDTH_B2, Consts.CAR_HEIGHT_B2);
		body.CreateFixture(polyFixture);

		bodies.push(body);

		pixiSprite = new PIXI.Sprite(PIXI.Texture.fromFrame("Content/images/car.png"));
		stage.addChild(pixiSprite);


		pixiSprite.anchor.x = pixiSprite.anchor.y = 0.5;
		pixiSprite.scale.x = 1;
		pixiSprite.scale.y = 1;

		document.onkeydown = keyboardHandler.HandleKeyDown.bind(keyboardHandler);
		document.onkeyup = keyboardHandler.HandleKeyUp.bind(keyboardHandler);
		document.addEventListener("mousedown", function (event)
		{
			isBegin = true;
			onMove(event);
			document.addEventListener("mousemove", onMove, true);
		}, true);

		document.addEventListener("mouseup", function (event)
		{
			document.removeEventListener("mousemove", onMove, true);
			isBegin = false;
			touchX = undefined;
			touchY = undefined;
		}, true);

		renderer.view.addEventListener("touchstart", function (event)
		{
			isBegin = true;
			onMove(event);
			renderer.view.addEventListener("touchmove", onMove, true);
		}, true);

		renderer.view.addEventListener("touchend", function (event)
		{
			renderer.view.removeEventListener("touchmove", onMove, true);
			isBegin = false;
			touchX = undefined;
			touchY = undefined;
		}, true);

		update();
	}

	function getBodyAtMouse()
	{
		const mousePos = new Box2D.Common.Math.b2Vec2(touchX, touchY);
		const aabb = new Box2D.Collision.b2AABB();
		aabb.lowerBound.Set(touchX - 0.001, touchY - 0.001);
		aabb.upperBound.Set(touchX + 0.001, touchY + 0.001);

		var body;
		world.QueryAABB(
            function (fixture)
            {
            	if (fixture.GetBody().GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody)
            	{
            		if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePos))
            		{
            			body = fixture.GetBody();
            			return false;
            		}
            	}
            	return true;
            }, aabb);

		return body;
	}

	function update()
	{
		requestAnimationFrame(update);

		if (isBegin && !mouseJoint)
		{
			const dragBody = getBodyAtMouse();
			if (dragBody)
			{
				const jointDef = new Box2D.Dynamics.Joints.b2MouseJointDef();
				jointDef.bodyA = world.GetGroundBody();
				jointDef.bodyB = dragBody;
				jointDef.target.Set(touchX, touchY);
				jointDef.collideConnected = true;
				jointDef.maxForce = 300.0 * dragBody.GetMass();
				mouseJoint = world.CreateJoint(jointDef);
				dragBody.SetAwake(true);
			}
		}

		if (mouseJoint)
		{
			if (isBegin)
				mouseJoint.SetTarget(new Box2D.Common.Math.b2Vec2(touchX, touchY));
			else
			{
				world.DestroyJoint(mouseJoint);
				mouseJoint = null;
			}
		}


		world.Step(1 / 60, 3, 3);
		world.ClearForces();

		var body = bodies[0];
		var thing = things[0];


		var currentRightNormal = body.GetWorldVector(new Box2D.Common.Math.b2Vec2(0, 1));

		var vCurrentRightNormal = b2Math.MulFV(b2Math.Dot(currentRightNormal, body.GetLinearVelocity()), currentRightNormal);

		var impulse = b2Math.MulFV(-body.GetMass(), vCurrentRightNormal);
		body.ApplyImpulse(impulse, body.GetWorldCenter());



		if (keyboardHandler.Keys.accelerate)
		{
			body.ApplyForce(body.GetWorldVector(new Box2D.Common.Math.b2Vec2(1, 0)), body.GetWorldCenter());
		}
		else if (b2Math.Dot(body.GetLinearVelocity(), body.GetWorldVector(new Box2D.Common.Math.b2Vec2(1, 0))) > 0)
		{
			body.ApplyForce(body.GetWorldVector(new Box2D.Common.Math.b2Vec2(-0.2, 0)), body.GetWorldCenter());
		}
		else if (keyboardHandler.Keys.brake)
		{
			body.ApplyForce(body.GetWorldVector(new Box2D.Common.Math.b2Vec2(-1, 0)), body.GetWorldCenter());
		}
		if (keyboardHandler.Keys.left)
		{
			body.ApplyTorque(-Consts.CAR_ROTATE_FACTOR);
		}
		if (keyboardHandler.Keys.right)
		{
			body.ApplyTorque(Consts.CAR_ROTATE_FACTOR);
		}
		var position = body.GetPosition();
		pixiSprite.position.x = position.x * Consts.METER;
		pixiSprite.position.y = position.y * Consts.METER;
		pixiSprite.rotation = body.GetAngle();


		renderer.render(stage);
		stats.update();
	}
})();