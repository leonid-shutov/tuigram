// The bubble holds the copy of the message it draws, so the cursor never reads the store.
/** @type {() => ChatSection['selectedMessage']} */
() => {
  if (self.selectedMessageId === null) return null;
  return self.views.get(self.selectedMessageId)?.message ?? null;
};
