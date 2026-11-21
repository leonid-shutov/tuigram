DialogMutation(
  /** @type {DialogMutator<DialogsStoreSelf['setLast']>} */
  (dialog, message) => {
    dialog.lastMessage = message;
  },
);
