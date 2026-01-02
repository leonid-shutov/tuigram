() => {
  const dialogs = $.state.open();
  $.ui.setDialogs(dialogs);
  $.emit('open', $.state.opened.chatId);
};
