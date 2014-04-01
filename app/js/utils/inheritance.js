﻿/**
* Inherits the prototype of a parent object.
*
* @method inherits
* @param child {Function} The Child to inherit the prototype
* @param parent {Function} The Parent to inherit from
* @param proto {Object} The prototype to apply to the child
*/
PIXI.inherits = function (child, parent, proto)
{
	proto = proto || {};

	//get the property descriptors from the child proto and the passed proto
	var desc = {};
	console.log(child.prototype);
	[child.prototype, proto].forEach(function (s)
	{
		Object.getOwnPropertyNames(s).forEach(function (k)
		{
			desc[k] = Object.getOwnPropertyDescriptor(s, k);
		});
	});

	//set the constructor descriptor
	desc.constructor = {
		value: child,
		enumerable: false,
		writable: true,
		configurable: true
	};

	//create the prototype
	child.prototype = Object.create(parent.prototype, desc);
};