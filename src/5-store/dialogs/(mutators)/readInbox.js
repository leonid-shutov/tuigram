DialogMutation(
  /** @type {DialogMutator<DialogsStoreSelf['readInbox']>} */
  (dialog, maxReadId, unreadCount) => {
    dialog.inboxReadUpTo = Math.max(dialog.inboxReadUpTo, maxReadId);
    dialog.unreadCount = unreadCount;
  },
);
