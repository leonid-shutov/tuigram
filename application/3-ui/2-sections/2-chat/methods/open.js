async (chatId) => {
  $.iterator = messenger.getHistory(chatId, 5);
  const { value: messages } = await $.iterator.next();
  $.setMessages(messages);
};
