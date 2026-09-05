// Focus moves immediately; the history loads behind it.
/** @type {Actions['openChat']} */
(chatId) => {
  if (store.chat.chatId !== chatId) void self.loadChat(chatId);
  ui.dialogs.select(chatId);
  navigation.select('chat');
};
