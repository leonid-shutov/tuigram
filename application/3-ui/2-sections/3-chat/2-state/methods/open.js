async (chatId, iterator) => {
  $.chatId = chatId;
  const { value: messages } = await iterator.next();
  $.messages = messages;
  return $.getCurrentPage();
};
