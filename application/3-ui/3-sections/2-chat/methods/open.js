async (chatId) => {
  if ($.chatId === chatId) return;
  $.chatId = chatId;
  $.clear();
  $.iterator = messenger.getHistory(chatId, 20);
  const { value } = await $.iterator.next();
  const messages = value.toReversed();
  for (const message of messages) $.addMessage(message);
  $.selectMessage($.messages.tail);
};
