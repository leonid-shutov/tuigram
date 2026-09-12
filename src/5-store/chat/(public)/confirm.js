/** @type {ChatStore['confirm']} */
(tempId, message) => {
  const index = self.messages.findIndex(({ id }) => id === tempId);
  if (index === -1) return 'gone';
  if (self.hasConfirmed(message.id)) {
    self.messages.splice(index, 1);
    return 'dropped';
  }
  self.messages[index] = message;
  return 'confirmed';
};
