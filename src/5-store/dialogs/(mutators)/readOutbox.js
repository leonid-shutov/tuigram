DialogMutation(
  /** @type {DialogMutator<DialogsStoreSelf['readOutbox']>} */
  (dialog, maxReadId) => {
    dialog.outboxReadUpTo = Math.max(dialog.outboxReadUpTo, maxReadId);
  },
);
