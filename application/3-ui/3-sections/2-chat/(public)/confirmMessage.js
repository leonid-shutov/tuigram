(tempId, confirmedMessage) => {
  const pendingMessage = self.messages.find(({ id }) => id === tempId);
  pendingMessage.id = confirmedMessage.id;
};
