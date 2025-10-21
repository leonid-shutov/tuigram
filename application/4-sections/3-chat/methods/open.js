async (chatId) => {
  const messages = await messenger.getChat(chatId);
  module.ui.setMessages(messages);
};
