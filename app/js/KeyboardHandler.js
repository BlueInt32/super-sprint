function KeyboardHandler()
{
}

KeyboardHandler.prototype.Keys = { accelerate: false, brake: false, left: false, right: false };

KeyboardHandler.prototype.HandleKeyDown = function(event)
{
	console.log("top");
	var key = event.which;
	switch (key)
	{
		case 37: this.Keys.left = true; break;
		case 38: this.Keys.accelerate = true; break;
		case 39: this.Keys.right = true; break;
		case 40: this.Keys.brake = true; break;
	}
};

KeyboardHandler.prototype.HandleKeyUp = function(event)
{
	var key = event.which;
	switch (key)
	{
		case 37: this.Keys.left = false; break;
		case 38: this.Keys.accelerate = false; break;
		case 39: this.Keys.right = false; break;
		case 40: this.Keys.brake = false; break;
	}
};