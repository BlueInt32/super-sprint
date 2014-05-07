function WorldSetup(jsonsToLoad)
{
    this.jsonsToLoad = jsonsToLoad; // object containing track and cars[]
    this.jsonLinkedList = new LinkedList();
    this.jsonLinkedList.add(jsonsToLoad.track, "track");
    for (var i = 0, l = jsonsToLoad.cars.length; i < l; i++)
    {
        this.jsonLinkedList.add(jsonsToLoad.cars[i], "car");
    }
    this.cars = [];
    this.tires = [];
    this.trackWalls = [];
    this.trackStartPositions = [];
    this.mainLoaderCallback = null;
    this.refWorld = null;
}

WorldSetup.prototype.launchMultiLoad = function(callback)
{
    this.mainLoaderCallback = callback;

    // Loading jsons as a linkedList
    if(this.jsonsToLoad.track !== null)
    {
        this.LoadResource(this.jsonLinkedList.firstNode);
    }
};

WorldSetup.prototype.setWorld = function(world)
{
    this.refWorld = world;
};


WorldSetup.prototype.LoadResource = function(resourceNode)
{
    var me = this;
    if(resourceNode.data === "")
        me.LoadResource(resourceNode.next);
    loadJSON(resourceNode.data, function(rawJson)
    {
        var parsedJson = JSON.parse(rawJson);


    // Data from rube have to be preprocessed: invert y, among others things
        parsedJson = me.PreprocessRube(parsedJson);

    // we call the lib rube provided to our refWorld.
        me.refWorld = loadWorldFromRUBE(parsedJson, me.refWorld);

    // After data has been loaded, we set meta data to keep track of each one
        if(resourceNode.dataType === "car")
        {
            var carBody = getBodiesByCustomProperty(me.refWorld, "string", "category", "car_body")[0];
            var carRearTires = getBodiesByCustomProperty(me.refWorld, "string", "category", "wheel_rear");
            var carFrontTires = getBodiesByCustomProperty(me.refWorld, "string", "category", "wheel_front");
            //console.log("rearTires", carRearTires);
            //console.log("frontTires", carFrontTires);
            var dirJoints = getNamedJoints(me.refWorld, "direction");
            me.cars.push({carBody : carBody, rearTires : carRearTires, frontTires : carFrontTires, directionJoints : dirJoints});
        }
        else if (resourceNode.dataType === "track")
        {
            // if it's a track, we take all the bodies as is.
            me.trackWalls = getBodies(me.refWorld);
            me.trackStartPositions = getBodiesWithNamesStartingWith(me.refWorld);
        }


    //if there still are nodes to load, we load them. else, we launch the main callback
        if(resourceNode.next !== null)
            me.LoadResource(resourceNode.next);
        else
            me.mainLoaderCallback(me.trackWalls, me.cars);
    });
};


WorldSetup.prototype.PreprocessRube = function(parsedJson)
{
    // invert y on vertices and bodies position

    for (var i = parsedJson.body.length - 1; i >= 0; i--)
    {
        var jsonBody = parsedJson.body[i];
        //console.log(jsonBody);
        if(jsonBody.position !== 0)
        {
            jsonBody.position.y = jsonBody.position.y * -1;
        }

        if(typeof jsonBody.fixture != "undefined")
        {
            for (var j = jsonBody.fixture.length - 1; j >= 0; j--) {
                var fixture = jsonBody.fixture[j];
                // Process polygons vertices in fixtures
                if(fixture.hasOwnProperty("polygon"))
                {
                    for (var k = fixture.polygon.vertices.y.length - 1; k >= 0; k--)
                    {
                        fixture.polygon.vertices.y[k] = -fixture.polygon.vertices.y[k];
                    }
                    // very important : if we invert y, the array becomes clockwise, which is bad, we have to reverse it
                    fixture.polygon.vertices.x.reverse();
                    fixture.polygon.vertices.y.reverse();
                }
                // Process chains vertices in fixtures
                if(fixture.hasOwnProperty("chain"))
                {

                    for (var l = fixture.chain.vertices.y.length - 1; l >= 0; l--)
                    {
                        fixture.chain.vertices.y[l] = -fixture.chain.vertices.y[l];
                    }
                    // very important : if we invert y, the array becomes cloclwise, which is bad, we have to reverse it
                    fixture.chain.vertices.x.reverse();
                    fixture.chain.vertices.y.reverse();
                }
            }
        }
    }

    //invert y on joint anchors
    if(parsedJson.hasOwnProperty("joint"))
    {
        for (i = parsedJson.joint.length - 1; i >= 0; i--) {
            var joint = parsedJson.joint[i];
            if(joint.anchorA !== 0)
                joint.anchorA.y = joint.anchorA.y * -1;
            if(joint.anchorB !== 0)
                joint.anchorB.y = joint.anchorB.y * -1;

            joint.upperLimit = 0;
            joint.lowerLimit = 0;

        }
    }

    return parsedJson;

};

function loadJSON (filePath, callback)
{
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, true);
    xobj.onreadystatechange = function ()
    {
        if (xobj.readyState == 4 && xobj.status == "200")
        {
            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}