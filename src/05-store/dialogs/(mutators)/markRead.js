DialogMutation(
  /** @type {DialogMutator<DialogsStoreSelf['markRead']>} */
  (dialog) => {
    dialog.unreadCount = 0;
    dialog.isUnread = false;
  },
);
