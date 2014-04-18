function RubeFilesLoader(jsonsToLoad)
{
    this.jsonsToLoad = jsonsToLoad; // object containing track and cars[]
    this.jsonLinkedList = new LinkedList();
    this.jsonLinkedList.add(jsonsToLoad.track, "track");
    for (var i = 0, l = jsonsToLoad.cars.length; i < l; i++)
    {
        this.jsonLinkedList.add(jsonsToLoad.cars[i], "car");
    };
    this.cars = [];
    this.tires = [];
    this.trackWalls = [];
    this.mainLoaderCallback = null;
    this.refWorld = null;
}

RubeFilesLoader.prototype.load = function(callback)
{
    this.mainLoaderCallback = callback;

    // Loading jsons as a linkedList
    if(this.jsonsToLoad.track != null)
    {
        this.LoadResource(this.jsonLinkedList.firstNode);
    }
}

RubeFilesLoader.prototype.setWorld = function(world)
{
    this.refWorld = world;
}


RubeFilesLoader.prototype.LoadResource = function(resourceNode)
{
    var me = this;
    loadJSON(resourceNode.data, function(rawJson)
    {
        var parsedJson = JSON.parse(rawJson);
        //if(resourceNode.dataType === "track") // if this is a track, we have to invert it (y = -y)
            parsedJson = me.PreprocessRube(parsedJson);
        me.refWorld = loadWorldFromRUBE(parsedJson, me.refWorld);

        if(resourceNode.dataType == "car")
        {
            var carBody = getBodiesByCustomProperty(me.refWorld, "string", "category", "car_body")[0];
            var carTires = getBodiesByCustomProperty(me.refWorld, "string", "category", "wheel");
            var dirJoints = getNamedJoints(me.refWorld, "direction");
            me.cars.push({carBody : carBody, tires : carTires, directionJoints : dirJoints});
        }
        else if (resourceNode.dataType == "track")
        {
            // we've got nothing to do as track is static and just has to be loaded in b2Universe.
            me.trackWalls = getNamedBodies(me.refWorld, "wall");
        }
        if(resourceNode.next != null) //if there are still node to load, we load them. else, we launch the main callback
            me.LoadResource(resourceNode.next);
        else
            me.mainLoaderCallback(me.trackWalls, me.cars);
    });
}


RubeFilesLoader.prototype.PreprocessRube = function(parsedJson)
{
    // invert y on vertices and bodies position 
    for (var i = parsedJson.body.length - 1; i >= 0; i--) 
    {
        var body = parsedJson.body[i];
        //body["massData-center"].y = body["massData-center"].y * -1;
        body.position.y = body.position.y * -1;

        for (var j = body.fixture.length - 1; j >= 0; j--) {
            var fixture = body.fixture[j];
            if(fixture.hasOwnProperty("polygon"))
            {
                for (var k = fixture.polygon.vertices.y.length - 1; k >= 0; k--) 
                {
                    var val = fixture.polygon.vertices.y[k];
                    fixture.polygon.vertices.y[k] = -val;
                }
            }
        };
    };

    // invert y on joint anchors
    if(parsedJson.hasOwnProperty("joint"))
    {
        for (var i = parsedJson.joint.length - 1; i >= 0; i--) {
            var joint = parsedJson.joint[i];
            if(joint.anchorA !== 0)
                joint.anchorA.y = joint.anchorA.y * -1;
            if(joint.anchorB !== 0)
                joint.anchorB.y = joint.anchorB.y * -1;

            joint.upperLimit = - joint.upperLimit;
            joint.lowerLimit = - joint.lowerLimit;
            
        };
    }

    return parsedJson;

}



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
};