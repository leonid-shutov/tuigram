ui.sections.dialogs.on('open', (dialog) => {
  const chatId = dialog.chatId;
  if (self.openedChatId === chatId) return;
  self.openedChatId = chatId;
  ui.sections.chat.open(chatId);
  self.select('chat');
});
