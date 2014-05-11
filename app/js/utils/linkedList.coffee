class LinkedListNode
	constructor:()->
		@data = null
		@next = null
		@dataType = null

class LinkedList
	constructor:()->
	  	@firstNode = null
	  	@lastNode = null
	  	@size = 0
	add:(data, dataType)->
		newNode = new LinkedListNode();
		newNode.data = data;
		newNode.dataType = dataType;

		if (@firstNode == null)
			@firstNode = newNode;
			@lastNode = newNode;
		else
			@lastNode.next = newNode;
			@lastNode = newNode;

		@size++;