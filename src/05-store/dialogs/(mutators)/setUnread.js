DialogMutation(
  /** @type {DialogMutator<DialogsStoreSelf['setUnread']>} */
  (dialog, unreadCount) => {
    dialog.unreadCount = unreadCount;
  },
);
