/** @type {ChatSelf['clear']} */
() => {
  self.messages = LinkedList.from([]);
  self.readUpTo = 0;
  self.renderReceipt();
  for (const child of self.component.getChildren()) child.destroy();
};
