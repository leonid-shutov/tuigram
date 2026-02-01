() => {
  const messages = $.state.getMessages();
  $.ui.setMessages(messages, $.state.stickTo);
};
