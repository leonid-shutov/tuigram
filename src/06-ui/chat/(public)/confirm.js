/** @type {ChatSection['confirm']} */
(tempId, messageId) => {
  const entry = self.bubbles.get(tempId);
  if (entry === undefined) return;
  self.bubbles.delete(tempId);
  self.bubbles.set(messageId, entry);
};
