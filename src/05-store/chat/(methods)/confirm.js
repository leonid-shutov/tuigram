// The stream may have delivered the server's copy before `send` returned it: then the pending
// entry simply goes. A pending entry already dropped is nothing to confirm.
/** @type {ChatStore['confirm']} */
(tempId, message) => {
  const index = self.messages.findIndex(({ id }) => id === tempId);
  if (index === -1) return;
  if (self.hasConfirmed(message.id)) self.messages.splice(index, 1);
  else self.messages[index] = message;
};
