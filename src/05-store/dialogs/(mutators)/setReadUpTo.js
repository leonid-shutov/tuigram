DialogMutation(
  /** @type {DialogMutator<DialogsStoreSelf['setReadUpTo']>} */
  (dialog, maxReadId) => {
    dialog.readUpTo = Math.max(dialog.readUpTo, maxReadId);
  },
);
