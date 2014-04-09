function KeyboardHandler()
{
	this.keyArray = [];
}

KeyboardHandler.prototype.Keys = { accelerate: false, brake: false, left: false, right: false };

KeyboardHandler.prototype.HandleKeyDown = function(event)
{
	var key = event.which;

	if (this.keyArray.indexOf(key) > -1)
		return;
	var knowKey = true;
	
	switch (key)
	{
		case 37: this.Keys.left = true; break;
		case 38: this.Keys.accelerate = true; break;
		case 39: this.Keys.right = true; break;
		case 40: this.Keys.brake = true; break;
		default: knowKey = false;
	}
	if (knowKey) this.keyArray.push(key);
};

KeyboardHandler.prototype.HandleKeyUp = function(event)
{
	var key = event.which;
	var i = this.keyArray.indexOf(key);
	if (i > -1)
		this.keyArray.splice(i, 1);


	switch (key)
	{
		case 37: this.Keys.left = false; break;
		case 38: this.Keys.accelerate = false; break;
		case 39: this.Keys.right = false; break;
		case 40: this.Keys.brake = false; break;
	}
};