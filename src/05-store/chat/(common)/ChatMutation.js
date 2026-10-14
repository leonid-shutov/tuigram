// A chat mutator names its chat first and is handed the cached chat itself; a chat that isn't
// cached is left alone, and the mutator answers null. Change is emitted as by any `Mutation`, so
// only the open chat repaints.
/** @type {typeof ChatMutation} */
(mutate) =>
  Mutation(self, (/** @type {number} */ chatId, /** @type {any} */ ...args) => {
    const chat = self.getById(chatId);
    return chat === null ? null : mutate(chat, ...args);
  });
