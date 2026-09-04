/** @type {LayoutSelf['openChat']} */
(dialog) => {
  const chatId = dialog.chatId;
  if (self.openedChatId !== chatId) {
    self.openedChatId = chatId;
    void store.chat.open(chatId);
  }
  ui.sections.dialogs.select(chatId);
  self.select('chat');
};
