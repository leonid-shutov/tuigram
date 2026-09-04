/** @type {ChatStoreSelf['clear']} */
() => {
  self.messages = LinkedList.from([]);
  self.readMaxId = 0;
};
