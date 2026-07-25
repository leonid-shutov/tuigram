messenger.on('historyRead', ({ chatId, isOutbox, unreadCount }) => {
  if (isOutbox) return;
  ui.sections.dialogs.setUnread(chatId, unreadCount);
});
