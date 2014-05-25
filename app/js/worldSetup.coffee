class WorldSetup
	constructor: (resourcesList) ->
		@jsonLinkedList = resourcesList
		@playerCar = null
		@otherCars = []
		@trackWalls = []
		@trackStartPositions = []
		@trackIaLine = null # this references the line iaCars are linked to
		@mainLoaderCallback = null
		@refWorld = null

		@firstCarLoaded = false # first car is playercar. This flag helps informing this

		@resourceLoadingIndex = 0

	launchMultiLoad: (callback) ->
		@mainLoaderCallback = callback
		@loadResource(@jsonLinkedList.firstNode)
		return

	setWorld:(world) ->
		@refWorld = world
		return

	loadResource: (resourceNode) ->
		if(resourceNode.data == "")
			@loadResource(resourceNode.next)
		@loadJSON resourceNode.data, (rawJson) =>
			parsedJson = JSON.parse(rawJson)
			# Data from rube have to be preprocessed: invert y, among others things
			parsedJson = @preprocessRube(parsedJson)

			# we call the lib rube provided to our refWorld.

			@refWorld = loadWorldFromRUBE(parsedJson, @refWorld, @resourceLoadingIndex)

			# After data has been loaded, we set meta data to keep track of each one
			if(resourceNode.dataType == "car")
				carsInWorld = getBodiesByCustomProperty(@refWorld, "string", "category", "car_body")
				rearTiresInWorld = getBodiesByCustomProperty(@refWorld, "string", "category", "wheel_rear")
				frontTiresInWorld = getBodiesByCustomProperty(@refWorld, "string", "category", "wheel_front")
				dirJointsInWorld = getNamedJoints(@refWorld, "direction")

				# get from these elements those that have the correct loadingIndex in the world (set by loadWorldFromRUBE function)
				carBody = filterElementsByCustomProperty(carsInWorld, 'int', 'loadingIndex', @resourceLoadingIndex)[0]
				carRearTires = filterElementsByCustomProperty(rearTiresInWorld, 'int', 'loadingIndex', @resourceLoadingIndex)
				carFrontTires = filterElementsByCustomProperty(frontTiresInWorld, 'int', 'loadingIndex', @resourceLoadingIndex)
				dirJoints = filterElementsByCustomProperty(dirJointsInWorld, 'int', 'loadingIndex', @resourceLoadingIndex)


				carSet = {carBody : carBody, rearTires : carRearTires, frontTires : carFrontTires, directionJoints : dirJoints}

				if !@firstCarLoaded # first car is playercar. This flag helps informing this and sorting carsSets out
					@playerCar = carSet
					@firstCarLoaded = true
				else
					@otherCars.push(carSet)
					# add a distance joint from
					iaBoundDef = new b2.joints.b2DistanceJointDef()
					iaBoundDef.bodyA = @trackIaLine
					iaBoundDef.bodyB = carBody
					iaBoundDef.collideConnected = false
					iaBoundDef.length = 1
					#iaBoundDef.localAnchorA.SetV(getVectorValue(jointJso.anchorA));
					iaBoundDef.localAnchorB.SetV( new b2.cMath.b2Vec2(0, 0.25) );
					console.log('iaBoundDef : ', iaBoundDef);
					joint = @refWorld.CreateJoint(iaBoundDef);


			else if (resourceNode.dataType == "track")
				# if it's a track, we take all the bodies as is.
				@trackWalls = getBodies(@refWorld)
				@trackStartPositions = getBodiesWithNamesStartingWith(@refWorld)
				@trackIaLine = getBodiesByCustomProperty(@refWorld, "string", "category", "iaLine")[0] # there is only one iaLine in the track... for now !

			@resourceLoadingIndex++
			#if there still are nodes to load, we load them. else, we call the main callback
			if resourceNode.next?
				@loadResource(resourceNode.next)
				return
			else
				@mainLoaderCallback.apply(null, [@trackWalls, @playerCar, @otherCars])
				return
	preprocessRube: (parsedJson)->
		# invert y on vertices and bodies position
		for jsonBody in parsedJson.body
			#console.log(jsonBody);
			if(jsonBody.position != 0)
				jsonBody.position.y = jsonBody.position.y * -1

			if(typeof jsonBody.fixture != "undefined")
				for fixture in jsonBody.fixture
					# Process polygons vertices in fixtures
					if(fixture.hasOwnProperty("polygon"))
						for index of fixture.polygon.vertices.y
							fixture.polygon.vertices.y[index] = -fixture.polygon.vertices.y[index];
						# very important : if we invert y, the array becomes clockwise, which is bad, we have to reverse it
						fixture.polygon.vertices.x.reverse()
						fixture.polygon.vertices.y.reverse()
					# Process chains vertices in fixtures
					if(fixture.hasOwnProperty("chain"))
						for index of fixture.chain.vertices.y
							fixture.chain.vertices.y[index] = -fixture.chain.vertices.y[index];
						# very important : if we invert y, the array becomes cloclwise, which is bad, we have to reverse it
						fixture.chain.vertices.x.reverse()
						fixture.chain.vertices.y.reverse()

		#invert y on joint anchors
		if(parsedJson.hasOwnProperty("joint"))
			for joint in parsedJson.joint
				if(joint.anchorA != 0)
					joint.anchorA.y = joint.anchorA.y * -1;
				if(joint.anchorB != 0)
					joint.anchorB.y = joint.anchorB.y * -1;
				joint.upperLimit = 0;
				joint.lowerLimit = 0;

		return parsedJson

	loadJSON :(filePath, callback)->
		#console.log(filePath, callback);
		xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', filePath, true);
		xobj.onreadystatechange = () ->
			if (xobj.readyState == 4 and xobj.status == 200)
				# .open will NOT return a value but simply returns undefined in async mode so use a callback
				callback(xobj.responseText);
				return

		xobj.send(null);
		return