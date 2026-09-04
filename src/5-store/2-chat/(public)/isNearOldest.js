/** @type {ChatStore['isNearOldest']} */
(id, within) => {
  const node = self.messages.findNode((message) => message.id === id);
  return node !== null && self.messages.isNearHead(node, within);
};
