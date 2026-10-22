// A dialog mutator names its chat first and is handed the dialog itself, from the main list or the
// archive; a chat the store has no dialog for is left alone. Change is emitted as by any `Mutation`.
/** @type {typeof DialogMutation} */
(mutate) =>
  Mutation(self, (/** @type {number} */ chatId, /** @type {any} */ ...args) => {
    const dialog = self.find(chatId);
    if (dialog !== null) mutate(dialog, ...args);
  });
