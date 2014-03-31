'use strict';

function Car(color)
{
	this.color = color;
	console.log('car instantiated');
}

Car.prototype.color = '#00000';

Car.prototype.sayColor = function()
{
	console.log("I'm "+ this.color);
};



var redCar = new Car('#F00');
var carColorTeller = redCar.sayColor;

redCar.sayColor();
carColorTeller.call(redCar);