/** @type {ChatSelf['confirmMessage']} */
(tempId, confirmedMessage) => {
  const node = self.messages.findNode(({ id }) => id === tempId);
  if (node === null) return;
  node.value = { ...confirmedMessage, bubble: node.value.bubble };
  self.renderReceipt();
};
