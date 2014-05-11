class WorldSetup
	constructor: (resourcesList) ->
		@jsonLinkedList =resourcesList;
		@cars = [];
		@tires = [];
		@trackWalls = [];
		@trackStartPositions = [];
		@mainLoaderCallback = null;
		@refWorld = null;

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
			@refWorld = loadWorldFromRUBE(parsedJson, @refWorld)

			# After data has been loaded, we set meta data to keep track of each one
			if(resourceNode.dataType == "car")
				carBody = getBodiesByCustomProperty(@refWorld, "string", "category", "car_body")[0]
				carRearTires = getBodiesByCustomProperty(@refWorld, "string", "category", "wheel_rear")
				carFrontTires = getBodiesByCustomProperty(@refWorld, "string", "category", "wheel_front")
				dirJoints = getNamedJoints(@refWorld, "direction")
				@cars.push({carBody : carBody, rearTires : carRearTires, frontTires : carFrontTires, directionJoints : dirJoints})
			else if (resourceNode.dataType == "track")
				# if it's a track, we take all the bodies as is.
				@trackWalls = getBodies(@refWorld)
				@trackStartPositions = getBodiesWithNamesStartingWith(@refWorld)

			#if there still are nodes to load, we load them. else, we launch the main callback
			if resourceNode.next?
				@loadResource(resourceNode.next)
				return
			else
				@mainLoaderCallback(@trackWalls, @cars)
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