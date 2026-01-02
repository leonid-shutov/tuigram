async (chatId) => {
  const iterator = messenger.getHistory(chatId, 50);
  const currentPage = await $.state.open(chatId, iterator);
  $.ui.setMessages(currentPage);
};
