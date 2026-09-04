// The server's version of a message we sent optimistically. It carries a different id, so the
// chat has to re-key its bubble — hence the tempId in the event.
/** @type {ChatStore['confirm']} */
(tempId, message) => {
  const node = self.messages.findNode(({ id }) => id === tempId);
  if (node === null) return;
  node.value = message;
  self.emit('confirmed', { tempId, message });
};
