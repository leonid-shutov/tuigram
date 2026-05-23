async (chatId, iterator) => {
  $.chatId = chatId;
  $.opened = true;
  $.iterator = iterator;
  $.messages = [];
  $.startLoading();
  const { value: messages } = await iterator.next();
  $.uploadMessages(messages);
  $.stickTo = 'bottom';
  $.bottomMessage = $.messages[0];
  $.topMessage = null;
  $.selectedMessage = $.messages[0];
};
