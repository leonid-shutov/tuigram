async (chatId) => {
  if ($.chatId === chatId) return;
  $.chatId = chatId;
  $.iterator = messenger.getHistory(chatId, 20);
  const { value } = await $.iterator.next();
  const messages = value.map((message, index) => ({ ...message, index }));
  messages.reverse();
  $.setMessages(messages);
};
