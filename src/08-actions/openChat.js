/** @type {Actions['openChat']} */
(chatId) => {
  if (store.chat.chatId !== chatId) void actions.loadChat(chatId);
  ui.dialogs.select(chatId);
  navigation.select('chat');
};
