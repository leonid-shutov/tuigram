ui.sections.dialogs.on('open', (dialog) => {
  const chatId = dialog.chatId;
  if (self.openedChatId === chatId) return;
  self.openedChatId = chatId;
  ui.sections.chat.open(chatId);
  ui.sections.dialogs.markRead(chatId);
  void messenger.readHistory(chatId);
  self.select('chat');
});
