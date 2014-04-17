function LinkedListNode() {
  this.data = null;
  this.next = null;
  this.dataType = null;
}

function LinkedList() {
  this.firstNode = null;
  this.lastNode = null;
  this.size = 0;
}


LinkedList.prototype.add = function(data, dataType)
{
    var newNode = new LinkedListNode();
    newNode.data = data;
    newNode.dataType = dataType;

    if (this.firstNode == null)
    {
        this.firstNode = newNode;
        this.lastNode = newNode;
    }
    else
    {
        this.lastNode.next = newNode;
        this.lastNode = newNode;
    }

    this.size++;
};