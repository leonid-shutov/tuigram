(chatId, unreadCount) => {
  const dialog = self.dialogs.find(chatId);
  if (!dialog) return;
  dialog.unreadCount = unreadCount;
  self.render();
};
