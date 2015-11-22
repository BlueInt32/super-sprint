var linkedListMaker = function() {

  var that = {};

  that.firstNode = null;
  that.lastNode = null;
  that.size = 0;

  that.add = function(data, dataType) {
    var newNode = {
      data: data,
      next: null,
      dataType: dataType
    };

    if (that.firstNode === null) {
      that.firstNode = newNode;
      that.lastNode = newNode;
    } else {
      that.lastNode.next = newNode;
      that.lastNode = newNode;
    }
    that.size += 1;
    return that.size;
  };

  that.removeFirst = function() {

    if (that.firstNode !== null) {
      if (that.firstNode.next !== null) {
        that.firstNode = that.firstNode.next;
      } else {
        that.firstNode = null;
        that.lastNode = null;
        that.size = 0;
      }
    }
  };

  return that;

};

module.exports = linkedListMaker;