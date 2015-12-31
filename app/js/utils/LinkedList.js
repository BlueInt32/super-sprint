"use strict";

var LinkedList = function() {
  this.firstNode = null;
  this.lastNode = null;
  this.size = 0;
};

LinkedList.prototype.add = function(id, data, dataType) {
  var newNode = {
    id: id,
    data: data,
    next: null,
    dataType: dataType
  };

  if (this.firstNode === null) {
    this.firstNode = newNode;
    this.lastNode = newNode;
  } else {
    this.lastNode.next = newNode;
    this.lastNode = newNode;
  }
  this.size += 1;
  return this.size;
};

LinkedList.prototype.removeFirst = function() {

  if (this.firstNode !== null) {
    if (this.firstNode.next !== null) {
      this.firstNode = this.firstNode.next;
      this.size -= 1;
    } else {
      this.firstNode = null;
      this.lastNode = null;
      this.size = 0;
    }
  }
};

LinkedList.prototype.getLength = function(){
	return this.size;
};
module.exports = LinkedList;
