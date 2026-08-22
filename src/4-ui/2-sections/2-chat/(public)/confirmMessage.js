(tempId, confirmedMessage) => {
  const pendingMessage = self.messages.find(({ id }) => id === tempId);
  pendingMessage.id = confirmedMessage.id;
  pendingMessage.pending = false;
  self.renderReceipt();
};
