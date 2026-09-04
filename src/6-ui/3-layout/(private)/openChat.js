/** @type {LayoutSelf['openChat']} */
(dialog) => {
  const chatId = dialog.chatId;
  if (self.openedChatId !== chatId) {
    self.openedChatId = chatId;
    ui.sections.chat.open(chatId);
    store.dialogs.markRead(chatId);
    void messenger.readHistory(chatId);
  }
  ui.sections.dialogs.select(chatId);
  self.select('chat');
};
