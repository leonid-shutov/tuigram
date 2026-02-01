async (chatId) => {
  if ($.state.open && $.state.chatId === chatId) return;

  const iterator = messenger.getHistory(chatId, 5);

  $.state.chatId = chatId;
  $.state.opened = true;
  $.state.iterator = iterator;
  $.state.messages = [];
  $.state.stickTo = 'bottom';
  $.state.topMessage = null;

  $.state.startLoading();
  $.state.bottomMessage = $.state.messages[0];
  $.state.selectedMessage = $.state.messages[0];
  $.render();
  const { value: messages } = await iterator.next();
  $.state.uploadMessages(messages);
  $.state.bottomMessage = $.state.messages[0];
  $.state.selectedMessage = $.state.messages[0];
  $.render();
};
