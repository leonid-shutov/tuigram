Mutation(
  self,
  /** @type {DialogsStoreSelf['setReadUpTo']} */
  (chatId, maxReadId) => {
    const dialog = self.find(chatId);
    if (dialog !== null) dialog.readUpTo = Math.max(dialog.readUpTo, maxReadId);
  },
);
