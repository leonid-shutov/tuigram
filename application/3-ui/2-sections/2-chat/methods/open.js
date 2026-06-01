async (chatId) => {
  $.iterator = messenger.getHistory(chatId, 20);
  const { value } = await $.iterator.next();
  const messages = value.map((message, index) => ({ ...message, index }));
  $.setMessages(messages);
};
