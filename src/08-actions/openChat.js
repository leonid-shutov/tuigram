/** @type {Actions['openChat']} */
(chatId) => {
  if (!store.chat.isOpen(chatId)) void actions.loadChat(chatId);
  ui.dialogs.select(chatId);
  navigation.select('chat');
};
