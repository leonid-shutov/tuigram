/** @type {ChatSelf['confirmMessage']} */
(tempId, confirmedMessage) => {
  const pendingMessage = self.messages.find(({ id }) => id === tempId);
  if (pendingMessage === null) return;
  pendingMessage.id = confirmedMessage.id;
  pendingMessage.pending = false;
  self.renderReceipt();
};
