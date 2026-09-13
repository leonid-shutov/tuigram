/** @type {ChatSection['confirm']} */
(tempId, messageId) => {
  const bubble = self.bubbles.get(tempId);
  if (bubble === undefined) return;
  self.bubbles.delete(tempId);
  self.bubbles.set(messageId, bubble);
};
