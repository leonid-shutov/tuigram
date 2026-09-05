// Swap a pending message for the one the server acknowledged. Returns false when the chat
// was switched out from under the send.
/** @type {ChatStore['confirm']} */
(tempId, message) => {
  const index = self.messages.findIndex(({ id }) => id === tempId);
  if (index === -1) return false;
  self.messages[index] = message;
  return true;
};
