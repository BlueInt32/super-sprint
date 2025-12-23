class LinkedList {
  firstNode: any;
  lastNode: any;
  size: number;

  constructor() {
    this.firstNode = null;
    this.lastNode = null;
    this.size = 0;
  }

  add(id: string, data: any, dataType: string) {
    const newNode = {
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
  }

  removeFirst() {
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
  }

  getLength() {
    return this.size;
  }
}

export default LinkedList;
