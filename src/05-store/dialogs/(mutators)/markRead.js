DialogMutation(
  /** @type {DialogMutator<DialogsStoreSelf['markRead']>} */
  (dialog) => {
    dialog.unreadCount = 0;
    dialog.isUnread = false;
    const lastIds = dialog.lastMessage?.partIds ?? [];
    dialog.inboxReadUpTo = Math.max(dialog.inboxReadUpTo, ...lastIds);
  },
);
