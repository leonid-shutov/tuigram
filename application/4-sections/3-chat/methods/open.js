async (chatId) => {
  module.state.chatId = chatId;
  const iterator = messenger.getHistory(chatId, 50);
  module.state.iterator = iterator;
  const { value: messages } = await iterator.next();
  module.ui.setMessages(messages);
};
