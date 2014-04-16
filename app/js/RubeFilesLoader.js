function RubeFilesLoader(jsonsToLoad)
{
    this.jsonsToLoad = jsonsToLoad; // object containing track and cars[]
    this.cars = [];
    this.tires = [];
    this.track = {};
    this.mainLoaderCallback = null;
    this.refWorld = null;
}

RubeFilesLoader.prototype.load = function(callback)
{
    this.mainLoaderCallback = callback;

    // Loading cars
    if(this.jsonsToLoad.cars.length > 0)
    {
        LoadNextCar(this.jsonsToLoad.cars, this.jsonsToLoad.cars.length, this.mainLoaderCallback, this.cars, this.refWorld);
    }
}

RubeFilesLoader.prototype.setWorld = function(world)
{
    this.refWorld = world;
}

function LoadNextCar(pathArray, index, finalCallBack, carsArray, world)
{
    loadJSON(pathArray[index - 1], function(rawJson)
    {
        world = loadWorldFromRUBE(JSON.parse(rawJson), world);

        var carBody = getBodiesByCustomProperty(world, "string", "category", "car_body")[0];
        var carTires = getBodiesByCustomProperty(world, "string", "category", "wheel");
        carsArray.push({carBody : carBody, tires : carTires});

        if(--index > 0)
            LoadNextCar(pathArray, index, finalCallBack, carsArray, world);
        else
            finalCallBack(null/* HERE THERE SHOULD BE A FUTURE TRACK ARGUMEindexT */, carsArray);
    });
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