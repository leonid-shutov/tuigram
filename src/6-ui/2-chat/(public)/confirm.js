// The bubble a pending message drew is already correct — the text does not change when the
// server acknowledges it. Only the id it is filed under does.
/** @type {ChatSection['confirm']} */
(tempId, messageId) => {
  const bubble = self.bubbles.get(tempId);
  if (bubble === undefined) return;
  self.bubbles.delete(tempId);
  self.bubbles.set(messageId, bubble);
};
